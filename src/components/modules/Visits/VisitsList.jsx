import React, { useState, useContext, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Plus, Calendar, Search, Download } from 'lucide-react';
import useTranslation from '../../../hooks/useTranslation';
import { ToastContext } from '../../../contexts/AppContext';
import { DataContext } from '../../../contexts/DataContext';
import { db } from '../../../services/db';
import Modal from '../../common/Modal';
import VisitForm from './VisitForm';
import CompleteVisitForm from './CompleteVisitForm';
import PageTransition from '../../common/PageTransition';
import * as XLSX from 'xlsx';
import { formatDate } from '../../../utils/helpers';

// Extracted components
import VisitsCalendar from './components/VisitsCalendar';
import VisitCard from './components/VisitCard';
import VisitsStats from './components/VisitsStats';

const VisitsList = () => {
    const { visits, stores, settings, refreshData: onRefresh } = useContext(DataContext);
    const { openTaskDialog } = useOutletContext();
    const onCreateTask = (storeId) => openTaskDialog(storeId);
    const t = useTranslation();
    const { showToast } = useContext(ToastContext);

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [showComplete, setShowComplete] = useState(null);
    const [editVisit, setEditVisit] = useState(null);

    // View state
    const [activeTab, setActiveTab] = useState('scheduled');
    const [storeFilter, setStoreFilter] = useState('');
    const [viewMode, setViewMode] = useState('list');
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Statistics
    const stats = useMemo(() => {
        const now = new Date();
        const todayStr = now.toDateString();
        const completedVisits = visits.filter(v => v.status === 'completed');
        const effectiveVisits = completedVisits.filter(v => v.is_effective);

        return {
            total: visits.length,
            scheduled: visits.filter(v => v.status === 'scheduled').length,
            completed: completedVisits.length,
            today: visits.filter(v => v.date && new Date(v.date).toDateString() === todayStr).length,
            overdue: visits.filter(v => {
                if (!v.date || v.status === 'completed') return false;
                const visitDate = new Date(v.date);
                return visitDate < now && visitDate.toDateString() !== todayStr;
            }).length,
            effectiveRate: completedVisits.length > 0
                ? Math.round((effectiveVisits.length / completedVisits.length) * 100)
                : 0
        };
    }, [visits]);

    // Filter logic
    const matchesSearch = (visit) => {
        if (!searchQuery.trim()) return true;
        const store = stores.find(s => s.id === visit.store_id);
        const query = searchQuery.toLowerCase();
        return (
            store?.name?.toLowerCase().includes(query) ||
            visit.type?.toLowerCase().includes(query) ||
            visit.reason?.toLowerCase().includes(query) ||
            visit.note?.toLowerCase().includes(query)
        );
    };

    const getFilteredVisits = () => {
        let filtered = visits.filter(v => v.status === activeTab);
        if (storeFilter) filtered = filtered.filter(v => v.store_id === storeFilter);
        filtered = filtered.filter(matchesSearch);
        return filtered.sort((a, b) => {
            if (activeTab === 'scheduled') return new Date(a.date) - new Date(b.date);
            return new Date(b.date) - new Date(a.date);
        });
    };

    // Export to Excel
    const handleExportVisits = () => {
        const exportData = visits.map(visit => {
            const store = stores.find(s => s.id === visit.store_id);
            return {
                'Store': store?.name || '-',
                'Date': visit.date ? formatDate(visit.date) : '-',
                'Type': visit.type || '-',
                'Reason': visit.reason || '-',
                'Status': visit.status || 'scheduled',
                'Effective': visit.is_effective ? 'Yes' : (visit.is_effective === false ? 'No' : '-'),
                'Note': visit.note || '-'
            };
        });

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Visits');
        ws['!cols'] = [{ wch: 25 }, { wch: 15 }, { wch: 12 }, { wch: 15 }, { wch: 12 }, { wch: 10 }, { wch: 40 }];
        XLSX.writeFile(wb, `visits_${new Date().toISOString().split('T')[0]}.xlsx`);
        showToast('Visits exported successfully!', 'success');
    };

    const openMapLink = (storeId) => {
        const store = stores.find(s => s.id === storeId);
        if (store?.map_link) {
            window.open(store.map_link, '_blank');
        } else {
            showToast('No map link available for this store', 'warning');
        }
    };

    // CRUD handlers
    const handleSave = async (visitData) => {
        try {
            const table = await db.from('visits');
            if (editVisit) {
                const { error } = await table.update(editVisit.id, visitData);
                if (error) { showToast(error.userMessage || 'Error updating visit.', 'error'); return; }
            } else {
                const { error } = await table.insert(visitData);
                if (error) { showToast(error.userMessage || 'Error creating visit.', 'error'); return; }
            }
            showToast(t('savedSuccess'), 'success');
            setShowModal(false);
            setEditVisit(null);
            onRefresh();
        } catch (err) {
            showToast('Unexpected error. Please try again.', 'error');
        }
    };

    const handleComplete = async (visit, isEffective, createFollowUp) => {
        try {
            const table = await db.from('visits');
            const { error } = await table.update(visit.id, { status: 'completed', is_effective: isEffective });
            if (error) { showToast(error.userMessage || 'Error completing visit.', 'error'); return; }
            if (isEffective) {
                const storesTable = await db.from('stores');
                await storesTable.update(visit.store_id, { last_visit: new Date().toISOString() });
            }
            showToast(t('savedSuccess'), 'success');
            setShowComplete(null);
            onRefresh();
            if (createFollowUp) onCreateTask(visit.store_id);
        } catch (err) {
            showToast('Error completing visit.', 'error');
        }
    };

    const handleDelete = async (visitId) => {
        try {
            const table = await db.from('visits');
            const { error } = await table.delete(visitId);
            if (error) { showToast(error.userMessage || 'Error deleting visit.', 'error'); return; }
            showToast(t('deletedSuccess'), 'success');
            onRefresh();
        } catch (err) {
            showToast('Error deleting visit.', 'error');
        }
    };

    const scheduledCount = visits.filter(v => v.status === 'scheduled').length;
    const completedCount = visits.filter(v => v.status === 'completed').length;

    return (
        <PageTransition>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold dark:text-white">{t('visits')}</h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{visits.length} visits total</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
                            <button
                                onClick={() => setViewMode('list')}
                                aria-label="List view"
                                className={`px-3 py-2 rounded-md text-sm transition-colors min-h-[40px] ${viewMode === 'list' ? 'bg-white dark:bg-slate-600 shadow-sm text-primary-600 font-medium' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                📋 List
                            </button>
                            <button
                                onClick={() => setViewMode('calendar')}
                                aria-label="Calendar view"
                                className={`px-3 py-2 rounded-md text-sm transition-colors min-h-[40px] ${viewMode === 'calendar' ? 'bg-white dark:bg-slate-600 shadow-sm text-primary-600 font-medium' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                📅 Calendar
                            </button>
                        </div>
                        <button
                            onClick={() => { setEditVisit(null); setShowModal(true); }}
                            aria-label={t('newVisit')}
                            className="flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-gradient-to-r from-primary-600 to-indigo-700 hover:from-primary-700 hover:to-indigo-800 text-white rounded-xl transition-all shadow-lg shadow-primary-500/25 min-h-[44px] active:scale-[0.98]"
                        >
                            <Plus size={20} /><span className="hidden sm:inline">{t('newVisit')}</span><span className="sm:hidden">Add</span>
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <VisitsStats stats={stats} />

                {/* Search and Export */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search visits by store, type, or reason..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            aria-label="Search visits"
                            className="w-full pl-10 pr-4 py-2.5 border rounded-xl dark:bg-slate-800 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">✕</button>
                        )}
                    </div>
                    <button
                        onClick={handleExportVisits}
                        aria-label="Export visits to Excel"
                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl transition-colors min-h-[44px]"
                    >
                        <Download size={18} /><span>Export Excel</span>
                    </button>
                </div>

                {/* List View */}
                {viewMode === 'list' && (
                    <>
                        {/* Tabs */}
                        <div className="flex items-center gap-4 border-b dark:border-slate-700">
                            <button
                                onClick={() => setActiveTab('scheduled')}
                                aria-label="Show scheduled visits"
                                className={`pb-3 px-2 border-b-2 transition-colors min-h-[44px] ${activeTab === 'scheduled' ? 'border-primary-600 text-primary-600 font-medium' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                            >
                                📅 <span className="hidden sm:inline">Scheduled</span> <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-emerald-100 text-emerald-700">{scheduledCount}</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('completed')}
                                aria-label="Show completed visits"
                                className={`pb-3 px-2 border-b-2 transition-colors min-h-[44px] ${activeTab === 'completed' ? 'border-primary-600 text-primary-600 font-medium' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                            >
                                ✅ <span className="hidden sm:inline">Completed</span> <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-emerald-100 text-emerald-700">{completedCount}</span>
                            </button>
                        </div>

                        {/* Store Filter */}
                        <div className="flex flex-wrap gap-3">
                            <select
                                value={storeFilter}
                                onChange={e => setStoreFilter(e.target.value)}
                                aria-label="Filter by store"
                                className="px-4 py-2.5 border rounded-xl dark:bg-slate-700 dark:border-slate-600 dark:text-white min-h-[44px]"
                            >
                                <option value="">{t('all')} - {t('stores')}</option>
                                {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                            {storeFilter && (
                                <button onClick={() => setStoreFilter('')} className="text-sm text-emerald-600 hover:underline">
                                    {t('clearFilters')}
                                </button>
                            )}
                        </div>

                        {/* Visits List */}
                        {getFilteredVisits().length > 0 ? (
                            <div className="space-y-3">
                                {getFilteredVisits().map(visit => (
                                    <VisitCard
                                        key={visit.id}
                                        visit={visit}
                                        store={stores.find(s => s.id === visit.store_id)}
                                        activeTab={activeTab}
                                        onComplete={setShowComplete}
                                        onEdit={(v) => { setEditVisit(v); setShowModal(true); }}
                                        onDelete={handleDelete}
                                        onOpenMap={openMapLink}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <Calendar size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                                <p className="text-slate-500 dark:text-slate-400">{activeTab === 'scheduled' ? 'No scheduled visits' : 'No completed visits'}</p>
                            </div>
                        )}
                    </>
                )}

                {/* Calendar View */}
                {viewMode === 'calendar' && (
                    <VisitsCalendar
                        currentMonth={currentMonth}
                        setCurrentMonth={setCurrentMonth}
                        visits={visits}
                        stores={stores}
                        selectedDate={selectedDate}
                        setSelectedDate={setSelectedDate}
                        onComplete={setShowComplete}
                        onEdit={(v) => { setEditVisit(v); setShowModal(true); }}
                    />
                )}

                {/* Modals */}
                <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditVisit(null); }} title={editVisit ? t('edit') : t('newVisit')}>
                    <VisitForm visit={editVisit} stores={stores} settings={settings} onSave={handleSave} onCancel={() => setShowModal(false)} />
                </Modal>
                <Modal isOpen={!!showComplete} onClose={() => setShowComplete(null)} title={t('complete')}>
                    <CompleteVisitForm visit={showComplete} onComplete={handleComplete} onCancel={() => setShowComplete(null)} />
                </Modal>
            </div>
        </PageTransition>
    );
};

export default VisitsList;
