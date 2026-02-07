import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppProvider } from '../contexts/AppContext';
import { DataProvider } from '../contexts/DataContext';

/**
 * Create a wrapper with all required providers for testing
 */
const AllProviders = ({ children }) => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
        },
    });

    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <AppProvider>
                    <DataProvider>
                        {children}
                    </DataProvider>
                </AppProvider>
            </BrowserRouter>
        </QueryClientProvider>
    );
};

/**
 * Custom render function that wraps components with all providers
 */
const customRender = (ui, options = {}) =>
    render(ui, { wrapper: AllProviders, ...options });

// Re-export everything from testing library
export * from '@testing-library/react';

// Override render with our custom render
export { customRender as render };

/**
 * Mock data generators for testing
 */
export const mockStore = (overrides = {}) => ({
    id: 'store-1',
    name: 'Test Store',
    category: 'Grocery',
    owner: 'John Doe',
    phone: '+964 770 000 0000',
    zone: 'Baghdad Central',
    area_name: 'Test Area',
    address: '123 Test Street',
    map_link: 'https://maps.google.com',
    status: 'Active',
    last_visit: null,
    pinned_note: '',
    contacts: [],
    ...overrides,
});

export const mockVisit = (overrides = {}) => ({
    id: 'visit-1',
    store_id: 'store-1',
    date: new Date().toISOString(),
    type: 'Regular',
    reason: 'Check inventory',
    status: 'scheduled',
    is_effective: null,
    note: '',
    ...overrides,
});

export const mockTask = (overrides = {}) => ({
    id: 'task-1',
    store_id: 'store-1',
    title: 'Test Task',
    category: 'Follow-up',
    priority: 'medium',
    status: 'pending',
    due_date: new Date().toISOString(),
    notes: '',
    ...overrides,
});
