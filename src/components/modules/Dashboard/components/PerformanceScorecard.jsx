import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Clock, Store } from 'lucide-react';

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

const PerformanceScorecard = ({ weekVisitsCount, doneTasksCount, topStoreName }) => {
    return (
        <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-2 mb-6">
                <div className="p-2 bg-gradient-to-br from-primary-600 to-indigo-700 rounded-xl text-white shadow-lg shadow-primary-500/30">
                    <Trophy size={20} />
                </div>
                <h2 className="font-bold text-lg dark:text-white">Your Performance</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Visits Goal */}
                <div className="flex items-center gap-4">
                    <div className="relative w-16 h-16 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-slate-100 dark:text-slate-700" />
                            <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" strokeDasharray={2 * Math.PI * 28} strokeDashoffset={2 * Math.PI * 28 * (1 - Math.min(weekVisitsCount / 40, 1))} className="text-primary-600" strokeLinecap="round" />
                        </svg>
                        <span className="absolute text-sm font-bold dark:text-white">{Math.min(Math.round((weekVisitsCount / 40) * 100), 100)}%</span>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Weekly Visit Goal</p>
                        <p className="text-xl font-bold dark:text-white">{weekVisitsCount} <span className="text-sm font-normal text-slate-400">/ 40</span></p>
                    </div>
                </div>

                {/* Task Efficiency */}
                <div className="flex items-center gap-4 border-l border-slate-100 dark:border-slate-700 pl-6">
                    <div className="p-3 bg-primary-50 dark:bg-primary-900/30 rounded-2xl text-primary-600 dark:text-primary-400">
                        <Clock size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Task Completion</p>
                        <p className="text-xl font-bold dark:text-white">{doneTasksCount} <span className="text-sm font-normal text-slate-400">tasks done</span></p>
                        <p className="text-xs text-primary-600 dark:text-primary-400 font-medium">Avg. 2h response</p>
                    </div>
                </div>

                {/* Top Client */}
                <div className="flex items-center gap-4 border-l border-slate-100 dark:border-slate-700 pl-6">
                    <div className="p-3 bg-amber-50 dark:bg-amber-900/30 rounded-2xl text-amber-600 dark:text-amber-400">
                        <Store size={24} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Most Visited Store</p>
                        <p className="text-lg font-bold dark:text-white truncate">{topStoreName || 'No Data'}</p>
                        <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">3 visits this month</p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default PerformanceScorecard;
