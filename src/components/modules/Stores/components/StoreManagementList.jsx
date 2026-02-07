import React, { useEffect, useRef } from 'react';
import { Store, Menu, Loader2 } from 'lucide-react';
import StoreCard from './StoreCard';
import StoreRow from './StoreRow';
import EmptyState from '../../../common/EmptyState';
import useTranslation from '../../../../hooks/useTranslation';

const StoreManagementList = ({
    stores,
    isLoading,
    isFetchingNextPage,
    currentPage,
    totalPages,
    onPageChange,
    viewMode,
    setViewMode,
    onSelectStore,
    onEditStore,
    onDeleteStore,
    bulkMode,
    selectedIds,
    onToggleSelect,
    hasActiveFilters,
    clearFilters,
    onAddClick
}) => {
    const t = useTranslation();

    if (isLoading && stores.length === 0) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="animate-spin text-primary-600" size={40} />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* View Toggle */}
            <div className="flex justify-end">
                <div className="flex bg-slate-100 dark:bg-slate-700/50 rounded-xl p-1 border border-slate-200 dark:border-slate-600">
                    <button
                        onClick={() => setViewMode('grid')}
                        aria-label="Grid view"
                        className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-slate-600 shadow-sm text-primary-600' : 'text-slate-400 hover:text-primary-500'}`}
                    >
                        <Store size={18} />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        aria-label="List view"
                        className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-600 shadow-sm text-primary-600' : 'text-slate-400 hover:text-primary-500'}`}
                    >
                        <Menu size={18} />
                    </button>
                </div>
            </div>

            {/* Content */}
            {stores.length === 0 ? (
                <EmptyState
                    type="stores"
                    title="No Stores Found"
                    description={hasActiveFilters ? 'Try changing filters' : 'Start by adding a new store'}
                    action={onAddClick}
                    actionLabel={t('addStore')}
                />
            ) : (
                <>
                    {viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                            {stores.map(store => (
                                <StoreCard
                                    key={store.id}
                                    store={store}
                                    onSelect={onSelectStore}
                                    onEdit={onEditStore}
                                    onDelete={onDeleteStore}
                                    bulkMode={bulkMode}
                                    isSelected={selectedIds.includes(store.id)}
                                    onToggleSelect={() => onToggleSelect(store.id)}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {stores.map(store => (
                                <StoreRow
                                    key={store.id}
                                    store={store}
                                    onSelect={onSelectStore}
                                    onEdit={onEditStore}
                                    onDelete={onDeleteStore}
                                />
                            ))}
                        </div>
                    )}

                    {/* Pagination / List Selector */}
                    {totalPages > 1 && (
                        <div className="mt-8 flex flex-wrap justify-center items-center gap-2">
                            <button
                                onClick={() => onPageChange(Math.max(0, currentPage - 1))}
                                disabled={currentPage === 0}
                                className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 disabled:opacity-50 hover:bg-slate-50 transition-all font-bold text-sm"
                            >
                                PREV
                            </button>

                            <div className="flex flex-wrap gap-2 items-center px-2">
                                {[...Array(totalPages)].map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => onPageChange(idx)}
                                        className={`min-w-[44px] h-[44px] rounded-xl font-bold transition-all flex flex-col items-center justify-center border ${currentPage === idx
                                                ? 'bg-primary-600 text-white border-primary-600 shadow-lg shadow-primary-500/30 scale-110'
                                                : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-primary-300'
                                            }`}
                                    >
                                        <span className="text-[10px] uppercase opacity-70 leading-none mb-1">List</span>
                                        <span className="text-sm leading-none">{idx + 1}</span>
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={() => onPageChange(Math.min(totalPages - 1, currentPage + 1))}
                                disabled={currentPage === totalPages - 1}
                                className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 disabled:opacity-50 hover:bg-slate-50 transition-all font-bold text-sm"
                            >
                                NEXT
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default StoreManagementList;
