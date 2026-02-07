import React from 'react';
import { Edit2, Trash2, MapPin } from 'lucide-react';
import { formatDate } from '../../../../utils/helpers';

/**
 * Visit card component for list view
 * Displays individual visit with actions
 */
const VisitCard = ({
    visit,
    store,
    activeTab,
    onComplete,
    onEdit,
    onDelete,
    onOpenMap
}) => {
    const now = Date.now();

    const getDaysUntil = (date) => {
        if (!date) return null;
        const diff = Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24));
        return diff;
    };

    const isToday = (date) => {
        if (!date) return false;
        try {
            return new Date(date).toDateString() === new Date().toDateString();
        } catch {
            return false;
        }
    };

    const daysUntil = getDaysUntil(visit.date);
    const today = isToday(visit.date);
    const isPast = daysUntil !== null && daysUntil < 0;

    return (
        <div
            className={`bg-white dark:bg-slate-800 rounded-xl shadow-sm hover:shadow-md transition-all border overflow-hidden ${today ? 'border-emerald-300 ring-2 ring-emerald-100' :
                    isPast && activeTab === 'scheduled' ? 'border-red-300' :
                        'border-slate-100 dark:border-slate-700'
                }`}
        >
            <div className="flex items-stretch">
                {/* Date Column */}
                <div className={`w-20 flex flex-col items-center justify-center p-3 ${today ? 'bg-emerald-500 text-white' :
                        activeTab === 'completed' ? 'bg-emerald-50 dark:bg-emerald-900/20' :
                            isPast ? 'bg-red-50 dark:bg-red-900/20' :
                                'bg-slate-50 dark:bg-slate-700/50'
                    }`}>
                    <span className={`text-2xl font-bold ${today ? 'text-white' :
                            activeTab === 'completed' ? 'text-emerald-600' :
                                isPast ? 'text-red-600' :
                                    'text-slate-700 dark:text-slate-300'
                        }`}>
                        {new Date(visit.date).getDate()}
                    </span>
                    <span className={`text-xs ${today ? 'text-emerald-100' : 'text-slate-500'}`}>
                        {new Date(visit.date).toLocaleDateString('en', { month: 'short' })}
                    </span>
                </div>

                {/* Content */}
                <div className="flex-1 flex items-center justify-between p-4">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold dark:text-white">{store?.name || 'Unknown'}</h3>
                            {today && <span className="px-2 py-0.5 rounded-full text-xs bg-emerald-100 text-emerald-700">Today</span>}
                            {isPast && activeTab === 'scheduled' && <span className="px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-700">⚠️ Overdue</span>}
                            {activeTab === 'completed' && (
                                <span className={`px-2 py-0.5 rounded-full text-xs ${visit.is_effective ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                                    {visit.is_effective ? '✓ Effective' : '✗ Not effective'}
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">🏷️ {visit.type} • 📅 {formatDate(visit.date)}</p>
                        {visit.note && <p className="text-xs text-slate-400 mt-1 truncate">💬 {visit.note}</p>}
                    </div>

                    {/* Days Counter */}
                    {activeTab === 'scheduled' && daysUntil !== null && !today && (
                        <div className={`mx-3 text-center px-3 py-1.5 rounded-lg ${daysUntil < 0 ? 'bg-red-100 text-red-700' :
                                daysUntil <= 2 ? 'bg-amber-100 text-amber-700' :
                                    'bg-slate-100 text-slate-600'
                            }`}>
                            <p className="text-lg font-bold">{Math.abs(daysUntil)}</p>
                            <p className="text-xs">{daysUntil < 0 ? 'Overdue' : 'days'}</p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => onOpenMap(visit.store_id)}
                            className="p-2 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 text-blue-600 rounded-lg"
                            title="Open Map"
                            aria-label="Open store location on map"
                        >
                            <MapPin size={18} />
                        </button>
                        {activeTab === 'scheduled' && (
                            <>
                                <button
                                    onClick={() => onComplete(visit)}
                                    className="px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm"
                                >
                                    Complete
                                </button>
                                <button
                                    onClick={() => onEdit(visit)}
                                    className="p-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-600 dark:text-slate-300 rounded-lg"
                                    aria-label="Edit visit"
                                >
                                    <Edit2 size={18} />
                                </button>
                            </>
                        )}
                        {activeTab === 'completed' && (
                            <button
                                onClick={() => onDelete(visit.id)}
                                className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg"
                                aria-label="Delete visit"
                            >
                                <Trash2 size={18} />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VisitCard;
