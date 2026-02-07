import BaseRepository from './BaseRepository';

export default class SettingsRepository extends BaseRepository {
    constructor(db) {
        super('settings', db);
    }

    async getSettings() {
        return await this.db.getSettings();
    }

    async updateSettings(settings) {
        return await this.db.updateSettings(settings);
    }
}
