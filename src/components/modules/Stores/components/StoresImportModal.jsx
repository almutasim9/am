import React from 'react';
import useTranslation from '../../../../hooks/useTranslation';

/**
 * Import modal content for stores
 * Handles preview and confirmation of Excel/CSV imports
 */
const StoresImportModal = ({
    importData,
    onConfirm,
    onDownloadTemplate
}) => {
    const t = useTranslation();

    if (importData.isLoading && importData.stores.length === 0) {
        return (
            <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                <p className="dark:text-white">{t('importing')}</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
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
                <button
                    onClick={onDownloadTemplate}
                    className="flex-1 py-2 bg-slate-200 dark:bg-slate-700 dark:text-white rounded-xl hover:bg-slate-300 text-sm"
                >
                    {t('downloadTemplate')}
                </button>
                <button
                    onClick={onConfirm}
                    disabled={importData.stores.length === 0 || importData.isLoading}
                    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {importData.isLoading ? t('importing') : `${t('importStores')} (${importData.stores.length})`}
                </button>
            </div>
        </div>
    );
};

export default StoresImportModal;
