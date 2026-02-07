import React from 'react';
import { Calendar, Clock, AlertTriangle, TrendingUp } from 'lucide-react';

/**
 * Stats cards for visits module
 * Shows total, today, overdue, and effectiveness rate
 */
const VisitsStats = ({ stats }) => {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <Calendar size={20} className="text-blue-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold dark:text-white">{stats.total}</p>
                        <p className="text-xs text-slate-500">Total Visits</p>
                    </div>
                </div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                        <Clock size={20} className="text-amber-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-amber-600">{stats.today}</p>
                        <p className="text-xs text-slate-500">Today</p>
                    </div>
                </div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                        <AlertTriangle size={20} className="text-red-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
                        <p className="text-xs text-slate-500">Overdue</p>
                    </div>
                </div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                        <TrendingUp size={20} className="text-emerald-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-emerald-600">{stats.effectiveRate}%</p>
                        <p className="text-xs text-slate-500">Effective Rate</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VisitsStats;
