import { describe, it, expect, vi, beforeEach } from 'vitest';
import TaskRepository from './TaskRepository';

const mockDb = {
    from: vi.fn(() => ({
        select: vi.fn(async () => ({
            data: [
                { id: 't1', status: 'pending', priority: 'high', sub: 'Urgent Task' },
                { id: 't2', status: 'done', priority: 'low', sub: 'Done Task' },
                { id: 't3', status: 'pending', priority: 'medium', sub: 'Medium Task' }
            ],
            error: null
        }))
    }))
};

describe('TaskRepository', () => {
    let repo;

    beforeEach(() => {
        repo = new TaskRepository(mockDb);
    });

    it('getUrgent returns pending high priority tasks', async () => {
        const urgent = await repo.getUrgent();
        expect(urgent).toHaveLength(1);
        expect(urgent[0].id).toBe('t1');
    });

    it('getPendingCount returns correct count', async () => {
        const count = await repo.getPendingCount();
        expect(count).toBe(2);
    });

    it('getDoneCount returns correct count', async () => {
        const count = await repo.getDoneCount();
        expect(count).toBe(1);
    });
});
