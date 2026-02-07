import React from 'react';
import { Plus, Upload, Archive, Trash2 } from 'lucide-react';
import useTranslation from '../../../../hooks/useTranslation';

const StoreHeader = ({
    bulkMode,
    setBulkMode,
    onExport,
    onImport,
    onAdd,
    search,
    setSearch
}) => {
    const t = useTranslation();

    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h1 className="text-2xl font-bold dark:text-white">{t('stores')}</h1>
            <div className="flex flex-wrap gap-2">
                {!bulkMode && (
                    <>
                        <button
                            onClick={() => setBulkMode(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-primary-600 dark:text-primary-400 rounded-xl hover:bg-primary-100/50 transition-colors border border-primary-100 dark:border-primary-800"
                            aria-label="Enable multi-select mode"
                        >
                            <Trash2 size={18} />
                            Multi-Select
                        </button>
                        <button
                            onClick={onExport}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-xl transition-colors"
                            aria-label={t('exportCSV')}
                        >
                            <Archive size={18} />{t('exportCSV')}
                        </button>
                        <button
                            onClick={onImport}
                            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 text-secondary-600 dark:text-secondary-400 border border-secondary-200 dark:border-secondary-800 rounded-xl hover:bg-secondary-50 transition-colors"
                            aria-label={t('importCSV')}
                        >
                            <Upload size={18} />{t('importCSV')}
                        </button>
                        <button
                            onClick={onAdd}
                            className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl min-h-[44px] shadow-lg shadow-primary-500/20 active:bg-primary-800 transition-all font-semibold"
                            aria-label={t('addStore')}
                        >
                            <Plus size={18} /><span className="hidden sm:inline">{t('addStore')}</span><span className="sm:hidden">Add</span>
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default StoreHeader;
