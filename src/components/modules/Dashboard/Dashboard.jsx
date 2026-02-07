import React, { useContext, useEffect, useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';
import useTranslation from '../../../hooks/useTranslation';
import { DataContext } from '../../../contexts/DataContext';
import { AuthContext, LangContext } from '../../../contexts/AppContext';
import { getStoreHealth } from '../../../utils/helpers';
import PageTransition from '../../common/PageTransition';
import { DashboardStatsSkeleton, CardSkeleton } from '../../common/Skeleton';

// Components
import DashboardHeader from './components/DashboardHeader';
import PerformanceScorecard from './components/PerformanceScorecard';
import TodayFocus from './components/TodayFocus';
import DashboardQuickActions from './components/DashboardQuickActions';
import ModuleStatCards from './components/ModuleStatCards';
import UrgentStoresAlert from './components/UrgentStoresAlert';
import DashboardSmartLists from './components/DashboardSmartLists';
import WeeklyProgressSummary from './components/WeeklyProgressSummary';

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

const Dashboard = () => {
    const { stores, visits, tasks, isLoading, refreshData, services } = useContext(DataContext);
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

    // Metrics calculations moved to DashboardService
    const metrics = useMemo(() => {
        return services.dashboard.calculateMetrics(stores, visits, tasks);
    }, [stores, visits, tasks, services.dashboard]);

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
                <DashboardHeader
                    greeting={metrics.greeting}
                    user={user}
                    isRefreshing={isRefreshing}
                    onRefresh={handleRefresh}
                />

                <PerformanceScorecard
                    weekVisitsCount={metrics.weekVisits.length}
                    doneTasksCount={metrics.doneTasks}
                    topStoreName={stores[0]?.name}
                />

                <TodayFocus
                    todayVisitsCount={metrics.todayVisits.length}
                    highPriorityTasksCount={metrics.highPriorityTasks}
                    urgentStoresCount={metrics.urgentStores}
                />

                <DashboardQuickActions
                    onNewVisit={onNewVisit}
                    onNewTask={onNewTask}
                />

                <ModuleStatCards
                    storesCount={stores.length}
                    urgentStoresCount={metrics.urgentStores}
                    pendingTasksCount={metrics.pendingTasks}
                />

                <UrgentStoresAlert
                    stores={stores}
                    onNewVisit={onNewVisit}
                />

                <DashboardSmartLists
                    upcomingVisits={metrics.upcomingVisits}
                    urgentTasks={metrics.urgentTasks}
                    stores={stores}
                    lang={lang}
                    onNewVisit={onNewVisit}
                />

                <WeeklyProgressSummary
                    weekVisitsCount={metrics.weekVisits.length}
                    doneTasksCount={metrics.doneTasks}
                    completionRate={metrics.completionRate}
                    healthyStores={metrics.healthyStores}
                    warningStores={metrics.warningStores}
                    urgentStores={metrics.urgentStores}
                />
            </motion.div>
        </PageTransition>
    );
};

export default Dashboard;

