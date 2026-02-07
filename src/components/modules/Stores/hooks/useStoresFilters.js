import { useState, useMemo } from 'react';
import { getStoreHealth } from '../../../../utils/helpers';

/**
 * Custom hook for managing stores filtering logic
 * Extracted from StoresManagement.jsx for better maintainability
 */
export const useStoresFilters = (stores) => {
    const [search, setSearch] = useState('');
    const [zoneFilter, setZoneFilter] = useState('');
    const [catFilter, setCatFilter] = useState('');
    const [healthFilter, setHealthFilter] = useState('');

    const filtered = useMemo(() => {
        return stores.filter(s => {
            const matchSearch = s.name.toLowerCase().includes(search.toLowerCase());
            const matchZone = !zoneFilter || s.zone === zoneFilter;
            const matchCat = !catFilter || s.category === catFilter;
            const matchHealth = !healthFilter || getStoreHealth(s.last_visit) === healthFilter;
            return matchSearch && matchZone && matchCat && matchHealth;
        });
    }, [stores, search, zoneFilter, catFilter, healthFilter]);

    const clearFilters = () => {
        setSearch('');
        setZoneFilter('');
        setCatFilter('');
        setHealthFilter('');
    };

    const hasActiveFilters = Boolean(search || zoneFilter || catFilter || healthFilter);

    return {
        // Filter values
        search,
        zoneFilter,
        catFilter,
        healthFilter,

        // Setters
        setSearch,
        setZoneFilter,
        setCatFilter,
        setHealthFilter,

        // Computed
        filtered,
        hasActiveFilters,

        // Actions
        clearFilters
    };
};

export default useStoresFilters;
