import BaseRepository from './BaseRepository';
import { getStoreHealth } from '../utils/helpers';

export default class StoreRepository extends BaseRepository {
    constructor(db) {
        super('stores', db);
    }

    async getByHealth(health) {
        const stores = await this.getAll();
        return stores.filter(s => getStoreHealth(s.last_visit) === health);
    }

    async getUrgent() {
        return this.getByHealth('red');
    }

    async getHealthy() {
        return this.getByHealth('green');
    }

    async getWarning() {
        return this.getByHealth('amber');
    }
    async getPaginated(page = 0, limit = 25, { search, zone, category, health }) {
        // This will be used by the Infinite Scroll
        let query = this.db.from(this.table).select('*', { count: 'exact' });

        if (zone) query = query.eq('zone', zone);
        if (category) query = query.eq('category', category);
        // Note: health is a calculated field, so we might need to fetch and filter in memory 
        // OR implement it as a DB column later. For now, let's stick to Repo logic.

        const from = page * limit;
        const to = from + limit - 1;

        const { data, count, error } = await query.range(from, to);
        if (error) throw error;

        // Apply search if provided (could be client-side if data is small, but let's try to be efficient)
        let filteredData = data;
        if (search) {
            const s = search.toLowerCase();
            filteredData = data.filter(item =>
                item.name?.toLowerCase().includes(s) ||
                item.id?.toLowerCase().includes(s)
            );
        }

        return {
            data: filteredData,
            count,
            hasMore: (from + data.length) < count
        };
    }
}
