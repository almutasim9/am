import React, { useState, useContext } from 'react';
import { Trash2, Plus, Store, CheckSquare, Calendar, AlertCircle, Upload } from 'lucide-react';
import useTranslation from '../../../hooks/useTranslation';
import { ToastContext } from '../../../contexts/AppContext';
import { DataContext } from '../../../contexts/DataContext';
import { db } from '../../../services/db';
import PageTransition from '../../common/PageTransition';

const SettingsPanel = () => {
    const { settings, refreshData: onRefresh } = useContext(DataContext);
    const t = useTranslation();
    const { showToast } = useContext(ToastContext);
    const [localSettings, setLocalSettings] = useState(settings);
    const [newItem, setNewItem] = useState('');
    const [activeTab, setActiveTab] = useState('zones');
    const [newCat, setNewCat] = useState('');
    const [newSub, setNewSub] = useState('');
    const [selectedCat, setSelectedCat] = useState('');

    const tabs = [
        { id: 'zones', label: 'Zones' },
        { id: 'visitTypes', label: 'Visit Types' },
        { id: 'visitReasons', label: 'Visit Reasons' },
        { id: 'contactRoles', label: 'Contact Roles' },
        { id: 'storeCategories', label: 'Store Categories' },
        { id: 'taskCategories', label: 'Task Categories' },
        { id: 'reports', label: 'Reports' },
        { id: 'backup', label: 'Backup' }
    ];

    const handleAddItem = async (key) => {
        if (!newItem.trim()) return;
        const previousSettings = { ...localSettings };
        const updated = { ...localSettings, [key]: [...(localSettings[key] || []), newItem.trim()] };
        setLocalSettings(updated);

        const result = await db.updateSettings(updated);
        if (result?.error) {
            console.error('[Settings] Add error:', result.error);
            setLocalSettings(previousSettings);
            showToast(t('errorOccurred') || 'Error occurred', 'error');
            return;
        }

        setNewItem('');
        showToast(t('savedSuccess'), 'success');
        await onRefresh();
    };

    const handleDeleteItem = async (key, item) => {
        const previousSettings = { ...localSettings };
        const updated = { ...localSettings, [key]: localSettings[key].filter(i => i !== item) };
        setLocalSettings(updated);

        const result = await db.updateSettings(updated);
        if (result?.error) {
            console.error('[Settings] Delete error:', result.error);
            setLocalSettings(previousSettings); // Revert on error
            showToast(t('errorOccurred') || 'Error occurred', 'error');
            return;
        }

        showToast(t('deletedSuccess'), 'success');
        await onRefresh();
    };

    const handleAddCategory = async () => {
        if (!newCat.trim()) return;
        const updated = { ...localSettings, taskCategories: { ...localSettings.taskCategories, [newCat.trim()]: [] } };
        setLocalSettings(updated);
        await db.updateSettings(updated);
        setNewCat('');
        showToast(t('savedSuccess'), 'success');
        onRefresh();
    };

    const handleAddSubTask = async () => {
        if (!selectedCat || !newSub.trim()) return;
        const cats = { ...localSettings.taskCategories };
        cats[selectedCat] = [...(cats[selectedCat] || []), newSub.trim()];
        const updated = { ...localSettings, taskCategories: cats };
        setLocalSettings(updated);
        await db.updateSettings(updated);
        setNewSub('');
        showToast(t('savedSuccess'), 'success');
        onRefresh();
    };

    const handleDeleteSubTask = async (cat, sub) => {
        const cats = { ...localSettings.taskCategories };
        cats[cat] = cats[cat].filter(s => s !== sub);
        const updated = { ...localSettings, taskCategories: cats };
        setLocalSettings(updated);
        await db.updateSettings(updated);
        showToast(t('deletedSuccess'), 'success');
        onRefresh();
    };

    const handleDeleteCategory = async (cat) => {
        const cats = { ...localSettings.taskCategories };
        delete cats[cat];
        const updated = { ...localSettings, taskCategories: cats };
        setLocalSettings(updated);
        await db.updateSettings(updated);
        showToast(t('deletedSuccess'), 'success');
        onRefresh();
    };

    // Export functions
    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        showToast('Copied to clipboard', 'success');
    };

    const handleExportCSV = (type) => {
        // Implementation would go here - for now just a toast
        showToast(`Exporting ${type} report...`, 'info');
        // Mock export logic
        setTimeout(() => {
            const csvContent = "data:text/csv;charset=utf-8,ID,Name,Date\n1,Test,2023-01-01";
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `${type}_report_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }, 1000);
    };

    const renderListEditor = (key) => (
        <div className="space-y-3">
            <div className="flex gap-2">
                <input type="text" value={newItem} onChange={e => setNewItem(e.target.value)} placeholder={t('addNew')}
                    className="flex-1 px-4 py-2.5 border rounded-xl dark:bg-slate-700 dark:border-slate-600 dark:text-white min-h-[44px]" />
                <button onClick={() => handleAddItem(key)} className="px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl min-w-[44px] min-h-[44px] active:bg-primary-800">
                    <Plus size={20} />
                </button>
            </div>
            <div className="space-y-2">
                {(localSettings[key] || []).map(item => (
                    <div key={item} className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-700 rounded-xl min-h-[52px]">
                        <span className="dark:text-white">{item}</span>
                        <button onClick={() => handleDeleteItem(key, item)} className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded min-w-[40px] min-h-[40px] active:bg-red-200">
                            <Trash2 size={18} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderTaskCategories = () => (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-3">
                <h4 className="font-medium dark:text-white">Main Categories</h4>
                <div className="flex gap-2">
                    <input type="text" value={newCat} onChange={e => setNewCat(e.target.value)} placeholder={t('addNew')}
                        className="flex-1 px-4 py-2 border rounded-xl dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                    <button onClick={handleAddCategory} className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl">
                        <Plus size={20} />
                    </button>
                </div>
                <div className="space-y-2">
                    {Object.keys(localSettings.taskCategories || {}).map(cat => (
                        <div key={cat} className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors
                ${selectedCat === cat ? 'bg-primary-100 dark:bg-primary-900/30 border-2 border-primary-500' : 'bg-slate-50 dark:bg-slate-700'}`}
                            onClick={() => setSelectedCat(cat)}>
                            <span className="dark:text-white">{cat}</span>
                            <button onClick={(e) => { e.stopPropagation(); handleDeleteCategory(cat); }} className="p-1 text-red-500 hover:bg-red-100 rounded">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
            <div className="space-y-3">
                <h4 className="font-medium dark:text-white">Sub-tasks {selectedCat ? `(${selectedCat})` : ''}</h4>
                {selectedCat ? (
                    <>
                        <div className="flex gap-2">
                            <input type="text" value={newSub} onChange={e => setNewSub(e.target.value)} placeholder={t('addNew')}
                                className="flex-1 px-4 py-2 border rounded-xl dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                            <button onClick={handleAddSubTask} className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl">
                                <Plus size={20} />
                            </button>
                        </div>
                        <div className="space-y-2">
                            {(localSettings.taskCategories[selectedCat] || []).map(sub => (
                                <div key={sub} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-xl">
                                    <span className="dark:text-white">{sub}</span>
                                    <button onClick={() => handleDeleteSubTask(selectedCat, sub)} className="p-1 text-red-500 hover:bg-red-100 rounded">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </>
                ) : <p className="text-slate-500 dark:text-slate-400">Select a category first</p>}
            </div>
        </div>
    );

    const renderReports = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <div className="flex items-center gap-3 mb-2">
                        <Store className="text-primary-600" />
                        <h4 className="font-bold dark:text-white">Stores Data</h4>
                    </div>
                    <p className="text-sm text-slate-500 mb-4 h-10">Complete list of stores with status and visit dates.</p>
                    <button onClick={() => handleExportCSV('stores')} className="w-full py-2 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors flex items-center justify-center gap-2">
                        <Upload size={16} className="rotate-180" /> Export CSV
                    </button>
                </div>

                <div className="p-4 border dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <div className="flex items-center gap-3 mb-2">
                        <CheckSquare className="text-emerald-600" />
                        <h3 className="font-bold dark:text-white">Tasks & Progress</h3>
                    </div>
                    <p className="text-sm text-slate-500 mb-4 h-10">Detailed report of completed and overdue tasks.</p>
                    <button onClick={() => handleExportCSV('tasks')} className="w-full py-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors flex items-center justify-center gap-2">
                        <Upload size={16} className="rotate-180" /> Export CSV
                    </button>
                </div>

                <div className="p-4 border dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <div className="flex items-center gap-3 mb-2">
                        <Calendar className="text-amber-600" />
                        <h3 className="font-bold dark:text-white">Field Visits</h3>
                    </div>
                    <p className="text-sm text-slate-500 mb-4 h-10">Visit log with results and notes.</p>
                    <button onClick={() => handleExportCSV('visits')} className="w-full py-2 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 transition-colors flex items-center justify-center gap-2">
                        <Upload size={16} className="rotate-180" /> Export CSV
                    </button>
                </div>

                <div className="p-4 border dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <div className="flex items-center gap-3 mb-2">
                        <AlertCircle className="text-red-600" />
                        <h3 className="font-bold dark:text-white">At-Risk Stores</h3>
                    </div>
                    <p className="text-sm text-slate-500 mb-4 h-10">Stores not visited for a long time.</p>
                    <button onClick={() => handleExportCSV('risk')} className="w-full py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center gap-2">
                        <Upload size={16} className="rotate-180" /> Export CSV
                    </button>
                </div>
            </div>
        </div>
    );

    const renderBackup = () => {
        const handleBackupExport = () => {
            const data = JSON.parse(localStorage.getItem('crm_data') || '{}');
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `crm_backup_${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
            showToast('Backup exported successfully!', 'success');
        };

        const handleBackupImport = (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const data = JSON.parse(event.target.result);
                    localStorage.setItem('crm_data', JSON.stringify(data));
                    showToast('Backup restored! Refreshing...', 'success');
                    setTimeout(() => window.location.reload(), 1500);
                } catch (err) {
                    showToast('Invalid backup file', 'error');
                }
            };
            reader.readAsText(file);
        };

        const handleGlobalExport = () => {
            // Placeholder for global export logic
            showToast('Exporting all data to Excel...', 'info');
        };

        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Export Backup */}
                    <div className="p-6 border-2 border-dashed border-primary-300 dark:border-primary-700 rounded-2xl bg-primary-50 dark:bg-primary-900/20">
                        <div className="text-center">
                            <Upload size={48} className="mx-auto text-primary-600 mb-4 rotate-180" />
                            <h4 className="text-xl font-bold dark:text-white mb-2">Export Everything</h4>
                            <p className="text-sm text-slate-500 mb-6">Create a full backup of all your data in Excel format.</p>
                            <button
                                onClick={handleGlobalExport}
                                className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium transition-colors"
                            >
                                Export Backup
                            </button>
                        </div>
                    </div>

                    {/* Import Component */}
                    <div className="p-6 border-2 border-dashed border-primary-300 dark:border-primary-700 rounded-2xl bg-primary-50 dark:bg-primary-900/20">
                        <div className="text-center">
                            <Upload size={48} className="mx-auto text-primary-600 mb-4" />
                            <h4 className="text-xl font-bold dark:text-white mb-2">Import Data</h4>
                            <p className="text-sm text-slate-500 mb-6">Upload Excel files to bulk import stores or tasks.</p>
                            <label className="inline-block px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium cursor-pointer transition-colors">
                                Upload Backup
                                <input
                                    type="file"
                                    accept=".json"
                                    onChange={handleBackupImport}
                                    className="hidden"
                                />
                            </label>
                        </div>
                    </div>
                </div>

                {/* Warning */}
                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <h4 className="font-medium text-amber-800 dark:text-amber-400">Important</h4>
                            <p className="text-sm text-amber-700 dark:text-amber-500">
                                Restoring a backup will replace all current data. Make sure to export your current data first.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <PageTransition>
            <div className="space-y-6">
                <h1 className="text-2xl font-bold dark:text-white">Settings</h1>
                <div className="flex flex-wrap gap-2">
                    {tabs.map(tab => (
                        <button key={tab.id} onClick={() => { setActiveTab(tab.id); setNewItem(''); }}
                            className={`px-4 py-2 rounded-xl transition-colors ${activeTab === tab.id
                                ? 'bg-primary-600 text-white' : 'bg-slate-100 dark:bg-slate-700 dark:text-white hover:bg-slate-200'}`}>
                            {tab.label}
                        </button>
                    ))}
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6">
                    {activeTab === 'taskCategories' ? renderTaskCategories() :
                        activeTab === 'reports' ? renderReports() :
                            activeTab === 'backup' ? renderBackup() :
                                renderListEditor(activeTab)}
                </div>
            </div>
        </PageTransition>
    );
};

export default SettingsPanel;

