import React, { createContext, useContext, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { db } from '../services/db';

// Repositories
import StoreRepository from '../repositories/StoreRepository';
import VisitRepository from '../repositories/VisitRepository';
import TaskRepository from '../repositories/TaskRepository';
import SettingsRepository from '../repositories/SettingsRepository';
import BaseRepository from '../repositories/BaseRepository';

// Services
import DashboardService from '../services/domain/DashboardService';
import StoreService from '../services/domain/StoreService';
import VisitService from '../services/domain/VisitService';

export const DataContext = createContext(null);

// Initialize repositories
const storeRepo = new StoreRepository(db);
const visitRepo = new VisitRepository(db);
const taskRepo = new TaskRepository(db);
const settingsRepo = new SettingsRepository(db);
const menuRepo = new BaseRepository('menus', db);
const categoryRepo = new BaseRepository('menu_categories', db);
const itemRepo = new BaseRepository('menu_items', db);

// Initialize services
const dashboardService = new DashboardService({ stores: storeRepo, visits: visitRepo, tasks: taskRepo });
const storeService = new StoreService(storeRepo);
const visitService = new VisitService(visitRepo);

// Query keys for cache management
// ... (rest of the file until DataProvider)
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

// Fetchers using repositories
const fetchStores = () => storeRepo.getAll();
const fetchVisits = () => visitRepo.getAll();
const fetchTasks = () => taskRepo.getAll();
const fetchSettings = () => settingsRepo.getSettings();
const fetchMenus = () => menuRepo.getAll();
const fetchMenuCategories = () => categoryRepo.getAll();
const fetchMenuItems = () => itemRepo.getAll();

export const DataProvider = ({ children }) => {
    const queryClient = useQueryClient();

    // Queries with caching
    const storesQuery = useQuery({
        queryKey: queryKeys.stores,
        queryFn: fetchStores,
        staleTime: STALE_TIME,
    });

    // Infinite Query for Stores page (Infinite Scroll)
    const storesInfiniteQuery = useInfiniteQuery({
        queryKey: ['stores', 'infinite'],
        queryFn: ({ pageParam = 0 }) => storeRepo.getPaginated(pageParam, 25, {}),
        getNextPageParam: (lastPage, allPages) => lastPage.hasMore ? allPages.length : undefined,
        initialPageParam: 0,
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

    // Provide repositories in context for direct access if needed
    const repos = useMemo(() => ({
        stores: storeRepo,
        visits: visitRepo,
        tasks: taskRepo,
        settings: settingsRepo,
        menus: menuRepo,
        categories: categoryRepo,
        items: itemRepo
    }), []);

    // Provide domain services in context
    const services = useMemo(() => ({
        dashboard: dashboardService,
        stores: storeService,
        visits: visitService
    }), []);

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

            // Repositories & Services
            repos,
            services,

            // Infinite Query
            storesInfinite: storesInfiniteQuery,

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
