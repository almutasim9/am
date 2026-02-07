import { describe, it, expect, vi, beforeEach } from 'vitest';
import VisitRepository from './VisitRepository';

const mockDb = {
    from: vi.fn(() => ({
        select: vi.fn(async () => ({
            data: [
                { id: 'v1', status: 'scheduled', date: new Date().toISOString(), store_id: 's1', type: 'Visit' },
                { id: 'v2', status: 'completed', date: new Date().toISOString(), store_id: 's1', type: 'Visit', is_effective: true },
                { id: 'v3', status: 'scheduled', date: new Date(Date.now() + 86400000).toISOString(), store_id: 's2', type: 'Call' }
            ],
            error: null
        }))
    }))
};

describe('VisitRepository', () => {
    let repo;

    beforeEach(() => {
        repo = new VisitRepository(mockDb);
    });

    it('getUpcoming returns scheduled visits sorted by date', async () => {
        const upcoming = await repo.getUpcoming();
        expect(upcoming).toHaveLength(2);
        expect(upcoming[0].id).toBe('v1');
    });

    it('getTodayVisits returns visits scheduled for today', async () => {
        const today = await repo.getTodayVisits();
        expect(today).toHaveLength(1);
        expect(today[0].id).toBe('v1');
    });

    it('getWeeklyVisits returns completed visits from the last week', async () => {
        const weekly = await repo.getWeeklyVisits();
        expect(weekly).toHaveLength(1);
        expect(weekly[0].status).toBe('completed');
    });
});
