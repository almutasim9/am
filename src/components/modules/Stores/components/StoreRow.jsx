import React from 'react';
import { Phone, Edit2, Trash2 } from 'lucide-react';
import { getStoreHealth } from '../../../../utils/helpers';
import useTranslation from '../../../../hooks/useTranslation';

/**
 * Store row component for list view
 * Displays store info in a compact row format
 */
const StoreRow = ({
    store,
    onSelect,
    onEdit,
    onDelete
}) => {
    const t = useTranslation();
    const now = Date.now();
    const health = getStoreHealth(store.last_visit);
    const daysSince = store.last_visit
        ? Math.floor((now - new Date(store.last_visit).getTime()) / (1000 * 60 * 60 * 24))
        : null;

    return (
        <div
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm hover:shadow-md transition-all border border-slate-100 dark:border-slate-700 hover:border-primary-200 dark:hover:border-primary-800 overflow-hidden"
        >
            <div className="flex items-center">
                {/* Health Indicator */}
                <div className={`w-1.5 h-full min-h-[80px] ${health === 'green' ? 'bg-emerald-500' :
                    health === 'amber' ? 'bg-amber-500' :
                        'bg-red-500'
                    }`} />

                {/* Content */}
                <div className="flex-1 flex items-center justify-between p-4 gap-4">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <h3
                                onClick={() => onSelect(store)}
                                className="font-bold dark:text-white cursor-pointer hover:text-primary-600 transition-colors truncate"
                            >
                                {store.name}
                            </h3>
                            <span className={`px-2 py-0.5 rounded-full text-xs ${store.status === 'Active'
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30'
                                : 'bg-slate-100 text-slate-600'
                                }`}>
                                {store.status === 'Active' ? '● Active' : '○ Closed'}
                            </span>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            📍 {store.zone}{store.area_name ? ` - ${store.area_name}` : ''} • {store.owner}
                        </p>
                    </div>

                    {/* Visit Status */}
                    <div className={`text-center px-3 py-1.5 rounded-lg ${health === 'green' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20' :
                        health === 'amber' ? 'bg-amber-50 text-amber-700' :
                            'bg-red-50 text-red-700'
                        }`}>
                        <p className="text-lg font-bold">{daysSince !== null ? daysSince : '-'}</p>
                        <p className="text-xs">days</p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => window.open(`tel:${store.phone}`)}
                            aria-label={`${t('call')} ${store.name}`}
                            className="p-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
                        >
                            <Phone size={16} />
                        </button>
                        <button
                            onClick={() => onSelect(store)}
                            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-semibold transition-all shadow-sm shadow-primary-500/10"
                        >
                            {t('viewProfile')}
                        </button>
                        <button
                            onClick={() => onEdit(store)}
                            aria-label={`${t('edit')} ${store.name}`}
                            className="p-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors"
                        >
                            <Edit2 size={16} />
                        </button>
                        <button
                            onClick={() => onDelete(store.id)}
                            aria-label={`${t('delete')} ${store.name}`}
                            className="p-2 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StoreRow;
