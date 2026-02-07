import { describe, it, expect, vi, beforeEach } from 'vitest';
import VisitService from './VisitService';

describe('VisitService', () => {
    let repo;
    let service;

    beforeEach(() => {
        repo = {
            getWeeklyVisits: vi.fn(async () => [
                { id: 'v1', is_effective: true },
                { id: 'v2', is_effective: false },
                { id: 'v3', is_effective: true }
            ]),
            getTodayVisits: vi.fn(async () => [{ id: 'v1' }])
        };
        service = new VisitService(repo);
    });

    it('getPerformanceMetrics calculates rates correctly', async () => {
        const metrics = await service.getPerformanceMetrics();
        expect(metrics.weeklyVisits).toBe(3);
        expect(metrics.effectiveVisits).toBe(2);
        expect(metrics.rate).toBe(67); // 2/3 = 66.666...
    });

    it('getScheduledToday delegates to repo', async () => {
        const visits = await service.getScheduledToday();
        expect(visits).toHaveLength(1);
        expect(repo.getTodayVisits).toHaveBeenCalled();
    });
});
