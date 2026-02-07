export default class BaseRepository {
    constructor(table, db) {
        this.table = table;
        this.db = db;
    }

    async getAll() {
        const { data, error } = await this.db.from(this.table).select();
        if (error) throw error;
        return data;
    }

    async getById(id) {
        const { data, error } = await this.db.from(this.table).select(); // Minimal db implementation only has select all
        if (error) throw error;
        return data.find(item => item.id === id);
    }

    async create(item) {
        const { data, error } = await this.db.from(this.table).insert(item);
        if (error) throw error;
        return data;
    }

    async update(id, updates) {
        const { data, error } = await this.db.from(this.table).update(id, updates);
        if (error) throw error;
        return data;
    }

    async delete(id) {
        const { error } = await this.db.from(this.table).delete(id);
        if (error) throw error;
        return true;
    }

    async getPaginated(page = 0, limit = 20, filters = {}) {
        let builder = this.db.from(this.table).select('*', { count: 'exact' });

        const from = page * limit;
        const to = from + limit - 1;

        // Apply filters if provided
        Object.entries(filters).forEach(([key, value]) => {
            if (value) builder = builder.eq(key, value);
        });

        const { data, count, error } = await builder.range(from, to);
        if (error) throw error;

        return { data, count, hasMore: (from + data.length) < count };
    }
}
