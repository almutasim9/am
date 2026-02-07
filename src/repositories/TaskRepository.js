import BaseRepository from './BaseRepository';

export default class TaskRepository extends BaseRepository {
    constructor(db) {
        super('tasks', db);
    }

    async getUrgent(limit = 4) {
        const tasks = await this.getAll();
        return tasks
            .filter(t => t.status === 'pending' && t.priority === 'high')
            .slice(0, limit);
    }

    async getPendingCount() {
        const tasks = await this.getAll();
        return tasks.filter(t => t.status === 'pending').length;
    }

    async getDoneCount() {
        const tasks = await this.getAll();
        return tasks.filter(t => t.status === 'done').length;
    }
}
