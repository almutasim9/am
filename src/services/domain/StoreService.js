import { getStoreHealth } from '../../utils/helpers';

export default class StoreService {
    constructor(storeRepo) {
        this.storeRepo = storeRepo;
    }

    async getStoreSummaries() {
        const stores = await this.storeRepo.getAll();
        return stores.map(store => ({
            ...store,
            health: getStoreHealth(store.last_visit),
            isUrgent: getStoreHealth(store.last_visit) === 'red'
        }));
    }

    async getUrgentStoresCount() {
        const urgent = await this.storeRepo.getUrgent();
        return urgent.length;
    }
}
