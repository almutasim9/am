import React, { createContext, useContext } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '../services/db';

export const DataContext = createContext(null);

// Query keys for cache management
export const queryKeys = {
    stores: ['stores'],
    visits: ['visits'],
    tasks: ['tasks'],
    settings: ['settings'],
    menus: ['menus'],
    menuCategories: ['menu_categories'],
    menuItems: ['menu_items'],
};

// Stale time: how long data is considered fresh (5 minutes)
const STALE_TIME = 5 * 60 * 1000;

// Fetchers with error handling
const fetchStores = async () => {
    const table = await db.from('stores');
    const { data, error } = await table.select();
    if (error) {
        console.error('Error fetching stores:', error);
        throw new Error(error.message || 'Failed to fetch stores');
    }
    return data || [];
};

const fetchVisits = async () => {
    const table = await db.from('visits');
    const { data, error } = await table.select();
    if (error) {
        console.error('Error fetching visits:', error);
        throw new Error(error.message || 'Failed to fetch visits');
    }
    return data || [];
};

const fetchTasks = async () => {
    const table = await db.from('tasks');
    const { data, error } = await table.select();
    if (error) {
        console.error('Error fetching tasks:', error);
        throw new Error(error.message || 'Failed to fetch tasks');
    }
    return data || [];
};

const fetchSettings = async () => {
    return await db.getSettings();
};

const fetchMenus = async () => {
    const table = await db.from('menus');
    const { data, error } = await table.select();
    if (error) {
        console.error('Error fetching menus:', error);
        throw new Error(error.message || 'Failed to fetch menus');
    }
    return data || [];
};

const fetchMenuCategories = async () => {
    const table = await db.from('menu_categories');
    const { data, error } = await table.select();
    if (error) {
        console.error('Error fetching menu categories:', error);
        throw new Error(error.message || 'Failed to fetch menu categories');
    }
    return data || [];
};

const fetchMenuItems = async () => {
    const table = await db.from('menu_items');
    const { data, error } = await table.select();
    if (error) {
        console.error('Error fetching menu items:', error);
        throw new Error(error.message || 'Failed to fetch menu items');
    }
    return data || [];
};

export const DataProvider = ({ children }) => {
    const queryClient = useQueryClient();

    // Queries with caching
    const storesQuery = useQuery({
        queryKey: queryKeys.stores,
        queryFn: fetchStores,
        staleTime: STALE_TIME,
    });

    const visitsQuery = useQuery({
        queryKey: queryKeys.visits,
        queryFn: fetchVisits,
        staleTime: STALE_TIME,
    });

    const tasksQuery = useQuery({
        queryKey: queryKeys.tasks,
        queryFn: fetchTasks,
        staleTime: STALE_TIME,
    });

    const settingsQuery = useQuery({
        queryKey: queryKeys.settings,
        queryFn: fetchSettings,
        staleTime: STALE_TIME * 2, // Settings change less frequently
    });

    const menusQuery = useQuery({
        queryKey: queryKeys.menus,
        queryFn: fetchMenus,
        staleTime: STALE_TIME,
    });

    const menuCategoriesQuery = useQuery({
        queryKey: queryKeys.menuCategories,
        queryFn: fetchMenuCategories,
        staleTime: STALE_TIME,
    });

    const menuItemsQuery = useQuery({
        queryKey: queryKeys.menuItems,
        queryFn: fetchMenuItems,
        staleTime: STALE_TIME,
    });

    // Optimistic update helper for stores
    const setStores = (updater) => {
        queryClient.setQueryData(queryKeys.stores, (old) =>
            typeof updater === 'function' ? updater(old) : updater
        );
    };

    const setVisits = (updater) => {
        queryClient.setQueryData(queryKeys.visits, (old) =>
            typeof updater === 'function' ? updater(old) : updater
        );
    };

    const setTasks = (updater) => {
        queryClient.setQueryData(queryKeys.tasks, (old) =>
            typeof updater === 'function' ? updater(old) : updater
        );
    };

    const setSettings = (updater) => {
        queryClient.setQueryData(queryKeys.settings, (old) =>
            typeof updater === 'function' ? updater(old) : updater
        );
    };

    const setMenus = (updater) => {
        queryClient.setQueryData(queryKeys.menus, (old) =>
            typeof updater === 'function' ? updater(old) : updater
        );
    };

    const setMenuCategories = (updater) => {
        queryClient.setQueryData(queryKeys.menuCategories, (old) =>
            typeof updater === 'function' ? updater(old) : updater
        );
    };

    const setMenuItems = (updater) => {
        queryClient.setQueryData(queryKeys.menuItems, (old) =>
            typeof updater === 'function' ? updater(old) : updater
        );
    };

    // Refresh all data (invalidate cache)
    const refreshData = (showLoading = false) => {
        if (showLoading) {
            // Invalidate and refetch
            return Promise.all([
                queryClient.invalidateQueries({ queryKey: queryKeys.stores }),
                queryClient.invalidateQueries({ queryKey: queryKeys.visits }),
                queryClient.invalidateQueries({ queryKey: queryKeys.tasks }),
                queryClient.invalidateQueries({ queryKey: queryKeys.settings }),
                queryClient.invalidateQueries({ queryKey: queryKeys.menus }),
                queryClient.invalidateQueries({ queryKey: queryKeys.menuCategories }),
                queryClient.invalidateQueries({ queryKey: queryKeys.menuItems }),
            ]);
        } else {
            // Just refetch in background
            queryClient.refetchQueries({ queryKey: queryKeys.stores });
            queryClient.refetchQueries({ queryKey: queryKeys.visits });
            queryClient.refetchQueries({ queryKey: queryKeys.tasks });
            return Promise.resolve();
        }
    };

    // Combined loading state
    const isLoading = storesQuery.isLoading || visitsQuery.isLoading ||
        tasksQuery.isLoading || settingsQuery.isLoading || menusQuery.isLoading;

    // Combined error state
    const error = storesQuery.error || visitsQuery.error ||
        tasksQuery.error || settingsQuery.error;

    return (
        <DataContext.Provider value={{
            // Data
            stores: storesQuery.data || [],
            visits: visitsQuery.data || [],
            tasks: tasksQuery.data || [],
            settings: settingsQuery.data || {},
            menus: menusQuery.data || [],
            menuCategories: menuCategoriesQuery.data || [],
            menuItems: menuItemsQuery.data || [],

            // Loading & Error states
            isLoading,
            error,

            // Setters for optimistic updates
            setStores,
            setVisits,
            setTasks,
            setSettings,
            setMenus,
            setMenuCategories,
            setMenuItems,

            // Refresh function
            refreshData,

            // Query client for advanced usage
            queryClient,
        }}>
            {children}
        </DataContext.Provider>
    );
};

// Custom hook for using data context
export const useData = () => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};
