import React, { useState, useContext, useRef, useEffect } from 'react';
import { useOutletContext, useParams, useNavigate } from 'react-router-dom';
import { Search, Store, Menu, Phone, ChevronRight, Edit2, Archive, Upload, Plus, Trash2, CalendarPlus, Tag as TagIcon } from 'lucide-react';
import { read, utils } from 'xlsx';
import useTranslation from '../../../hooks/useTranslation';
import { ToastContext, LangContext } from '../../../contexts/AppContext';
import { DataContext } from '../../../contexts/DataContext';
import { db } from '../../../services/db';
import { getStoreHealth } from '../../../utils/helpers';
import ConfirmModal from '../../common/ConfirmModal';
import Modal from '../../common/Modal';
import StoreProfile from './StoreProfile';
import StoreForm from './StoreForm';
import PageTransition from '../../common/PageTransition';
import EmptyState from '../../common/EmptyState';

const StoresManagement = () => {
    const { stores, visits, tasks, settings, refreshData: onRefresh } = useContext(DataContext);
    // eslint-disable-next-line
    const now = Date.now();
    const t = useTranslation();
    const { showToast } = useContext(ToastContext);
    const { lang } = useContext(LangContext);
    const [search, setSearch] = useState('');
    const [zoneFilter, setZoneFilter] = useState('');
    const [catFilter, setCatFilter] = useState('');
    const [healthFilter, setHealthFilter] = useState('');
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
    const [showModal, setShowModal] = useState(false);
    const [editStore, setEditStore] = useState(null);
    const [showImportModal, setShowImportModal] = useState(false);
    const [importData, setImportData] = useState({ stores: [], duplicates: [], isLoading: false });
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [selectedStore, setSelectedStore] = useState(null);
    const [selectedIds, setSelectedIds] = useState([]); // For bulk delete
    const [bulkMode, setBulkMode] = useState(false); // Toggle bulk selection mode
    const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);
    const fileInputRef = useRef(null);
    const { id: urlStoreId } = useParams();
    const navigate = useNavigate();

    // Handle URL store ID
    useEffect(() => {
        if (urlStoreId && stores.length > 0) {
            const store = stores.find(s => s.id === urlStoreId);
            if (store) {
                setSelectedStore(store);
            }
        }
    }, [urlStoreId, stores]);

    const handleBack = () => {
        setSelectedStore(null);
        if (urlStoreId) {
            navigate('/stores', { replace: true });
        }
    };

    const filtered = stores.filter(s => {
        const matchSearch = s.name.toLowerCase().includes(search.toLowerCase());
        const matchZone = !zoneFilter || s.zone === zoneFilter;
        const matchCat = !catFilter || s.category === catFilter;
        const matchHealth = !healthFilter || getStoreHealth(s.last_visit) === healthFilter;
        return matchSearch && matchZone && matchCat && matchHealth;
    });

    // Parse Data using XLSX
    const parseData = (data) => {
        // Arabic to English Mapping
        const mapping = {
            'بقالة': 'Grocery', 'سوبرماركت': 'Grocery',
            'الكترونيات': 'Electronics', 'إلكترونيات': 'Electronics',
            'موبايلات': 'Electronics',
            'ازياء': 'Fashion', 'أزياء': 'Fashion', 'ملابس': 'Fashion',
            'صيدلية': 'Pharmacy', 'مذخر': 'Pharmacy',
            'مطعم': 'Restaurant', 'كافية': 'Restaurant',
            'بغداد المركز': 'Baghdad Central', 'الكرادة': 'Baghdad Central',
            'بغداد شرق': 'Baghdad East', 'المنصور': 'Baghdad Central',
            'بصرة': 'Basra', 'البصرة': 'Basra',
            'اربيل': 'Erbil', 'أربيل': 'Erbil',
            'الموصل': 'Mosul', 'نينوى': 'Mosul'
        };

        const mapValue = (val) => {
            if (!val) return '';
            const trimmed = String(val).trim();
            return mapping[trimmed] || trimmed;
        };

        return data.map(row => {
            // Map keys based on expected headers (flexible match)
            const getVal = (keys) => {
                for (let k of keys) {
                    if (row[k] !== undefined) return row[k];
                }
                return '';
            };

            const id = getVal(['id', 'ID', 'id store']);
            const name = getVal(['name', 'Name', 'name store', 'اسم']);

            if (!id || !name) return null;

            return {
                id: String(id),
                name: String(name),
                category: mapValue(getVal(['category', 'Category', 'Type', 'الفئة', 'تصنيف'])),
                owner: String(getVal(['owner', 'Owner', 'name owner', 'المالك'])),
                phone: String(getVal(['phone', 'Phone', 'number of owner', 'هاتف', 'رقم'])),
                zone: mapValue(getVal(['zone', 'Zone', 'المنطقة'])),
                area_name: String(getVal(['area', 'Area', 'area name', 'area_name', 'اسم المنطقة'])),
                address: String(getVal(['address', 'Address', 'العنوان'])),
                map_link: String(getVal(['map', 'Map', 'maps', 'map_link', 'رابط الخريطة'])),
                status: 'Active',
                last_visit: null,
                pinned_note: '',
                contacts: []
            };
        }).filter(Boolean);
    };

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setImportData({ stores: [], duplicates: [], isLoading: true });
        setShowImportModal(true);

        try {
            const reader = new FileReader();
            reader.onload = (evt) => {
                try {
                    const ab = evt.target.result;
                    const wb = read(ab, { type: 'array' });
                    const wsname = wb.SheetNames[0];
                    const ws = wb.Sheets[wsname];
                    const data = utils.sheet_to_json(ws);

                    const parsedStores = parseData(data);

                    // Check for duplicates
                    const existingIds = new Set(stores.map(s => s.id));
                    const newStores = [];
                    const duplicates = [];

                    parsedStores.forEach(store => {
                        if (existingIds.has(store.id)) {
                            duplicates.push(store);
                        } else {
                            newStores.push(store);
                            existingIds.add(store.id);
                        }
                    });

                    setImportData({ stores: newStores, duplicates, isLoading: false });
                } catch (err) {
                    console.error("Parse Error:", err);
                    showToast('Error parsing file', 'error');
                    setShowImportModal(false);
                    setImportData({ stores: [], duplicates: [], isLoading: false });
                }
            };
            reader.readAsArrayBuffer(file);

        } catch (error) {
            showToast('Error reading file', 'error');
            setShowImportModal(false);
            setImportData({ stores: [], duplicates: [], isLoading: false });
        }

        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleImportConfirm = async () => {
        if (importData.stores.length === 0) {
            showToast(t('noData'), 'error');
            return;
        }

        setImportData(prev => ({ ...prev, isLoading: true }));

        try {
            const table = await db.from('stores');
            for (const store of importData.stores) {
                await table.insert(store);
            }
            showToast(`${t('importSuccess')} - ${importData.stores.length} ${t('stores')}`, 'success');
            setShowImportModal(false);
            setImportData({ stores: [], duplicates: [], isLoading: false });
            onRefresh();
        } catch (error) {
            showToast('Import failed', 'error');
            setImportData(prev => ({ ...prev, isLoading: false }));
        }
    };

    const downloadTemplate = () => {
        const template = 'id store,name store,Type,name owner,number of owner,zone,area name,Address,maps\n1001,Sample Store,Grocery,John Doe,+964 770 000 0000,zone1,الزهور,قرب دورة العبادي,https://maps.google.com';
        const blob = new Blob([template], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'stores_template.csv';
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleSave = async (storeData) => {
        const table = await db.from('stores');

        // Prepare data - ensure boolean fields are included
        const validData = { ...storeData };

        // Fix for timestamp error: Convert empty string to null
        if (validData.last_visit === '') {
            validData.last_visit = null;
        }

        // Ensure boolean fields are boolean type
        validData.has_pos = !!validData.has_pos;
        validData.has_sim_card = !!validData.has_sim_card;

        let result;

        if (editStore) {
            result = await table.update(editStore.id, validData);
        } else {
            result = await table.insert(validData);
        }

        if (result.error) {
            console.error('Save error:', result.error);
            showToast(result.error.userMessage || result.error.message || 'Error saving store', 'error');
            return;
        }

        showToast(t('savedSuccess'), 'success');
        setShowModal(false);
        setEditStore(null);

        // Clear filters to ensure the new/updated store is visible
        setSearch('');
        setZoneFilter('');
        setCatFilter('');
        setHealthFilter('');

        onRefresh();
    };

    const handleDeleteConfirm = async () => {
        if (!confirmDelete) return;
        const table = await db.from('stores');
        await table.delete(confirmDelete);
        showToast(t('deletedSuccess'), 'success');
        setConfirmDelete(null);
        onRefresh();
    };

    // Bulk Delete Handlers
    const toggleStoreSelection = (storeId) => {
        setSelectedIds(prev =>
            prev.includes(storeId)
                ? prev.filter(id => id !== storeId)
                : [...prev, storeId]
        );
    };

    const selectAllFiltered = () => {
        const allFilteredIds = filtered.map(s => s.id);
        setSelectedIds(allFilteredIds);
    };

    const clearSelection = () => {
        setSelectedIds([]);
        setBulkMode(false);
    };

    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return;

        const table = await db.from('stores');
        for (const id of selectedIds) {
            await table.delete(id);
        }

        showToast(`Deleted ${selectedIds.length} stores`, 'success');
        setSelectedIds([]);
        setBulkMode(false);
        setConfirmBulkDelete(false);
        onRefresh();
    };

    const exportCSV = () => {
        const headers = ['ID', 'Name', 'Category', 'Owner', 'Phone', 'Zone', 'Area', 'Address', 'Map Link', 'Status', 'Last Visit'];
        const rows = filtered.map(s => [
            s.id, s.name, s.category, s.owner, s.phone, s.zone, s.area_name || '', s.address || '', s.map_link || '', s.status, s.last_visit || ''
        ]);
        const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${v}"`).join(','))].join('\n');
        // Add UTF-8 BOM for proper Arabic text support in Excel
        const BOM = '\uFEFF';
        const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `stores_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        showToast(`${t('exportSuccess')} - ${filtered.length} ${t('storesExported')}`, 'success');
    };

    // Handle edit from profile
    const handleEditFromProfile = () => {
        setEditStore(selectedStore);
        setShowModal(true);
    };

    // If a store is selected, show profile
    if (selectedStore) {
        return (
            <PageTransition>
                <StoreProfile
                    store={selectedStore}
                    onBack={handleBack}
                    onEdit={handleEditFromProfile}
                    onUpdateStore={(updatedStore) => setSelectedStore(updatedStore)}
                />
                <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditStore(null); }} title={t('edit')}>
                    <StoreForm store={editStore} settings={settings} onSave={async (data) => {
                        await handleSave(data);
                        setSelectedStore({ ...selectedStore, ...data });
                    }} onCancel={() => setShowModal(false)} />
                </Modal>
            </PageTransition>
        );
    }

    return (
        <PageTransition>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <h1 className="text-2xl font-bold dark:text-white">{t('stores')}</h1>
                    <div className="flex flex-wrap gap-2">
                        <input
                            type="file"
                            ref={fileInputRef}
                            accept=".csv,.txt,.xlsx,.xls"
                            onChange={handleFileChange}
                            className="hidden"
                        />

                        {/* Bulk Delete Mode Toggle */}
                        {bulkMode ? (
                            <>
                                <button
                                    onClick={selectAllFiltered}
                                    className="flex items-center gap-2 px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl transition-colors"
                                >
                                    Select All ({filtered.length})
                                </button>
                                <button
                                    onClick={() => setConfirmBulkDelete(true)}
                                    disabled={selectedIds.length === 0}
                                    className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Trash2 size={18} />
                                    Delete ({selectedIds.length})
                                </button>
                                <button
                                    onClick={clearSelection}
                                    className="flex items-center gap-2 px-4 py-2 bg-slate-400 hover:bg-slate-500 text-white rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={() => setBulkMode(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl transition-colors"
                                >
                                    <Trash2 size={18} />
                                    Multi-Select
                                </button>
                                <button onClick={exportCSV}
                                    className="flex items-center gap-2 px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-xl transition-colors">
                                    <Archive size={18} />{t('exportCSV')}
                                </button>
                                <button onClick={() => fileInputRef.current?.click()}
                                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors">
                                    <Upload size={18} />{t('importCSV')}
                                </button>
                                <button onClick={() => { setEditStore(null); setShowModal(true); }}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl min-h-[44px] active:bg-emerald-800">
                                    <Plus size={18} /><span className="hidden sm:inline">{t('addStore')}</span><span className="sm:hidden">Add</span>
                                </button>
                            </>
                        )}
                    </div>
                </div>
                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input type="text" placeholder={t('search')} value={search} onChange={e => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border rounded-xl dark:bg-slate-700 dark:border-slate-600 dark:text-white min-h-[44px]" />
                    </div>
                    <select value={healthFilter} onChange={e => setHealthFilter(e.target.value)}
                        className="px-4 py-2.5 border rounded-xl dark:bg-slate-700 dark:border-slate-600 dark:text-white min-h-[44px]">
                        <option value="">{t('all')} - {t('storeHealth')}</option>
                        <option value="green">🟢 {t('green')}</option>
                        <option value="amber">🟡 {t('amber')}</option>
                        <option value="red">🔴 {t('red')}</option>
                    </select>
                    <select value={zoneFilter} onChange={e => setZoneFilter(e.target.value)}
                        className="px-4 py-2.5 border rounded-xl dark:bg-slate-700 dark:border-slate-600 dark:text-white min-h-[44px]">
                        <option value="">{t('all')} {t('zones')}</option>
                        {(settings?.zones || []).map(z => <option key={z} value={z}>{z}</option>)}
                    </select>
                    <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
                        className="px-4 py-2.5 border rounded-xl dark:bg-slate-700 dark:border-slate-600 dark:text-white min-h-[44px]">
                        <option value="">{t('all')} {t('storeCategories')}</option>
                        {(settings?.storeCategories || []).map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>

                {/* Results Counter & View Toggle */}
                <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        {t('showing')} <span className="font-bold text-emerald-600">{filtered.length}</span> {t('of')} <span className="font-bold">{stores.length}</span> {t('stores')}
                    </p>
                    <div className="flex items-center gap-2">
                        {(healthFilter || zoneFilter || catFilter || search) && (
                            <button onClick={() => { setHealthFilter(''); setZoneFilter(''); setCatFilter(''); setSearch(''); }}
                                className="text-sm text-emerald-600 hover:underline mr-2">
                                {t('clearFilters')}
                            </button>
                        )}
                        <div className="flex bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
                            <button onClick={() => setViewMode('grid')}
                                className={`p-2.5 rounded-md transition-colors min-w-[40px] min-h-[40px] ${viewMode === 'grid' ? 'bg-white dark:bg-slate-600 shadow-sm text-emerald-600' : 'text-slate-500 hover:text-slate-700'}`}>
                                <Store size={18} />
                            </button>
                            <button onClick={() => setViewMode('list')}
                                className={`p-2.5 rounded-md transition-colors min-w-[40px] min-h-[40px] ${viewMode === 'list' ? 'bg-white dark:bg-slate-600 shadow-sm text-emerald-600' : 'text-slate-500 hover:text-slate-700'}`}>
                                <Menu size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stores Grid View */}
                {viewMode === 'grid' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                        {filtered.map(store => {
                            const health = getStoreHealth(store.last_visit);
                            const daysSince = store.last_visit
                                ? Math.floor((now - new Date(store.last_visit).getTime()) / (1000 * 60 * 60 * 24))
                                : null;
                            return (
                                <div key={store.id}
                                    className="group bg-white dark:bg-slate-800 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-100 dark:border-slate-700 hover:border-emerald-200 dark:hover:border-emerald-800 hover:-translate-y-1">
                                    {/* Health Bar with Gradient */}
                                    <div className={`h-1.5 ${health === 'green' ? 'bg-gradient-to-r from-emerald-400 to-emerald-600' : health === 'amber' ? 'bg-gradient-to-r from-amber-400 to-amber-600' : 'bg-gradient-to-r from-red-400 to-red-600'}`} />

                                    <div className="p-5">
                                        {/* Header */}
                                        <div className="flex items-start justify-between mb-4">
                                            {/* Bulk Selection Checkbox */}
                                            {bulkMode && (
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.includes(store.id)}
                                                    onChange={() => toggleStoreSelection(store.id)}
                                                    className="w-5 h-5 rounded accent-red-600 mr-3 mt-1 cursor-pointer"
                                                />
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <h3
                                                    onClick={() => !bulkMode && setSelectedStore(store)}
                                                    className={`font-bold text-lg dark:text-white transition-colors truncate ${bulkMode ? 'cursor-default' : 'cursor-pointer hover:text-emerald-600 dark:hover:text-emerald-400'}`}
                                                >
                                                    {store.name}
                                                </h3>
                                                <p className="text-sm text-slate-500 dark:text-slate-400 truncate mt-0.5">
                                                    📍 {store.zone}{store.area_name ? ` - ${store.area_name}` : ''}
                                                </p>
                                            </div>
                                            <div className="flex flex-col items-end gap-1 ml-2">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${store.status === 'Active' ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'}`}>
                                                    {store.status === 'Active' ? '● Active' : '○ Closed'}
                                                </span>
                                                {Array.isArray(store.offers) && store.offers.length > 0 && (
                                                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                                                        <TagIcon size={12} />
                                                        {store.offers.length} {store.offers.length === 1 ? 'Offer' : 'Offers'}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Info Cards */}
                                        <div className="grid grid-cols-2 gap-2 mb-4">
                                            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-2.5">
                                                <p className="text-xs text-slate-500 dark:text-slate-400">{t('owner')}</p>
                                                <p className="font-medium text-sm dark:text-white truncate">{store.owner}</p>
                                            </div>
                                            <div className={`rounded-xl p-2.5 ${health === 'green' ? 'bg-emerald-50 dark:bg-emerald-900/20' : health === 'amber' ? 'bg-amber-50 dark:bg-amber-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">{t('lastVisit')}</p>
                                                <p className={`font-medium text-sm ${health === 'green' ? 'text-emerald-700 dark:text-emerald-400' : health === 'amber' ? 'text-amber-700 dark:text-amber-400' : 'text-red-700 dark:text-red-400'}`}>
                                                    {daysSince !== null ? `${daysSince} days` : 'Never'}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-2 pt-3 border-t border-slate-100 dark:border-slate-700">
                                            <button onClick={() => window.open(`tel:${store.phone}`)} title={t('call')}
                                                className="p-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-sm transition-colors">
                                                <Phone size={18} />
                                            </button>
                                            <button onClick={() => setSelectedStore(store)}
                                                className="flex-1 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl text-sm font-medium shadow-sm transition-all flex items-center justify-center gap-1">
                                                {t('viewProfile')} <ChevronRight size={16} />
                                            </button>
                                            <button onClick={() => { setEditStore(store); setShowModal(true); }}
                                                className="p-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 rounded-xl transition-colors">
                                                <Edit2 size={18} />
                                            </button>
                                            <button onClick={() => setConfirmDelete(store.id)} title={t('delete')}
                                                className="p-2.5 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 rounded-xl transition-colors">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Stores List View */}
                {viewMode === 'list' && (
                    <div className="space-y-3">
                        {filtered.map(store => {
                            const health = getStoreHealth(store.last_visit);
                            const daysSince = store.last_visit
                                ? Math.floor((now - new Date(store.last_visit).getTime()) / (1000 * 60 * 60 * 24))
                                : null;
                            return (
                                <div key={store.id}
                                    className="bg-white dark:bg-slate-800 rounded-xl shadow-sm hover:shadow-md transition-all border border-slate-100 dark:border-slate-700 hover:border-emerald-200 dark:hover:border-emerald-800 overflow-hidden">
                                    <div className="flex items-center">
                                        {/* Health Indicator */}
                                        <div className={`w-1.5 h-full min-h-[80px] ${health === 'green' ? 'bg-emerald-500' : health === 'amber' ? 'bg-amber-500' : 'bg-red-500'}`} />

                                        {/* Content */}
                                        <div className="flex-1 flex items-center justify-between p-4 gap-4">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <h3 onClick={() => setSelectedStore(store)}
                                                        className="font-bold dark:text-white cursor-pointer hover:text-emerald-600 transition-colors truncate">
                                                        {store.name}
                                                    </h3>
                                                    <span className={`px-2 py-0.5 rounded-full text-xs ${store.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                                                        {store.status === 'Active' ? '● Active' : '○ Closed'}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                                    📍 {store.zone}{store.area_name ? ` - ${store.area_name}` : ''} • {store.owner}
                                                </p>
                                            </div>

                                            {/* Visit Status */}
                                            <div className={`text-center px-3 py-1.5 rounded-lg ${health === 'green' ? 'bg-emerald-50 text-emerald-700' : health === 'amber' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'}`}>
                                                <p className="text-lg font-bold">{daysSince !== null ? daysSince : '-'}</p>
                                                <p className="text-xs">days</p>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => window.open(`tel:${store.phone}`)}
                                                    className="p-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors">
                                                    <Phone size={16} />
                                                </button>
                                                <button onClick={() => setSelectedStore(store)}
                                                    className="px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm transition-colors">
                                                    {t('viewProfile')}
                                                </button>
                                                <button onClick={() => { setEditStore(store); setShowModal(true); }}
                                                    className="p-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors">
                                                    <Edit2 size={16} />
                                                </button>
                                                <button onClick={() => setConfirmDelete(store.id)}
                                                    className="p-2 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 text-red-600 rounded-lg transition-colors">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {filtered.length === 0 && (
                    <EmptyState
                        type="stores"
                        title="No Stores Found"
                        description={search || healthFilter || zoneFilter || catFilter
                            ? 'Try changing filters'
                            : 'Start by adding a new store'}
                        action={() => { setEditStore(null); setShowModal(true); }}
                        actionLabel={t('addStore')}
                    />
                )}

                {/* Store Edit Modal */}
                <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditStore(null); }} title={editStore ? t('edit') : t('addStore')}>
                    <StoreForm store={editStore} settings={settings} onSave={handleSave} onCancel={() => setShowModal(false)} />
                </Modal>

                {/* Import Modal */}
                <Modal isOpen={showImportModal} onClose={() => { setShowImportModal(false); setImportData({ stores: [], duplicates: [], isLoading: false }); }} title={t('importStores')}>
                    <div className="space-y-4">
                        {importData.isLoading && importData.stores.length === 0 ? (
                            <div className="text-center py-8">
                                <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                                <p className="dark:text-white">{t('importing')}</p>
                            </div>
                        ) : (
                            <>
                                {/* Summary */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl text-center">
                                        <p className="text-3xl font-bold text-emerald-600">{importData.stores.length}</p>
                                        <p className="text-sm text-emerald-700 dark:text-emerald-400">{t('newStores')}</p>
                                    </div>
                                    <div className="p-4 bg-amber-50 dark:bg-amber-900/30 rounded-xl text-center">
                                        <p className="text-3xl font-bold text-amber-600">{importData.duplicates.length}</p>
                                        <p className="text-sm text-amber-700 dark:text-amber-400">{t('duplicatesFound')}</p>
                                    </div>
                                </div>

                                {/* Preview Table */}
                                {importData.stores.length > 0 && (
                                    <div className="max-h-60 overflow-y-auto border dark:border-slate-700 rounded-xl">
                                        <table className="w-full text-sm">
                                            <thead className="bg-slate-100 dark:bg-slate-700 sticky top-0">
                                                <tr>
                                                    <th className="p-2 text-left dark:text-white">ID</th>
                                                    <th className="p-2 text-left dark:text-white">{t('name')}</th>
                                                    <th className="p-2 text-left dark:text-white">{t('zone')}</th>
                                                    <th className="p-2 text-left dark:text-white">{t('category')}</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {importData.stores.slice(0, 10).map((store, idx) => (
                                                    <tr key={idx} className="border-t dark:border-slate-700">
                                                        <td className="p-2 dark:text-slate-300">{store.id}</td>
                                                        <td className="p-2 dark:text-slate-300">{store.name}</td>
                                                        <td className="p-2 dark:text-slate-300">{store.zone}</td>
                                                        <td className="p-2 dark:text-slate-300">{store.category}</td>
                                                    </tr>
                                                ))}
                                                {importData.stores.length > 10 && (
                                                    <tr className="border-t dark:border-slate-700">
                                                        <td colSpan={4} className="p-2 text-center text-slate-500">
                                                            ... +{importData.stores.length - 10} more
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                {/* Duplicates Warning */}
                                {importData.duplicates.length > 0 && (
                                    <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                                        <p className="text-sm text-amber-700 dark:text-amber-400">
                                            ⚠️ {importData.duplicates.length} {t('duplicatesFound')}: {importData.duplicates.slice(0, 3).map(d => d.id).join(', ')}{importData.duplicates.length > 3 ? '...' : ''}
                                        </p>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex gap-3">
                                    <button onClick={downloadTemplate}
                                        className="flex-1 py-2 bg-slate-200 dark:bg-slate-700 dark:text-white rounded-xl hover:bg-slate-300 text-sm">
                                        {t('downloadTemplate')}
                                    </button>
                                    <button onClick={handleImportConfirm} disabled={importData.stores.length === 0 || importData.isLoading}
                                        className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed">
                                        {importData.isLoading ? t('importing') : `${t('importStores')} (${importData.stores.length})`}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </Modal>

                {/* Confirm Delete Modal */}
                <ConfirmModal
                    isOpen={!!confirmDelete}
                    onClose={() => setConfirmDelete(null)}
                    onConfirm={handleDeleteConfirm}
                    title={t('confirmDelete')}
                    message={t('confirmDeleteMessage')}
                />

                {/* Bulk Delete Confirmation Modal */}
                <ConfirmModal
                    isOpen={confirmBulkDelete}
                    onClose={() => setConfirmBulkDelete(false)}
                    onConfirm={handleBulkDelete}
                    title="Bulk Delete"
                    message={`Are you sure you want to delete ${selectedIds.length} stores? This action cannot be undone.`}
                />
            </div>
        </PageTransition >
    );
};

export default StoresManagement;
