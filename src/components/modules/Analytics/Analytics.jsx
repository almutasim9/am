import React, { useContext, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, TrendingUp, Store, CheckSquare, Calendar, ArrowLeft, Target, Users, Zap, Award, Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import useTranslation from '../../../hooks/useTranslation';
import { DataContext } from '../../../contexts/DataContext';
import { getStoreHealth } from '../../../utils/helpers';
import PageTransition from '../../common/PageTransition';
import { DashboardStatsSkeleton } from '../../common/Skeleton';

const Analytics = () => {
    const { stores, visits, tasks, isLoading } = useContext(DataContext);
    const t = useTranslation();

    // Store Health Stats
    const healthyStores = stores.filter(s => getStoreHealth(s.last_visit) === 'green').length;
    const warningStores = stores.filter(s => getStoreHealth(s.last_visit) === 'amber').length;
    const urgentStores = stores.filter(s => getStoreHealth(s.last_visit) === 'red').length;

    // Task Stats
    const pendingTasks = tasks.filter(t => t.status === 'pending' || !t.status).length;
    const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
    const doneTasks = tasks.filter(t => t.status === 'done').length;
    const totalTasks = tasks.length;

    // Visit Stats
    const scheduledVisits = visits.filter(v => v.status === 'scheduled').length;
    const completedVisits = visits.filter(v => v.status === 'completed').length;

    // Weekly performance
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const weekVisits = visits.filter(v => v.status === 'completed' && new Date(v.date) >= weekAgo);
    const effectiveVisits = weekVisits.filter(v => v.is_effective).length;
    const weeklyCompletionRate = weekVisits.length > 0 ? Math.round(effectiveVisits / weekVisits.length * 100) : 0;

    // Monthly comparison
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const monthVisits = visits.filter(v => v.status === 'completed' && new Date(v.date) >= monthAgo).length;
    const monthTasks = tasks.filter(t => t.status === 'done').length;

    // Chart Data - Last 7 days visits
    const weeklyChartData = useMemo(() => {
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
            const dayName = date.toLocaleDateString('en', { weekday: 'short' });
            const dayVisits = visits.filter(v =>
                v.status === 'completed' &&
                new Date(v.date).toDateString() === date.toDateString()
            ).length;
            days.push({ name: dayName, visits: dayVisits });
        }
        return days;
    }, [visits, now]);

    // Pie Chart Data - Store Health
    const storeHealthData = [
        { name: 'Healthy', value: healthyStores, color: '#10b981' },
        { name: 'Warning', value: warningStores, color: '#f59e0b' },
        { name: 'Urgent', value: urgentStores, color: '#ef4444' },
    ].filter(d => d.value > 0);

    // Pie Chart Data - Tasks
    const tasksData = [
        { name: 'Done', value: doneTasks, color: '#10b981' },
        { name: 'In Progress', value: inProgressTasks, color: '#3b82f6' },
        { name: 'Pending', value: pendingTasks, color: '#f59e0b' },
    ].filter(d => d.value > 0);

    if (isLoading) {
        return (
            <PageTransition>
                <div className="space-y-6">
                    <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse" />
                    <DashboardStatsSkeleton />
                    <DashboardStatsSkeleton />
                </div>
            </PageTransition>
        );
    }

    return (
        <PageTransition>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link to="/" className="p-2 bg-slate-100 dark:bg-slate-700 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                            <ArrowLeft size={20} className="text-slate-600 dark:text-slate-300" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold dark:text-white flex items-center gap-2">
                                <BarChart3 className="text-emerald-600" />
                                Analytics
                            </h1>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Performance & Statistics</p>
                        </div>
                    </div>
                </div>

                {/* Performance Overview */}
                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-5 text-white shadow-lg">
                    <div className="flex items-center gap-2 mb-4">
                        <TrendingUp size={20} />
                        <h2 className="font-bold">Weekly Performance</h2>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                            <p className="text-3xl font-bold">{weekVisits.length}</p>
                            <p className="text-xs text-emerald-200">Visits Completed</p>
                        </div>
                        <div className="text-center p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                            <p className="text-3xl font-bold">{weeklyCompletionRate}%</p>
                            <p className="text-xs text-emerald-200">Effective Rate</p>
                        </div>
                        <div className="text-center p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                            <p className="text-3xl font-bold">{doneTasks}</p>
                            <p className="text-xs text-emerald-200">Tasks Done</p>
                        </div>
                    </div>
                </div>

                {/* Weekly Visits Chart */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <BarChart3 className="text-emerald-600" />
                        <h3 className="font-bold dark:text-white">Visits This Week</h3>
                    </div>
                    <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={weeklyChartData}>
                                <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="#94a3b8" />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                                        border: 'none',
                                        borderRadius: '8px',
                                        color: '#fff'
                                    }}
                                />
                                <Bar dataKey="visits" fill="#10b981" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Pie Charts Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Store Health Pie */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <Store className="text-emerald-600" />
                            <h3 className="font-bold dark:text-white">Store Health</h3>
                        </div>
                        <div className="h-40">
                            {storeHealthData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={storeHealthData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={40}
                                            outerRadius={60}
                                            paddingAngle={2}
                                            dataKey="value"
                                        >
                                            {storeHealthData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex items-center justify-center h-full text-slate-400">No data</div>
                            )}
                        </div>
                        <div className="flex justify-center gap-4 mt-2">
                            {storeHealthData.map((item, i) => (
                                <div key={i} className="flex items-center gap-1 text-xs">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                    <span className="text-slate-600 dark:text-slate-400">{item.name}: {item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Tasks Pie */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <CheckSquare className="text-teal-600" />
                            <h3 className="font-bold dark:text-white">Tasks Status</h3>
                        </div>
                        <div className="h-40">
                            {tasksData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={tasksData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={40}
                                            outerRadius={60}
                                            paddingAngle={2}
                                            dataKey="value"
                                        >
                                            {tasksData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex items-center justify-center h-full text-slate-400">No data</div>
                            )}
                        </div>
                        <div className="flex justify-center gap-4 mt-2">
                            {tasksData.map((item, i) => (
                                <div key={i} className="flex items-center gap-1 text-xs">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                    <span className="text-slate-600 dark:text-slate-400">{item.name}: {item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Store Health Overview */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <Store className="text-emerald-600" />
                        <h3 className="font-bold dark:text-white">Store Health</h3>
                        <span className="ml-auto text-sm text-slate-500">{stores.length} Total</span>
                    </div>

                    {/* Health Bar */}
                    <div className="h-4 rounded-full overflow-hidden flex mb-4">
                        <div
                            className="bg-emerald-500 transition-all"
                            style={{ width: `${stores.length > 0 ? (healthyStores / stores.length) * 100 : 0}%` }}
                        />
                        <div
                            className="bg-amber-500 transition-all"
                            style={{ width: `${stores.length > 0 ? (warningStores / stores.length) * 100 : 0}%` }}
                        />
                        <div
                            className="bg-red-500 transition-all"
                            style={{ width: `${stores.length > 0 ? (urgentStores / stores.length) * 100 : 0}%` }}
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl text-center">
                            <div className="flex items-center justify-center gap-1 mb-1">
                                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                                <span className="text-xs text-emerald-700 dark:text-emerald-400">Healthy</span>
                            </div>
                            <p className="text-2xl font-bold text-emerald-600">{healthyStores}</p>
                        </div>
                        <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl text-center">
                            <div className="flex items-center justify-center gap-1 mb-1">
                                <div className="w-3 h-3 rounded-full bg-amber-500" />
                                <span className="text-xs text-amber-700 dark:text-amber-400">Warning</span>
                            </div>
                            <p className="text-2xl font-bold text-amber-600">{warningStores}</p>
                        </div>
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl text-center">
                            <div className="flex items-center justify-center gap-1 mb-1">
                                <div className="w-3 h-3 rounded-full bg-red-500" />
                                <span className="text-xs text-red-700 dark:text-red-400">Urgent</span>
                            </div>
                            <p className="text-2xl font-bold text-red-600">{urgentStores}</p>
                        </div>
                    </div>
                </div>

                {/* Tasks Overview */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <CheckSquare className="text-teal-600" />
                        <h3 className="font-bold dark:text-white">Tasks Progress</h3>
                        <span className="ml-auto text-sm text-slate-500">{totalTasks} Total</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-4 rounded-full overflow-hidden flex mb-4 bg-slate-100 dark:bg-slate-700">
                        <div
                            className="bg-emerald-500 transition-all"
                            style={{ width: `${totalTasks > 0 ? (doneTasks / totalTasks) * 100 : 0}%` }}
                        />
                        <div
                            className="bg-blue-500 transition-all"
                            style={{ width: `${totalTasks > 0 ? (inProgressTasks / totalTasks) * 100 : 0}%` }}
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl text-center">
                            <p className="text-xs text-amber-700 dark:text-amber-400 mb-1">📋 Pending</p>
                            <p className="text-2xl font-bold text-amber-600">{pendingTasks}</p>
                        </div>
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-center">
                            <p className="text-xs text-blue-700 dark:text-blue-400 mb-1">⏳ In Progress</p>
                            <p className="text-2xl font-bold text-blue-600">{inProgressTasks}</p>
                        </div>
                        <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl text-center">
                            <p className="text-xs text-emerald-700 dark:text-emerald-400 mb-1">✅ Done</p>
                            <p className="text-2xl font-bold text-emerald-600">{doneTasks}</p>
                        </div>
                    </div>
                </div>

                {/* Visits Overview */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <Calendar className="text-purple-600" />
                        <h3 className="font-bold dark:text-white">Visits Summary</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl text-center">
                            <p className="text-xs text-purple-700 dark:text-purple-400 mb-1">📅 Scheduled</p>
                            <p className="text-3xl font-bold text-purple-600">{scheduledVisits}</p>
                        </div>
                        <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl text-center">
                            <p className="text-xs text-emerald-700 dark:text-emerald-400 mb-1">✅ Completed</p>
                            <p className="text-3xl font-bold text-emerald-600">{completedVisits}</p>
                        </div>
                    </div>
                </div>

                {/* Monthly Stats */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <Award className="text-amber-600" />
                        <h3 className="font-bold dark:text-white">This Month</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-4 border dark:border-slate-700 rounded-xl text-center">
                            <p className="text-xs text-slate-500 mb-1">Visits Completed</p>
                            <p className="text-3xl font-bold text-emerald-600">{monthVisits}</p>
                        </div>
                        <div className="p-4 border dark:border-slate-700 rounded-xl text-center">
                            <p className="text-xs text-slate-500 mb-1">Tasks Completed</p>
                            <p className="text-3xl font-bold text-teal-600">{monthTasks}</p>
                        </div>
                    </div>
                </div>
            </div>
        </PageTransition>
    );
};

export default Analytics;
