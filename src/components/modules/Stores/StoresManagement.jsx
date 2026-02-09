import React, { useState, useContext, useRef, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { read, utils } from 'xlsx';
import useTranslation from '../../../hooks/useTranslation';
import { ToastContext } from '../../../contexts/AppContext';
import { DataContext } from '../../../contexts/DataContext';
import { db } from '../../../services/db';
import PageTransition from '../../common/PageTransition';
import StoreProfile from './StoreProfile';

// Extracted components
import StoreHeader from './components/StoreHeader';
import StoreBulkActions from './components/StoreBulkActions';
import StoreManagementList from './components/StoreManagementList';
import StoreManagementModals from './components/StoreManagementModals';
import StoresFilters from './components/StoresFilters';
import useStoresFilters from './hooks/useStoresFilters';

const StoresManagement = () => {
    const { stores, settings, storesInfinite, refreshData: onRefresh } = useContext(DataContext);
    const t = useTranslation();
    const { showToast } = useContext(ToastContext);

    // View state
    const [viewMode, setViewMode] = useState('grid');
    const [showModal, setShowModal] = useState(false);
    const [editStore, setEditStore] = useState(null);
    const [selectedStore, setSelectedStore] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(null);

    // Import state
    const [showImportModal, setShowImportModal] = useState(false);
    const [importData, setImportData] = useState({ stores: [], duplicates: [], isLoading: false });
    const fileInputRef = useRef(null);

    // Bulk selection state
    const [selectedIds, setSelectedIds] = useState([]);
    const [bulkMode, setBulkMode] = useState(false);
    const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);

    // URL handling
    const { id: urlStoreId } = useParams();
    const navigate = useNavigate();

    // Pagination state
    const [currentPage, setCurrentPage] = useState(0);
    const PAGE_SIZE = 25;

    // Filter hook (operates on the full stores list for smooth local filtering)
    const {
        search, setSearch,
        zoneFilter, setZoneFilter,
        catFilter, setCatFilter,
        healthFilter, setHealthFilter,
        filtered,
        hasActiveFilters,
        clearFilters
    } = useStoresFilters(stores);

    // Calculate pagination for the filtered results
    const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
    const paginatedStores = useMemo(() => {
        const start = currentPage * PAGE_SIZE;
        return filtered.slice(start, start + PAGE_SIZE);
    }, [filtered, currentPage]);

    // Reset to page 0 when filters change
    useEffect(() => {
        setCurrentPage(0);
    }, [search, zoneFilter, catFilter, healthFilter]);

    // Data from Infinite Query (kept for background syncing/potential future needs, 
    // but the UI now uses the segmented 'paginatedStores' for the "Lists of 25" requirement)
    const {
        isFetchingNextPage,
        isLoading: isInfiniteLoading,
        refetch: refetchInfinite
    } = storesInfinite;

    useEffect(() => {
        if (urlStoreId && stores.length > 0) {
            const store = stores.find(s => s.id === urlStoreId);
            if (store) setSelectedStore(store);
        }
    }, [urlStoreId, stores]);

    // Handlers
    const handleBack = () => {
        setSelectedStore(null);
        if (urlStoreId) navigate('/stores', { replace: true });
    };

    const handleSave = async (storeData) => {
        const table = await db.from('stores');
        const validData = { ...storeData };

        if (validData.last_visit === '') validData.last_visit = null;
        validData.has_pos = !!validData.has_pos;
        validData.has_sim_card = !!validData.has_sim_card;

        const result = editStore
            ? await table.update(editStore.id, validData)
            : await table.insert(validData);

        if (result.error) {
            showToast(result.error.userMessage || result.error.message || 'Error saving store', 'error');
            return;
        }

        showToast(t('savedSuccess'), 'success');
        setShowModal(false);
        setEditStore(null);
        clearFilters();
        onRefresh();
        refetchInfinite();
    };

    const handleDeleteConfirm = async () => {
        if (!confirmDelete) return;
        try {
            const table = await db.from('stores');
            const { error } = await table.delete(confirmDelete);
            if (error) {
                showToast(error.userMessage || 'Error deleting store', 'error');
                return;
            }
            showToast(t('deletedSuccess'), 'success');
            setConfirmDelete(null);
            onRefresh();
            refetchInfinite();
        } catch (err) {
            console.error('handleDeleteConfirm error:', err);
            showToast('Unexpected error deleting store', 'error');
        }
    };

    const toggleStoreSelection = (storeId) => {
        setSelectedIds(prev =>
            prev.includes(storeId) ? prev.filter(id => id !== storeId) : [...prev, storeId]
        );
    };

    const selectAllFiltered = () => setSelectedIds(filtered.map(s => s.id));
    const clearSelection = () => { setSelectedIds([]); setBulkMode(false); };

    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return;

        const table = await db.from('stores');
        let successCount = 0;
        let errorCount = 0;
        let lastError = null;

        for (const id of selectedIds) {
            const { error } = await table.delete(id);
            if (!error) successCount++;
            else {
                errorCount++;
                lastError = error;
            }
        }

        if (errorCount > 0) {
            showToast(`Deleted ${successCount} stores. ${errorCount} failed. ${lastError?.userMessage || ''}`, 'warning');
        } else {
            showToast(`Successfully deleted ${successCount} stores`, 'success');
        }

        clearSelection();
        setConfirmBulkDelete(false);
        onRefresh();
        refetchInfinite();
    };

    // Import handlers (minimal logic here, rest in parseImportData)
    const parseImportData = (data) => {
        // ... same mapping logic as before ...
        const mapping = { 'بقالة': 'Grocery', 'سوبرماركت': 'Grocery', 'الكترونيات': 'Electronics', 'إلكترونيات': 'Electronics', 'موبايلات': 'Electronics', 'ازياء': 'Fashion', 'أزياء': 'Fashion', 'ملابس': 'Fashion', 'صيدلية': 'Pharmacy', 'مذخر': 'Pharmacy', 'مطعم': 'Restaurant', 'كافية': 'Restaurant', 'بغداد المركز': 'Baghdad Central', 'الكرادة': 'Baghdad Central', 'بغداد شرق': 'Baghdad East', 'المنصور': 'Baghdad Central', 'بصرة': 'Basra', 'البصرة': 'Basra', 'اربيل': 'Erbil', 'أربيل': 'Erbil', 'الموصل': 'Mosul', 'نينوى': 'Mosul' };
        const mapValue = (val) => { if (!val) return ''; const trimmed = String(val).trim(); return mapping[trimmed] || trimmed; };
        return data.map(row => {
            const getVal = (keys) => { for (let k of keys) { if (row[k] !== undefined) return row[k]; } return ''; };
            const id = getVal(['id', 'ID', 'id store']);
            const name = getVal(['name', 'Name', 'name store', 'اسم']);
            if (!id || !name) return null;
            return { id: String(id), name: String(name), category: mapValue(getVal(['category', 'Category', 'Type', 'الفئة', 'تصنيف'])), owner: String(getVal(['owner', 'Owner', 'name owner', 'المالك'])), phone: String(getVal(['phone', 'Phone', 'number of owner', 'هاتف', 'رقم'])), zone: mapValue(getVal(['zone', 'Zone', 'المنطقة'])), area_name: String(getVal(['area', 'Area', 'area name', 'area_name', 'اسم المنطقة'])), address: String(getVal(['address', 'Address', 'العنوان'])), map_link: String(getVal(['map', 'Map', 'maps', 'map_link', 'رابط الخريطة'])), status: 'Active', last_visit: null, pinned_note: '', contacts: [] };
        }).filter(Boolean);
    };

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setImportData({ stores: [], duplicates: [], isLoading: true });
        setShowImportModal(true);
        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const ab = evt.target.result;
                const wb = read(ab, { type: 'array' });
                const ws = wb.Sheets[wb.SheetNames[0]];
                const data = utils.sheet_to_json(ws);
                const parsedStores = parseImportData(data);
                const existingIds = new Set(stores.map(s => s.id));
                const newStores = [];
                const duplicates = [];
                parsedStores.forEach(store => {
                    if (existingIds.has(store.id)) duplicates.push(store);
                    else { newStores.push(store); existingIds.add(store.id); }
                });
                setImportData({ stores: newStores, duplicates, isLoading: false });
            } catch (err) { showToast('Error parsing file', 'error'); setShowImportModal(false); }
        };
        reader.readAsArrayBuffer(file);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleImportConfirm = async () => {
        if (importData.stores.length === 0) return;
        setImportData(prev => ({ ...prev, isLoading: true }));
        try {
            const table = await db.from('stores');
            let successCount = 0;
            let errorCount = 0;
            let lastError = null;

            for (const store of importData.stores) {
                const { error } = await table.insert(store);
                if (!error) successCount++;
                else {
                    errorCount++;
                    lastError = error;
                }
            }

            if (errorCount > 0) {
                showToast(`Imported ${successCount} stores. ${errorCount} failed. ${lastError?.userMessage || ''}`, 'warning');
            } else {
                showToast(`${t('importSuccess')} - ${successCount} stores`, 'success');
            }

            setShowImportModal(false);
            setImportData({ stores: [], duplicates: [], isLoading: false });
            onRefresh();
            refetchInfinite();
        } catch (error) {
            console.error('Import process error:', error);
            showToast('Import failed due to an unexpected error', 'error');
        }
    };

    const downloadTemplate = () => {
        const template = 'id store,name store,Type,name owner,number of owner,zone,area name,Address,maps\n1001,Sample Store,Grocery,John Doe,+964 770 000 0000,zone1,الزهور,قرب دورة العبادي,https://maps.google.com';
        const blob = new Blob([template], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'stores_template.csv'; a.click();
        URL.revokeObjectURL(url);
    };

    const exportCSV = () => {
        const headers = ['ID', 'Name', 'Category', 'Owner', 'Phone', 'Zone', 'Area', 'Address', 'Map Link', 'Status', 'Last Visit'];
        const rows = filtered.map(s => [s.id, s.name, s.category, s.owner, s.phone, s.zone, s.area_name || '', s.address || '', s.map_link || '', s.status, s.last_visit || '']);
        const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${v}"`).join(','))].join('\n');
        const BOM = '\uFEFF';
        const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `stores_${new Date().toISOString().split('T')[0]}.csv`; a.click();
        URL.revokeObjectURL(url);
        showToast(`${t('exportSuccess')}`, 'success');
    };

    if (selectedStore) {
        return (
            <PageTransition>
                <StoreProfile
                    store={selectedStore}
                    onBack={handleBack}
                    onEdit={() => { setEditStore(selectedStore); setShowModal(true); }}
                    onUpdateStore={setSelectedStore}
                />
                <StoreManagementModals
                    showModal={showModal} setShowModal={setShowModal}
                    editStore={editStore} setEditStore={setEditStore}
                    settings={settings}
                    handleSave={async (data) => {
                        await handleSave(data);
                        setSelectedStore({ ...selectedStore, ...data });
                    }}
                    selectedIds={selectedIds}
                />
            </PageTransition>
        );
    }

    return (
        <PageTransition>
            <div className="space-y-6">
                <input
                    type="file"
                    ref={fileInputRef}
                    accept=".csv,.txt,.xlsx,.xls"
                    onChange={handleFileChange}
                    className="hidden"
                />

                <StoreHeader
                    bulkMode={bulkMode}
                    setBulkMode={setBulkMode}
                    onExport={exportCSV}
                    onImport={() => fileInputRef.current?.click()}
                    onAdd={() => { setEditStore(null); setShowModal(true); }}
                />

                {bulkMode && (
                    <StoreBulkActions
                        selectedCount={selectedIds.length}
                        totalFiltered={filtered.length}
                        onSelectAll={selectAllFiltered}
                        onDelete={() => setConfirmBulkDelete(true)}
                        onCancel={clearSelection}
                    />
                )}

                <StoresFilters
                    search={search} setSearch={setSearch}
                    healthFilter={healthFilter} setHealthFilter={setHealthFilter}
                    zoneFilter={zoneFilter} setZoneFilter={setZoneFilter}
                    catFilter={catFilter} setCatFilter={setCatFilter}
                    settings={settings}
                    hasActiveFilters={hasActiveFilters}
                    onClearFilters={clearFilters}
                    filteredCount={filtered.length}
                    totalCount={stores.length}
                />

                <StoreManagementList
                    stores={paginatedStores}
                    isLoading={isInfiniteLoading}
                    isFetchingNextPage={isFetchingNextPage}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    viewMode={viewMode}
                    setViewMode={setViewMode}
                    onSelectStore={setSelectedStore}
                    onEditStore={(s) => { setEditStore(s); setShowModal(true); }}
                    onDeleteStore={setConfirmDelete}
                    bulkMode={bulkMode}
                    selectedIds={selectedIds}
                    onToggleSelect={toggleStoreSelection}
                    hasActiveFilters={hasActiveFilters}
                    onAddClick={() => { setEditStore(null); setShowModal(true); }}
                />

                <StoreManagementModals
                    showModal={showModal} setShowModal={setShowModal}
                    showImportModal={showImportModal} setShowImportModal={setShowImportModal}
                    confirmDelete={confirmDelete} setConfirmDelete={setConfirmDelete}
                    confirmBulkDelete={confirmBulkDelete} setConfirmBulkDelete={setConfirmBulkDelete}
                    editStore={editStore} setEditStore={setEditStore}
                    settings={settings}
                    handleSave={handleSave}
                    handleDeleteConfirm={handleDeleteConfirm}
                    handleBulkDelete={handleBulkDelete}
                    handleImportConfirm={handleImportConfirm}
                    importData={importData}
                    downloadTemplate={downloadTemplate}
                    selectedIds={selectedIds}
                />
            </div>
        </PageTransition>
    );
};

export default StoresManagement;
