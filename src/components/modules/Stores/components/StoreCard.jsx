import React from 'react';
import { Phone, ChevronRight, Edit2, Trash2, Tag as TagIcon } from 'lucide-react';
import { getStoreHealth } from '../../../../utils/helpers';
import useTranslation from '../../../../hooks/useTranslation';

/**
 * Store card component for grid view
 * Displays store info in a card format with actions
 */
const StoreCard = ({
    store,
    onSelect,
    onEdit,
    onDelete,
    bulkMode = false,
    isSelected = false,
    onToggleSelect
}) => {
    const t = useTranslation();
    const now = Date.now();
    const health = getStoreHealth(store.last_visit);
    const daysSince = store.last_visit
        ? Math.floor((now - new Date(store.last_visit).getTime()) / (1000 * 60 * 60 * 24))
        : null;

    return (
        <div
            className="group bg-white dark:bg-slate-800 rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-300 overflow-hidden border border-slate-100 dark:border-slate-700 hover:border-primary-200 dark:hover:border-primary-800 hover:-translate-y-1"
        >
            {/* Health Bar with Gradient */}
            <div className={`h-1.5 ${health === 'green' ? 'bg-gradient-to-r from-emerald-400 to-emerald-600' :
                health === 'amber' ? 'bg-gradient-to-r from-amber-400 to-amber-600' :
                    'bg-gradient-to-r from-red-400 to-red-600'
                }`} />

            <div className="p-5">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    {/* Bulk Selection Checkbox */}
                    {bulkMode && (
                        <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={onToggleSelect}
                            className="w-5 h-5 rounded accent-red-600 mr-3 mt-1 cursor-pointer"
                            aria-label={`Select ${store.name}`}
                        />
                    )}
                    <div className="flex-1 min-w-0">
                        <h3
                            onClick={() => !bulkMode && onSelect(store)}
                            className={`font-bold text-lg dark:text-white transition-colors truncate ${bulkMode ? 'cursor-default' : 'cursor-pointer hover:text-primary-600 dark:hover:text-primary-400'
                                }`}
                        >
                            {store.name}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 truncate mt-0.5">
                            📍 {store.zone}{store.area_name ? ` - ${store.area_name}` : ''}
                        </p>
                    </div>
                    <div className="flex flex-col items-end gap-1 ml-2">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${store.status === 'Active'
                            ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                            }`}>
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
                    <div className={`rounded-xl p-2.5 ${health === 'green' ? 'bg-emerald-50 dark:bg-emerald-900/20' :
                        health === 'amber' ? 'bg-amber-50 dark:bg-amber-900/20' :
                            'bg-red-50 dark:bg-red-900/20'
                        }`}>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{t('lastVisit')}</p>
                        <p className={`font-medium text-sm ${health === 'green' ? 'text-emerald-700 dark:text-emerald-400' :
                            health === 'amber' ? 'text-amber-700 dark:text-amber-400' :
                                'text-red-700 dark:text-red-400'
                            }`}>
                            {daysSince !== null ? `${daysSince} days` : 'Never'}
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-3 border-t border-slate-100 dark:border-slate-700">
                    <button
                        onClick={() => window.open(`tel:${store.phone}`)}
                        title={t('call')}
                        aria-label={`${t('call')} ${store.name}`}
                        className="p-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-sm transition-colors"
                    >
                        <Phone size={18} />
                    </button>
                    <button
                        onClick={() => onSelect(store)}
                        className="flex-1 py-2.5 bg-gradient-to-r from-primary-600 to-indigo-700 hover:from-primary-700 hover:to-indigo-800 text-white rounded-xl text-sm font-bold shadow-md shadow-primary-500/10 transition-all flex items-center justify-center gap-1"
                    >
                        {t('viewProfile')} <ChevronRight size={16} />
                    </button>
                    <button
                        onClick={() => onEdit(store)}
                        aria-label={`${t('edit')} ${store.name}`}
                        className="p-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 rounded-xl transition-colors"
                    >
                        <Edit2 size={18} />
                    </button>
                    <button
                        onClick={() => onDelete(store.id)}
                        title={t('delete')}
                        aria-label={`${t('delete')} ${store.name}`}
                        className="p-2.5 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 rounded-xl transition-colors"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StoreCard;
