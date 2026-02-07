import { getStoreHealth } from '../../utils/helpers';

export default class DashboardService {
    constructor(repos) {
        this.repos = repos;
    }

    /**
     * Calculates all metrics required for the Dashboard
     * @param {Array} stores 
     * @param {Array} visits 
     * @param {Array} tasks 
     * @returns {Object} Calculated metrics
     */
    calculateMetrics(stores, visits, tasks) {
        const urgentStores = stores.filter(s => getStoreHealth(s.last_visit) === 'red').length;
        const healthyStores = stores.filter(s => getStoreHealth(s.last_visit) === 'green').length;
        const warningStores = stores.filter(s => getStoreHealth(s.last_visit) === 'amber').length;
        const pendingTasks = tasks.filter(t => t.status === 'pending').length;
        const doneTasks = tasks.filter(t => t.status === 'done').length;
        const highPriorityTasks = tasks.filter(t => t.status === 'pending' && t.priority === 'high').length;

        // Today's data
        const today = new Date().toDateString();
        const todayVisits = visits.filter(v => v.status === 'scheduled' && new Date(v.date).toDateString() === today);
        const upcomingVisits = visits.filter(v => v.status === 'scheduled')
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .slice(0, 4);
        const urgentTasks = tasks.filter(t => t.status === 'pending' && t.priority === 'high').slice(0, 4);

        // Weekly stats
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const weekVisits = visits.filter(v => v.status === 'completed' && new Date(v.date) >= weekAgo);
        const effectiveVisits = weekVisits.filter(v => v.is_effective).length;
        const completionRate = weekVisits.length > 0 ? Math.round(effectiveVisits / weekVisits.length * 100) : 0;

        // Greeting
        const hour = new Date().getHours();
        const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';

        return {
            urgentStores,
            healthyStores,
            warningStores,
            pendingTasks,
            doneTasks,
            highPriorityTasks,
            todayVisits,
            upcomingVisits,
            urgentTasks,
            weekVisits,
            completionRate,
            greeting
        };
    }
}
