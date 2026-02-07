import BaseRepository from './BaseRepository';

export default class VisitRepository extends BaseRepository {
    constructor(db) {
        super('visits', db);
    }

    async getUpcoming(limit = 4) {
        const visits = await this.getAll();
        return visits
            .filter(v => v.status === 'scheduled')
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .slice(0, limit);
    }

    async getTodayVisits() {
        const today = new Date().toDateString();
        const visits = await this.getAll();
        return visits.filter(v => v.status === 'scheduled' && new Date(v.date).toDateString() === today);
    }

    async getWeeklyVisits() {
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const visits = await this.getAll();
        return visits.filter(v => v.status === 'completed' && new Date(v.date) >= weekAgo);
    }
}
