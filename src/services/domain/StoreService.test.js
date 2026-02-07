import { describe, it, expect, vi, beforeEach } from 'vitest';
import StoreService from './StoreService';

describe('StoreService', () => {
    let repo;
    let service;

    beforeEach(() => {
        repo = {
            getAll: vi.fn(async () => [
                { id: '1', name: 'Store 1', last_visit: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() }, // Urgent
                { id: '2', name: 'Store 2', last_visit: new Date().toISOString() } // Healthy
            ]),
            getUrgent: vi.fn(async () => [{ id: '1' }])
        };
        service = new StoreService(repo);
    });

    it('getStoreSummaries adds health and urgency to stores', async () => {
        const summaries = await service.getStoreSummaries();
        expect(summaries).toHaveLength(2);
        expect(summaries[0].health).toBe('red');
        expect(summaries[0].isUrgent).toBe(true);
        expect(summaries[1].health).toBe('green');
        expect(summaries[1].isUrgent).toBe(false);
    });

    it('getUrgentStoresCount returns correct count', async () => {
        const count = await service.getUrgentStoresCount();
        expect(count).toBe(1);
        expect(repo.getUrgent).toHaveBeenCalled();
    });
});
