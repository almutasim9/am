import React from 'react';
import { Search } from 'lucide-react';
import useTranslation from '../../../../hooks/useTranslation';

/**
 * Filters component for stores list
 * Provides search, health, zone, and category filters
 */
const StoresFilters = ({
    search,
    setSearch,
    healthFilter,
    setHealthFilter,
    zoneFilter,
    setZoneFilter,
    catFilter,
    setCatFilter,
    settings,
    hasActiveFilters,
    onClearFilters,
    filteredCount,
    totalCount
}) => {
    const t = useTranslation();

    return (
        <>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder={t('search')}
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border rounded-xl dark:bg-slate-700 dark:border-slate-600 dark:text-white min-h-[44px]"
                        aria-label={t('search')}
                    />
                </div>
                <select
                    value={healthFilter}
                    onChange={e => setHealthFilter(e.target.value)}
                    className="px-4 py-2.5 border rounded-xl dark:bg-slate-700 dark:border-slate-600 dark:text-white min-h-[44px]"
                    aria-label={t('storeHealth')}
                >
                    <option value="">{t('all')} - {t('storeHealth')}</option>
                    <option value="green">🟢 {t('green')}</option>
                    <option value="amber">🟡 {t('amber')}</option>
                    <option value="red">🔴 {t('red')}</option>
                </select>
                <select
                    value={zoneFilter}
                    onChange={e => setZoneFilter(e.target.value)}
                    className="px-4 py-2.5 border rounded-xl dark:bg-slate-700 dark:border-slate-600 dark:text-white min-h-[44px]"
                    aria-label={t('zones')}
                >
                    <option value="">{t('all')} {t('zones')}</option>
                    {(settings?.zones || []).map(z => <option key={z} value={z}>{z}</option>)}
                </select>
                <select
                    value={catFilter}
                    onChange={e => setCatFilter(e.target.value)}
                    className="px-4 py-2.5 border rounded-xl dark:bg-slate-700 dark:border-slate-600 dark:text-white min-h-[44px]"
                    aria-label={t('storeCategories')}
                >
                    <option value="">{t('all')} {t('storeCategories')}</option>
                    {(settings?.storeCategories || []).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>

            {/* Results Counter & View Toggle */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    {t('showing')} <span className="font-bold text-primary-600 dark:text-primary-400">{filteredCount}</span> {t('of')} <span className="font-bold">{totalCount}</span> {t('stores')}
                </p>
                <div className="flex items-center gap-2">
                    {hasActiveFilters && (
                        <button
                            onClick={onClearFilters}
                            className="px-3 py-1 text-sm bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-lg hover:bg-primary-200 transition-colors"
                        >
                            {t('clearFilters')}
                        </button>
                    )}
                </div>
            </div>
        </>
    );
};

export default StoresFilters;
