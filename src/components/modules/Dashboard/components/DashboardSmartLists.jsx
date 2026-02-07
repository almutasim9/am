import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Calendar, ChevronRight, AlertCircle, Store, CheckSquare } from 'lucide-react';

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

const DashboardSmartLists = ({ upcomingVisits, urgentTasks, stores, lang, onNewVisit }) => {
    return (
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upcoming Visits */}
            <div className="glass-card rounded-3xl p-6">
                <div className="flex items-center justify-between mb-5">
                    <h3 className="font-bold dark:text-white flex items-center gap-2 text-lg">
                        <span className="p-2 rounded-xl bg-secondary-100 dark:bg-secondary-900/40 text-secondary-600 dark:text-secondary-400">
                            <Calendar size={20} />
                        </span>
                        Upcoming Visits
                    </h3>
                    <Link to="/visits" className="text-sm font-bold text-secondary-600 hover:text-secondary-700 flex items-center gap-1 group">
                        View All <ChevronRight size={16} className="transition-transform group-hover:translate-x-1" />
                    </Link>
                </div>
                {upcomingVisits.length > 0 ? (
                    <div className="space-y-3">
                        {upcomingVisits.map(v => {
                            const store = stores.find(s => s.id === v.store_id);
                            return (
                                <div key={v.id} className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-800/50 rounded-2xl hover:bg-white dark:hover:bg-slate-700 border border-transparent hover:border-secondary-200 dark:hover:border-secondary-800 transition-all group hover:shadow-lg hover:shadow-secondary-500/5">
                                    <div className="flex items-center gap-3">
                                        <div className="flex flex-col items-center justify-center w-12 h-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm text-center">
                                            <span className="text-[10px] font-bold text-red-500 uppercase">{new Date(v.date).toLocaleDateString(lang, { month: 'short' })}</span>
                                            <span className="text-lg font-bold text-slate-700 dark:text-slate-200 leading-none">{new Date(v.date).getDate()}</span>
                                        </div>
                                        <div>
                                            <p className="font-bold dark:text-white text-sm group-hover:text-secondary-600 transition-colors line-clamp-1">{store?.name || 'Unknown'}</p>
                                            <p className="text-xs text-slate-500 font-medium">{new Date(v.date).toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit' })}</p>
                                        </div>
                                    </div>
                                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${v.type === 'Visit' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                                        }`}>
                                        {v.type.toUpperCase()}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-10">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Calendar size={32} className="text-slate-400" />
                        </div>
                        <p className="text-slate-500 font-medium">No upcoming visits</p>
                        <button onClick={() => onNewVisit()} className="mt-3 px-4 py-2 bg-gradient-to-r from-secondary-500 to-secondary-600 text-white rounded-xl text-sm font-bold hover:from-secondary-600 hover:to-secondary-700 transition-all shadow-md shadow-secondary-500/20">
                            + Schedule Visit
                        </button>
                    </div>
                )}
            </div>

            {/* Urgent Tasks */}
            <div className="glass-card rounded-3xl p-6">
                <div className="flex items-center justify-between mb-5">
                    <h3 className="font-bold dark:text-white flex items-center gap-2 text-lg">
                        <span className="p-2 rounded-xl bg-red-50 dark:bg-red-900/40 text-red-600 dark:text-red-400">
                            <AlertCircle size={20} />
                        </span>
                        High Priority Tasks
                    </h3>
                    <Link to="/tasks" className="text-sm font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1 group">
                        View All <ChevronRight size={16} className="transition-transform group-hover:translate-x-1" />
                    </Link>
                </div>
                {urgentTasks.length > 0 ? (
                    <div className="space-y-3">
                        {urgentTasks.map(task => {
                            const store = stores.find(s => s.id === task.store_id);
                            return (
                                <div key={task.id} className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-800/50 rounded-2xl hover:bg-white dark:hover:bg-slate-700 border border-transparent hover:border-primary-200 dark:hover:border-primary-800 transition-all group hover:shadow-lg hover:shadow-primary-500/5">
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold dark:text-white text-sm group-hover:text-primary-600 transition-colors line-clamp-1">{task.sub}</p>
                                        <p className="text-xs text-slate-500 flex items-center gap-1 font-medium italic">
                                            <Store size={10} /> {store?.name}
                                        </p>
                                    </div>
                                    <span className="px-3 py-1 rounded-lg text-[10px] font-bold text-white bg-gradient-to-r from-red-500 to-pink-600 shadow-md shadow-red-500/20 uppercase tracking-wider">
                                        High
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-10">
                        <div className="w-16 h-16 bg-primary-50 dark:bg-primary-900/10 rounded-full flex items-center justify-center mx-auto mb-3 border-2 border-primary-100 dark:border-primary-800 shadow-sm">
                            <CheckSquare size={32} className="text-primary-600" />
                        </div>
                        <p className="text-slate-500 font-bold">No urgent tasks</p>
                        <p className="text-primary-600 dark:text-primary-400 text-sm font-bold mt-1 animate-pulse">All Caught Up! 🎉</p>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default DashboardSmartLists;
