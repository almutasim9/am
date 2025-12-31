import React, { useState, useContext, useMemo } from 'react';
import { Archive, Calendar, Filter, Download, CheckSquare, MapPin, Search, X, Star } from 'lucide-react';
import useTranslation from '../../../hooks/useTranslation';
import { DataContext } from '../../../contexts/DataContext';
import { ToastContext } from '../../../contexts/AppContext';
import { formatDate } from '../../../utils/helpers';
import PageTransition from '../../common/PageTransition';
import EmptyState from '../../common/EmptyState';

const ArchiveView = () => {
    const { visits, tasks, stores } = useContext(DataContext);
    const { showToast } = useContext(ToastContext);
    const t = useTranslation();

    // Tabs: Visits or Tasks
    const [activeTab, setActiveTab] = useState('visits');

    // Filters
    const [search, setSearch] = useState('');
    const [storeFilter, setStoreFilter] = useState('');
    const [effectiveFilter, setEffectiveFilter] = useState(''); // 'effective', 'non-effective', ''
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    // Completed visits and tasks
    const completedVisits = useMemo(() =>
        visits.filter(v => v.status === 'completed')
            .sort((a, b) => new Date(b.date) - new Date(a.date)),
        [visits]
    );

    const completedTasks = useMemo(() =>
        tasks.filter(t => t.status === 'done')
            .sort((a, b) => new Date(b.due_date) - new Date(a.due_date)),
        [tasks]
    );

    // Apply filters to visits
    const filteredVisits = useMemo(() => {
        return completedVisits.filter(v => {
            const store = stores.find(s => s.id === v.store_id);
            const storeName = store?.name?.toLowerCase() || '';

            // Search filter
            const matchSearch = !search ||
                storeName.includes(search.toLowerCase()) ||
                v.note?.toLowerCase().includes(search.toLowerCase());

            // Store filter
            const matchStore = !storeFilter || v.store_id === storeFilter;

            // Effectiveness filter
            const matchEffective = !effectiveFilter ||
                (effectiveFilter === 'effective' && v.is_effective) ||
                (effectiveFilter === 'non-effective' && !v.is_effective);

            // Date range filter
            const visitDate = new Date(v.date);
            const matchDateFrom = !dateFrom || visitDate >= new Date(dateFrom);
            const matchDateTo = !dateTo || visitDate <= new Date(dateTo + 'T23:59:59');

            return matchSearch && matchStore && matchEffective && matchDateFrom && matchDateTo;
        });
    }, [completedVisits, search, storeFilter, effectiveFilter, dateFrom, dateTo, stores]);

    // Apply filters to tasks
    const filteredTasks = useMemo(() => {
        return completedTasks.filter(task => {
            const store = stores.find(s => s.id === task.store_id);
            const storeName = store?.name?.toLowerCase() || '';

            // Search filter
            const matchSearch = !search ||
                storeName.includes(search.toLowerCase()) ||
                task.cat?.toLowerCase().includes(search.toLowerCase()) ||
                task.sub?.toLowerCase().includes(search.toLowerCase());

            // Store filter
            const matchStore = !storeFilter || task.store_id === storeFilter;

            // Date range filter
            const taskDate = new Date(task.due_date);
            const matchDateFrom = !dateFrom || taskDate >= new Date(dateFrom);
            const matchDateTo = !dateTo || taskDate <= new Date(dateTo + 'T23:59:59');

            return matchSearch && matchStore && matchDateFrom && matchDateTo;
        });
    }, [completedTasks, search, storeFilter, dateFrom, dateTo, stores]);

    // Clear all filters
    const clearFilters = () => {
        setSearch('');
        setStoreFilter('');
        setEffectiveFilter('');
        setDateFrom('');
        setDateTo('');
    };

    const hasActiveFilters = search || storeFilter || effectiveFilter || dateFrom || dateTo;

    // Export to CSV
    const exportCSV = () => {
        let csvContent = '';

        if (activeTab === 'visits') {
            csvContent = 'Store,Date,Type,Note,Effective,Rating\n';
            filteredVisits.forEach(v => {
                const store = stores.find(s => s.id === v.store_id);
                csvContent += `"${store?.name || 'Unknown'}","${formatDate(v.date)}","${v.type}","${v.note || ''}","${v.is_effective ? 'Yes' : 'No'}","${v.rating || ''}"\n`;
            });
        } else {
            csvContent = 'Store,Category,Sub-Task,Priority,Due Date,Description\n';
            filteredTasks.forEach(task => {
                const store = stores.find(s => s.id === task.store_id);
                csvContent += `"${store?.name || 'Unknown'}","${task.cat}","${task.sub}","${task.priority}","${formatDate(task.due_date)}","${task.description || ''}"\n`;
            });
        }

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `archive_${activeTab}_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        showToast('Exported successfully!', 'success');
    };

    const currentData = activeTab === 'visits' ? filteredVisits : filteredTasks;

    return (
        <PageTransition>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold dark:text-white flex items-center gap-2">
                            <Archive className="text-slate-500" /> Archive
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">
                            {filteredVisits.length} completed visits • {filteredTasks.length} completed tasks
                        </p>
                    </div>
                    <button
                        onClick={exportCSV}
                        disabled={currentData.length === 0}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors disabled:opacity-50"
                    >
                        <Download size={18} /> Export CSV
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                    <button
                        onClick={() => setActiveTab('visits')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium transition-all ${activeTab === 'visits'
                                ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow'
                                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                            }`}
                    >
                        <MapPin size={18} /> Visits ({completedVisits.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('tasks')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium transition-all ${activeTab === 'tasks'
                                ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow'
                                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                            }`}
                    >
                        <CheckSquare size={18} /> Tasks ({completedTasks.length})
                    </button>
                </div>

                {/* Filters */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md p-4 space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400">
                        <Filter size={16} /> Filters
                        {hasActiveFilters && (
                            <button onClick={clearFilters} className="ml-auto text-red-500 hover:text-red-600 flex items-center gap-1">
                                <X size={14} /> Clear
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {/* Search */}
                        <div className="relative">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 border rounded-xl dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                            />
                        </div>

                        {/* Store Filter */}
                        <select
                            value={storeFilter}
                            onChange={(e) => setStoreFilter(e.target.value)}
                            className="px-4 py-2 border rounded-xl dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                        >
                            <option value="">All Stores</option>
                            {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>

                        {/* Date From */}
                        <div className="relative">
                            <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="date"
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 border rounded-xl dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                            />
                        </div>

                        {/* Date To */}
                        <div className="relative">
                            <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="date"
                                value={dateTo}
                                onChange={(e) => setDateTo(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 border rounded-xl dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                            />
                        </div>
                    </div>

                    {/* Effectiveness Filter (only for visits) */}
                    {activeTab === 'visits' && (
                        <div className="flex gap-2 flex-wrap">
                            <span className="text-sm text-slate-500 mr-2">Effectiveness:</span>
                            {['', 'effective', 'non-effective'].map(val => (
                                <button
                                    key={val}
                                    onClick={() => setEffectiveFilter(val)}
                                    className={`px-3 py-1 rounded-full text-sm transition-colors ${effectiveFilter === val
                                            ? 'bg-emerald-600 text-white'
                                            : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                                        }`}
                                >
                                    {val === '' ? 'All' : val === 'effective' ? 'Effective' : 'Non-effective'}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="space-y-3">
                    {currentData.length > 0 ? (
                        activeTab === 'visits' ? (
                            filteredVisits.map(visit => {
                                const store = stores.find(s => s.id === visit.store_id);
                                return (
                                    <div key={visit.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-4 flex items-center justify-between hover:shadow-lg transition-shadow">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${visit.is_effective
                                                    ? 'bg-emerald-100 dark:bg-emerald-900/30'
                                                    : 'bg-slate-100 dark:bg-slate-700'
                                                }`}>
                                                <MapPin size={24} className={visit.is_effective ? 'text-emerald-600' : 'text-slate-500'} />
                                            </div>
                                            <div>
                                                <p className="font-bold dark:text-white">{store?.name || 'Unknown'}</p>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                                    {visit.type} • {formatDate(visit.date)}
                                                </p>
                                                {visit.note && <p className="text-xs text-slate-400 mt-1 line-clamp-1">{visit.note}</p>}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {/* Rating Stars */}
                                            {visit.rating && (
                                                <div className="flex items-center gap-0.5">
                                                    {[1, 2, 3, 4, 5].map(i => (
                                                        <Star
                                                            key={i}
                                                            size={14}
                                                            className={i <= visit.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}
                                                        />
                                                    ))}
                                                </div>
                                            )}
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${visit.is_effective
                                                    ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400'
                                                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                                                }`}>
                                                {visit.is_effective ? 'Effective' : 'Non-effective'}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            filteredTasks.map(task => {
                                const store = stores.find(s => s.id === task.store_id);
                                return (
                                    <div key={task.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-4 flex items-center justify-between hover:shadow-lg transition-shadow">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
                                                <CheckSquare size={24} className="text-emerald-600" />
                                            </div>
                                            <div>
                                                <p className="font-bold dark:text-white">{store?.name || 'Unknown'}</p>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                                    {task.cat} → {task.sub}
                                                </p>
                                                <p className="text-xs text-slate-400 mt-0.5">Due: {formatDate(task.due_date)}</p>
                                            </div>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${task.priority === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400' :
                                                task.priority === 'medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400' :
                                                    'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                                            }`}>
                                            {task.priority}
                                        </span>
                                    </div>
                                );
                            })
                        )
                    ) : (
                        <EmptyState
                            icon={Archive}
                            title={hasActiveFilters ? 'No matches found' : 'Archive is empty'}
                            description={hasActiveFilters ? 'Try adjusting your filters' : 'Completed visits and tasks will appear here'}
                        />
                    )}
                </div>
            </div>
        </PageTransition>
    );
};

export default ArchiveView;
