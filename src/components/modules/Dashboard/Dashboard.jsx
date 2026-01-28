import React, { useContext, useEffect, useState } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Store, AlertCircle, CheckSquare, Calendar, ChevronRight, Phone, TrendingUp, RefreshCw, CalendarPlus, Clock, Target, Zap, Trophy, BarChart2 } from 'lucide-react';
import useTranslation from '../../../hooks/useTranslation';
import { DataContext } from '../../../contexts/DataContext';
import { AuthContext, LangContext } from '../../../contexts/AppContext';
import { getStoreHealth, formatDate, priorityColors } from '../../../utils/helpers';
import PageTransition from '../../common/PageTransition';
import { DashboardStatsSkeleton, CardSkeleton } from '../../common/Skeleton';

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

const Dashboard = () => {
    const { stores, visits, tasks, isLoading, refreshData } = useContext(DataContext);
    const { user } = useContext(AuthContext);
    const { lang } = useContext(LangContext);
    const { openVisitDialog: onNewVisit, openTaskDialog: onNewTask } = useOutletContext();
    const t = useTranslation();

    const [isRefreshing, setIsRefreshing] = useState(false);

    // Auto-refresh every 2 minutes
    useEffect(() => {
        const interval = setInterval(() => {
            refreshData(false);
        }, 120000);
        return () => clearInterval(interval);
    }, [refreshData]);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await refreshData(false);
        setTimeout(() => setIsRefreshing(false), 500);
    };

    // Calculate metrics
    const urgentStores = stores.filter(s => getStoreHealth(s.last_visit) === 'red').length;
    const healthyStores = stores.filter(s => getStoreHealth(s.last_visit) === 'green').length;
    const warningStores = stores.filter(s => getStoreHealth(s.last_visit) === 'amber').length;
    const pendingTasks = tasks.filter(t => t.status === 'pending').length;
    const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
    const doneTasks = tasks.filter(t => t.status === 'done').length;
    const highPriorityTasks = tasks.filter(t => t.status === 'pending' && t.priority === 'high').length;

    // Today's data
    const today = new Date().toDateString();
    const todayVisits = visits.filter(v => v.status === 'scheduled' && new Date(v.date).toDateString() === today);
    const upcomingVisits = visits.filter(v => v.status === 'scheduled').sort((a, b) => new Date(a.date) - new Date(b.date)).slice(0, 4);
    const urgentTasks = tasks.filter(t => t.status === 'pending' && t.priority === 'high').slice(0, 4);

    // Weekly stats
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const weekVisits = visits.filter(v => v.status === 'completed' && new Date(v.date) >= weekAgo);
    const effectiveVisits = weekVisits.filter(v => v.is_effective).length;
    const completionRate = weekVisits.length > 0 ? Math.round(effectiveVisits / weekVisits.length * 100) : 0;

    // Get greeting based on time
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';

    if (isLoading) {
        return (
            <PageTransition>
                <div className="space-y-4">
                    <div className="h-16 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse" />
                    <DashboardStatsSkeleton />
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <CardSkeleton />
                        <CardSkeleton />
                    </div>
                </div>
            </PageTransition>
        );
    }

    return (
        <PageTransition>
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="space-y-4 sm:space-y-6"
            >
                {/* Header - Compact */}
                <motion.div variants={itemVariants} className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold dark:text-white font-sans tracking-tight">
                            {greeting} <span className="text-yellow-400 inline-block animate-wave">👋</span>
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">
                            Welcome back, <span className="text-primary-600 dark:text-primary-400 font-bold">{user?.user?.username || user?.username || 'User'}</span>
                        </p>
                    </div>
                    <button
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className="p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm hover:shadow-lg hover:shadow-primary-500/10 transition-all disabled:opacity-50 border border-slate-100 dark:border-slate-700"
                    >
                        <RefreshCw size={20} className={`text-primary-600 ${isRefreshing ? 'animate-spin' : ''}`} />
                    </button>
                </motion.div>

                {/* Personal Scorecard */}
                <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl text-white shadow-lg shadow-indigo-500/30">
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
                                    <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" strokeDasharray={2 * Math.PI * 28} strokeDashoffset={2 * Math.PI * 28 * (1 - Math.min(weekVisits.length / 40, 1))} className="text-indigo-500" strokeLinecap="round" />
                                </svg>
                                <span className="absolute text-sm font-bold dark:text-white">{Math.min(Math.round((weekVisits.length / 40) * 100), 100)}%</span>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Weekly Visit Goal</p>
                                <p className="text-xl font-bold dark:text-white">{weekVisits.length} <span className="text-sm font-normal text-slate-400">/ 40</span></p>
                            </div>
                        </div>

                        {/* Task Efficiency */}
                        <div className="flex items-center gap-4 border-l border-slate-100 dark:border-slate-700 pl-6">
                            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl text-emerald-600 dark:text-emerald-400">
                                <Clock size={24} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Task Completion</p>
                                <p className="text-xl font-bold dark:text-white">{doneTasks} <span className="text-sm font-normal text-slate-400">tasks done</span></p>
                                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Avg. 2h response</p>
                            </div>
                        </div>

                        {/* Top Client */}
                        <div className="flex items-center gap-4 border-l border-slate-100 dark:border-slate-700 pl-6">
                            <div className="p-3 bg-amber-50 dark:bg-amber-900/30 rounded-2xl text-amber-600 dark:text-amber-400">
                                <Store size={24} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Most Visited Store</p>
                                <p className="text-lg font-bold dark:text-white truncate">{stores[0]?.name || 'No Data'}</p>
                                <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">3 visits this month</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Today's Focus */}
                <motion.div variants={itemVariants} className="bg-gradient-to-br from-primary-600 via-primary-700 to-indigo-800 rounded-3xl p-6 text-white shadow-xl shadow-primary-500/30 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
                                <Target size={20} className="text-white" />
                            </div>
                            <h2 className="font-bold text-lg">Today's Focus</h2>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="text-center p-4 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10 transition-transform hover:-translate-y-1">
                                <p className="text-3xl font-bold mb-1">{todayVisits.length}</p>
                                <p className="text-xs text-primary-100 font-medium uppercase tracking-wider">Visits Today</p>
                            </div>
                            <div className="text-center p-4 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10 transition-transform hover:-translate-y-1">
                                <p className="text-3xl font-bold mb-1">{highPriorityTasks}</p>
                                <p className="text-xs text-primary-100 font-medium uppercase tracking-wider">High Priority</p>
                            </div>
                            <div className="text-center p-4 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10 transition-transform hover:-translate-y-1 relative group">
                                <div className={`absolute inset-0 bg-red-500/20 rounded-2xl blur-xl transition-opacity ${urgentStores > 0 ? 'opacity-100' : 'opacity-0'}`} />
                                <p className="text-3xl font-bold text-red-100 relative z-10">{urgentStores}</p>
                                <p className="text-xs text-primary-100 font-medium uppercase tracking-wider relative z-10">Need Visit</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Quick Actions */}
                <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4">
                    <button onClick={() => onNewVisit()}
                        className="glass-card group flex items-center justify-center gap-3 p-6 rounded-3xl hover:border-primary-500/50 transition-all duration-300">
                        <div className="p-3 bg-secondary-50 dark:bg-secondary-900/30 rounded-2xl text-secondary-600 transition-transform group-hover:scale-110 group-hover:rotate-3">
                            <Calendar size={24} />
                        </div>
                        <span className="font-bold text-slate-700 dark:text-slate-200 text-lg">New Visit</span>
                    </button>
                    <button onClick={() => onNewTask()}
                        className="glass-card group flex items-center justify-center gap-3 p-6 rounded-3xl hover:border-primary-500/50 transition-all duration-300">
                        <div className="p-3 bg-primary-50 dark:bg-primary-900/30 rounded-2xl text-primary-600 transition-transform group-hover:scale-110 group-hover:-rotate-3">
                            <CheckSquare size={24} />
                        </div>
                        <span className="font-bold text-slate-700 dark:text-slate-200 text-lg">New Task</span>
                    </button>
                </motion.div>

                {/* Compact Stats Row */}
                <motion.div variants={itemVariants} className="grid grid-cols-3 gap-3 sm:gap-4">
                    <Link to="/stores" className="glass-card p-4 rounded-2xl hover:bg-white/90 dark:hover:bg-slate-800/90 transition-all text-center group">
                        <Store size={24} className="mx-auto mb-2 text-primary-500 group-hover:scale-110 transition-transform" />
                        <p className="text-2xl font-bold dark:text-white group-hover:text-primary-600 transition-colors">{stores.length}</p>
                        <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Stores</p>
                    </Link>
                    <Link to="/stores" className="glass-card p-4 rounded-2xl hover:bg-red-50/50 dark:hover:bg-red-900/20 transition-all text-center group">
                        <AlertCircle size={24} className="mx-auto mb-2 text-red-500 group-hover:scale-110 transition-transform" />
                        <p className="text-2xl font-bold text-red-600 dark:text-red-400 group-hover:text-red-700 transition-colors">{urgentStores}</p>
                        <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Urgent</p>
                    </Link>
                    <Link to="/tasks" className="glass-card p-4 rounded-2xl hover:bg-amber-50/50 dark:hover:bg-amber-900/20 transition-all text-center group">
                        <CheckSquare size={24} className="mx-auto mb-2 text-amber-500 group-hover:scale-110 transition-transform" />
                        <p className="text-2xl font-bold dark:text-white group-hover:text-amber-600 transition-colors">{pendingTasks}</p>
                        <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Tasks</p>
                    </Link>
                </motion.div>

                {/* Urgent Stores Alert */}
                {urgentStores > 0 && (
                    <motion.div variants={itemVariants} className="relative overflow-hidden rounded-3xl p-[1px] bg-gradient-to-r from-red-200 to-orange-200 dark:from-red-900/50 dark:to-orange-900/50">
                        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-[23px] p-5 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />

                            <div className="flex items-center justify-between mb-4 relative z-10">
                                <h3 className="font-bold text-red-700 dark:text-red-400 flex items-center gap-2 text-lg">
                                    <div className="p-1.5 bg-red-100 dark:bg-red-900/40 rounded-lg animate-pulse">
                                        <Zap size={18} />
                                    </div>
                                    Stores Need Visit
                                </h3>
                                <Link to="/stores" className="text-sm font-semibold text-red-600 hover:text-red-700 hover:underline">
                                    View All
                                </Link>
                            </div>
                            <div className="space-y-3 relative z-10">
                                {stores.filter(s => getStoreHealth(s.last_visit) === 'red').slice(0, 3).map(store => {
                                    const days = store.last_visit
                                        // eslint-disable-next-line
                                        ? Math.floor((Date.now() - new Date(store.last_visit).getTime()) / (1000 * 60 * 60 * 24))
                                        : null;
                                    return (
                                        <div key={store.id} className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-2xl border border-red-100 dark:border-red-900/30 hover:shadow-md transition-shadow">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-600 dark:text-red-400 font-bold text-sm border border-red-100 dark:border-red-900/30">
                                                    {store.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-bold dark:text-white text-sm">{store.name}</p>
                                                    <p className="text-xs text-red-500 font-medium">{days !== null ? `${days} days ago` : 'Never visited'}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => onNewVisit(store.id)}
                                                    className="p-2 bg-primary-50 dark:bg-primary-900/30 text-primary-600 rounded-xl hover:bg-primary-100 dark:hover:bg-primary-900/50 transition-colors"
                                                >
                                                    <CalendarPlus size={18} />
                                                </button>
                                                <button
                                                    onClick={() => window.open(`tel:${store.phone}`)}
                                                    className="p-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors"
                                                >
                                                    <Phone size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Smart Lists */}
                <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Upcoming Visits */}
                    <motion.div variants={itemVariants} className="glass-card rounded-3xl p-6">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="font-bold dark:text-white flex items-center gap-2 text-lg">
                                <span className="p-2 rounded-xl bg-secondary-100 dark:bg-secondary-900/30 text-secondary-600 dark:text-secondary-400">
                                    <Calendar size={20} />
                                </span>
                                Upcoming Visits
                            </h3>
                            <Link to="/visits" className="text-sm font-semibold text-secondary-600 hover:text-secondary-700 flex items-center gap-1 group">
                                View All <ChevronRight size={16} className="transition-transform group-hover:translate-x-1" />
                            </Link>
                        </div>
                        {upcomingVisits.length > 0 ? (
                            <div className="space-y-3">
                                {upcomingVisits.map(v => {
                                    const store = stores.find(s => s.id === v.store_id);
                                    return (
                                        <div key={v.id} className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-800/50 rounded-2xl hover:bg-white dark:hover:bg-slate-700 border border-transparent hover:border-secondary-200 dark:hover:border-secondary-800 transition-all group">
                                            <div className="flex items-center gap-3">
                                                <div className="flex flex-col items-center justify-center w-12 h-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm text-center">
                                                    <span className="text-xs font-bold text-red-500 uppercase">{new Date(v.date).toLocaleDateString(lang, { month: 'short' })}</span>
                                                    <span className="text-lg font-bold text-slate-700 dark:text-slate-200 leading-none">{new Date(v.date).getDate()}</span>
                                                </div>
                                                <div>
                                                    <p className="font-bold dark:text-white text-sm group-hover:text-secondary-600 transition-colors">{store?.name || 'Unknown'}</p>
                                                    <p className="text-xs text-slate-500">{new Date(v.date).toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit' })}</p>
                                                </div>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${v.type === 'Visit' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                                                }`}>
                                                {v.type}
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
                                <button onClick={() => onNewVisit()} className="mt-3 px-4 py-2 bg-secondary-50 dark:bg-secondary-900/20 text-secondary-600 rounded-xl text-sm font-bold hover:bg-secondary-100 transition-colors">
                                    + Schedule Visit
                                </button>
                            </div>
                        )}
                    </motion.div>

                    {/* Urgent Tasks */}
                    <motion.div variants={itemVariants} className="glass-card rounded-3xl p-6">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="font-bold dark:text-white flex items-center gap-2 text-lg">
                                <span className="p-2 rounded-xl bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                                    <AlertCircle size={20} />
                                </span>
                                High Priority Tasks
                            </h3>
                            <Link to="/tasks" className="text-sm font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1 group">
                                View All <ChevronRight size={16} className="transition-transform group-hover:translate-x-1" />
                            </Link>
                        </div>
                        {urgentTasks.length > 0 ? (
                            <div className="space-y-3">
                                {urgentTasks.map(task => {
                                    const store = stores.find(s => s.id === task.store_id);
                                    return (
                                        <div key={task.id} className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-800/50 rounded-2xl hover:bg-white dark:hover:bg-slate-700 border border-transparent hover:border-red-200 dark:hover:border-red-800 transition-all group">
                                            <div>
                                                <p className="font-bold dark:text-white text-sm group-hover:text-primary-600 transition-colors">{task.sub}</p>
                                                <p className="text-xs text-slate-500 flex items-center gap-1">
                                                    <Store size={10} /> {store?.name}
                                                </p>
                                            </div>
                                            <span className="px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r from-red-500 to-pink-500 shadow-md shadow-red-500/20">
                                                High
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-10">
                                <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/10 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <CheckSquare size={32} className="text-emerald-500" />
                                </div>
                                <p className="text-slate-500 font-medium">No urgent tasks</p>
                                <p className="text-emerald-600 text-sm font-bold mt-1">All Caught Up! 🎉</p>
                            </div>
                        )}
                    </motion.div>
                </motion.div>

                {/* Weekly Progress - Combined Chart */}
                <motion.div variants={itemVariants} className="glass-card rounded-3xl p-6">
                    <h3 className="font-bold dark:text-white flex items-center gap-2 mb-6 text-lg">
                        <span className="p-2 rounded-xl bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400">
                            <TrendingUp size={20} />
                        </span>
                        This Week Progress
                    </h3>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="text-center p-5 bg-gradient-to-br from-secondary-50 to-white dark:from-secondary-900/20 dark:to-slate-800 rounded-2xl border border-secondary-100 dark:border-secondary-900/30">
                            <p className="text-3xl font-bold text-secondary-600 dark:text-secondary-400">{weekVisits.length}</p>
                            <p className="text-xs text-slate-500 font-bold uppercase mt-1">Visits Done</p>
                        </div>
                        <div className="text-center p-5 bg-gradient-to-br from-primary-50 to-white dark:from-primary-900/20 dark:to-slate-800 rounded-2xl border border-primary-100 dark:border-primary-900/30">
                            <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">{doneTasks}</p>
                            <p className="text-xs text-slate-500 font-bold uppercase mt-1">Tasks Done</p>
                        </div>
                        <div className="text-center p-5 bg-gradient-to-br from-amber-50 to-white dark:from-amber-900/20 dark:to-slate-800 rounded-2xl border border-amber-100 dark:border-amber-900/30">
                            <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">{completionRate}%</p>
                            <p className="text-xs text-slate-500 font-bold uppercase mt-1">Effective Rate</p>
                        </div>
                        <div className="text-center p-5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 flex flex-col justify-center">
                            <div className="flex items-center justify-center gap-3 mb-2">
                                <div className="flex flex-col items-center">
                                    <span className="w-3 h-3 rounded-full bg-secondary-500 mb-1 shadow-sm shadow-secondary-500/50"></span>
                                    <span className="text-sm font-bold dark:text-white">{healthyStores}</span>
                                </div>
                                <div className="flex flex-col items-center">
                                    <span className="w-3 h-3 rounded-full bg-amber-500 mb-1 shadow-sm shadow-amber-500/50"></span>
                                    <span className="text-sm font-bold dark:text-white">{warningStores}</span>
                                </div>
                                <div className="flex flex-col items-center">
                                    <span className="w-3 h-3 rounded-full bg-red-500 mb-1 shadow-sm shadow-red-500/50"></span>
                                    <span className="text-sm font-bold dark:text-white">{urgentStores}</span>
                                </div>
                            </div>
                            <p className="text-xs text-slate-500 font-bold uppercase">Store Health</p>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </PageTransition>
    );
};

export default Dashboard;
