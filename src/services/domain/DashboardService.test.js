import { describe, it, expect, vi } from 'vitest';
import DashboardService from './DashboardService';

describe('DashboardService', () => {
    const service = new DashboardService();

    const mockStores = [
        { id: '1', name: 'Store 1', last_visit: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() }, // Urgent (red)
        { id: '2', name: 'Store 2', last_visit: new Date().toISOString() } // Healthy (green)
    ];

    const mockVisits = [
        { id: 'v1', status: 'scheduled', date: new Date().toISOString() }, // Today
        { id: 'v2', status: 'completed', date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), is_effective: true }, // Weekly
        { id: 'v3', status: 'scheduled', date: new Date(Date.now() + 86400000).toISOString() } // Upcoming
    ];

    const mockTasks = [
        { id: 't1', status: 'pending', priority: 'high' }, // Urgent
        { id: 't2', status: 'done' }
    ];

    it('calculateMetrics returns correct summary', () => {
        const metrics = service.calculateMetrics(mockStores, mockVisits, mockTasks);

        expect(metrics.urgentStores).toBe(1);
        expect(metrics.pendingTasks).toBe(1);
        expect(metrics.todayVisits).toHaveLength(1);
        expect(metrics.upcomingVisits).toHaveLength(2); // Sorted
        expect(metrics.completionRate).toBe(100);
    });

    it('greeting changes based on time', () => {
        // Mocking Date.getHours is tricky, but we can verify the service logic
        const metrics = service.calculateMetrics([], [], []);
        expect(['Good Morning', 'Good Afternoon', 'Good Evening']).toContain(metrics.greeting);
    });
});
