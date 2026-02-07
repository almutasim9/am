import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

const WeeklyProgressSummary = ({ weekVisitsCount, doneTasksCount, completionRate, healthyStores, warningStores, urgentStores }) => {
    return (
        <motion.div variants={itemVariants} className="glass-card rounded-3xl p-6">
            <h3 className="font-bold dark:text-white flex items-center gap-2 mb-6 text-lg">
                <span className="p-2 rounded-xl bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400">
                    <TrendingUp size={20} />
                </span>
                This Week Progress
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-5 bg-gradient-to-br from-secondary-50/50 to-white dark:from-secondary-900/10 dark:to-slate-800 rounded-3xl border border-secondary-100/50 dark:border-secondary-900/30 transition-all hover:shadow-md">
                    <p className="text-3xl font-black text-secondary-600 dark:text-secondary-400">{weekVisitsCount}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">Visits Done</p>
                </div>
                <div className="text-center p-5 bg-gradient-to-br from-primary-50/50 to-white dark:from-primary-900/10 dark:to-slate-800 rounded-3xl border border-primary-100/50 dark:border-primary-900/30 transition-all hover:shadow-md">
                    <p className="text-3xl font-black text-primary-600 dark:text-primary-400">{doneTasksCount}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">Tasks Done</p>
                </div>
                <div className="text-center p-5 bg-gradient-to-br from-amber-50/50 to-white dark:from-amber-900/10 dark:to-slate-800 rounded-3xl border border-amber-100/50 dark:border-amber-900/30 transition-all hover:shadow-md">
                    <p className="text-3xl font-black text-amber-600 dark:text-amber-400">{completionRate}%</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">Efficiency</p>
                </div>
                <div className="text-center p-5 bg-slate-50/50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-700 flex flex-col justify-center transition-all hover:shadow-md">
                    <div className="flex items-center justify-center gap-4 mb-2">
                        <div className="flex flex-col items-center">
                            <span className="w-2.5 h-2.5 rounded-full bg-secondary-500 mb-1 shadow-lg shadow-secondary-500/40"></span>
                            <span className="text-sm font-black dark:text-white">{healthyStores}</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 mb-1 shadow-lg shadow-amber-500/40"></span>
                            <span className="text-sm font-black dark:text-white">{warningStores}</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="w-2.5 h-2.5 rounded-full bg-red-500 mb-1 shadow-lg shadow-red-500/40"></span>
                            <span className="text-sm font-black dark:text-white">{urgentStores}</span>
                        </div>
                    </div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Health</p>
                </div>
            </div>
        </motion.div>
    );
};

export default WeeklyProgressSummary;
