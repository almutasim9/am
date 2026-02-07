import { describe, it, expect, vi, beforeEach } from 'vitest';
import StoreRepository from './StoreRepository';

const mockDb = {
    from: vi.fn(() => ({
        select: vi.fn(async () => ({
            data: [
                { id: '1', name: 'Store 1', last_visit: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString() }, // Red
                { id: '2', name: 'Store 2', last_visit: new Date().toISOString() } // Green
            ],
            error: null
        }))
    }))
};

describe('StoreRepository', () => {
    let repo;

    beforeEach(() => {
        repo = new StoreRepository(mockDb);
    });

    it('getAll returns all stores', async () => {
        const stores = await repo.getAll();
        expect(stores).toHaveLength(2);
        expect(stores[0].name).toBe('Store 1');
    });

    it('getUrgent returns only urgent stores', async () => {
        const urgent = await repo.getUrgent();
        expect(urgent).toHaveLength(1);
        expect(urgent[0].id).toBe('1');
    });

    it('getHealthy returns only healthy stores', async () => {
        const healthy = await repo.getHealthy();
        expect(healthy).toHaveLength(1);
        expect(healthy[0].id).toBe('2');
    });
});
