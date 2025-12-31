import React, { useState } from 'react';
import { AlertCircle, CheckCircle, Store } from 'lucide-react';
import { formatDate } from '../../utils/helpers';

const NotificationBell = ({ tasks, visits, stores = [] }) => {
    const [isOpen, setIsOpen] = useState(false);

    const overdueTasks = tasks.filter(t => {
        if (t.status === 'done') return false;
        if (!t.due_date) return false;
        return new Date(t.due_date) < new Date();
    });

    const overdueVisits = visits.filter(v => {
        if (v.status !== 'scheduled') return false;
        if (!v.date) return false;
        return new Date(v.date) < new Date();
    });

    const totalOverdue = overdueTasks.length + overdueVisits.length;

    const findStoreName = (id) => {
        const store = stores.find(s => s.id === id);
        return store ? store.name : 'Unknown Store';
    };

    return (
        <div className="relative">
            <button onClick={() => setIsOpen(!isOpen)} className="relative p-2 bg-slate-100 dark:bg-slate-700 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                <AlertCircle size={20} className={totalOverdue > 0 ? 'text-red-500' : 'text-slate-500'} />
                {totalOverdue > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                        {totalOverdue}
                    </span>
                )}
            </button>
            {isOpen && (
                <>
                    <div className="absolute top-full mt-2 right-0 w-80 max-w-[calc(100vw-2rem)] bg-white dark:bg-slate-800 rounded-xl shadow-xl border dark:border-slate-700 z-50 max-h-96 overflow-y-auto">
                        <div className="p-3 border-b dark:border-slate-700">
                            <h3 className="font-bold dark:text-white">⚠️ Alerts ({totalOverdue})</h3>
                        </div>
                        {totalOverdue > 0 ? (
                            <div className="p-2 space-y-2">
                                {overdueTasks.map(t => (
                                    <div key={t.id} className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                                        <div className="flex justify-between items-start">
                                            <p className="text-sm font-medium text-red-700 dark:text-red-400">📌 {t.sub}</p>
                                        </div>
                                        <p className="text-xs text-red-600 dark:text-red-500 flex items-center gap-1 mt-1">
                                            <Store size={10} /> {findStoreName(t.store_id)}
                                        </p>
                                        <p className="text-xs text-red-500/80 mt-1">Overdue - {formatDate(t.due_date)}</p>
                                    </div>
                                ))}
                                {overdueVisits.map(v => (
                                    <div key={v.id} className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                                        <div className="flex justify-between items-start">
                                            <p className="text-sm font-medium text-amber-700 dark:text-amber-400">📅 Missed Visit</p>
                                        </div>
                                        <p className="text-xs text-amber-600 dark:text-amber-500 flex items-center gap-1 mt-1">
                                            <Store size={10} /> {findStoreName(v.store_id)}
                                        </p>
                                        <p className="text-xs text-amber-500/80 mt-1">{v.type} - {formatDate(v.date)}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-6 text-center">
                                <CheckCircle size={32} className="mx-auto text-emerald-500 mb-2" />
                                <p className="text-sm text-slate-500">No alerts</p>
                            </div>
                        )}
                    </div>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                </>
            )}
        </div>
    );
};

export default NotificationBell;
