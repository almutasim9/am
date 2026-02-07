import { createClient } from '@supabase/supabase-js';

// ============= SUPABASE CONFIGURATION =============
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if Supabase is configured
const isSupabaseConfigured = supabaseUrl && supabaseAnonKey &&
    supabaseUrl !== 'your_supabase_project_url_here' &&
    supabaseAnonKey !== 'your_supabase_anon_key_here';

// Create Supabase client only if configured
export const supabase = isSupabaseConfigured ? createClient(supabaseUrl, supabaseAnonKey) : null;

// Debug logging only in development
if (import.meta.env.DEV) {
    console.log('Supabase configured:', isSupabaseConfigured);
}

// ============= DATA SERVICE =============
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const today = new Date();
const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
const nextWeek = new Date(today); nextWeek.setDate(nextWeek.getDate() + 7);
const lastWeek = new Date(today); lastWeek.setDate(lastWeek.getDate() - 7);

export const initialData = {
    stores: [],
    visits: [],
    tasks: [],
    sales_snapshots: [],
    menus: [],
    menu_categories: [],
    menu_items: [],
    item_variants: [],
    variant_options: [],
    item_addons: [],
    item_choice_groups: [],
    choice_options: [],
    item_removables: [],
    settings: {
        visitTypes: ['Visit', 'Call', 'Meeting'],
        visitReasons: ['Sales', 'Collection', 'Support', 'Friendly', 'Training', 'Issue'],
        contactRoles: ['Owner', 'Manager', 'Sales Rep', 'Accountant'],
        taskCategories: { Sales: ['Product Demo', 'Contract Renewal', 'Pricing'], Support: ['Technical Issue', 'Training', 'Complaint'], Admin: ['Paperwork', 'Report'] },
        zones: ['Baghdad Central', 'Baghdad East', 'Basra', 'Erbil', 'Mosul', 'Karbala', 'Najaf'],
        storeCategories: ['Grocery', 'Electronics', 'Fashion', 'Pharmacy', 'Restaurant'],
    },
};

// Helper function to format Supabase errors
const formatSupabaseError = (error, operation, table) => {
    if (!error) return null;

    // Detect RLS/Permission errors
    if (error.code === '42501' || error.message?.includes('permission denied') ||
        error.code === 'PGRST301' || error.message?.includes('new row violates row-level security')) {
        return {
            ...error,
            userMessage: `⚠️ Permission denied on ${table}. Please run the RLS fix SQL in Supabase Dashboard.`,
            isRLSError: true
        };
    }

    // Detect 403 Forbidden
    if (error.status === 403 || error.code === '403') {
        return {
            ...error,
            userMessage: `⚠️ Access forbidden. Row Level Security may be blocking ${operation} on ${table}.`,
            isRLSError: true
        };
    }

    // Generic error
    return {
        ...error,
        userMessage: error.message || `Error during ${operation} on ${table}`,
        isRLSError: false
    };
};

// Real Supabase Service
class SupabaseService {
    async count(table, query = {}) {
        let builder = supabase.from(table).select('*', { count: 'exact', head: true });
        // Simple filter application
        Object.keys(query).forEach(key => {
            builder = builder.eq(key, query[key]);
        });
        const { count, error } = await builder;
        if (error) {
            const formattedError = formatSupabaseError(error, 'count', table);
            console.error(`[DB] Count error on ${table}:`, formattedError);
            throw formattedError;
        }
        return count;
    }

    from(table) {
        return {
            select: (query = '*', options = {}) => {
                let builder = supabase.from(table).select(query, options);

                const wrapper = {
                    eq: (col, val) => { builder = builder.eq(col, val); return wrapper; },
                    range: async (from, to) => {
                        const { data, error, count } = await builder.range(from, to);
                        return { data, count, error: formatSupabaseError(error, 'select', table) };
                    },
                    then: async (resolve) => {
                        const { data, error } = await builder;
                        return resolve({ data, error: formatSupabaseError(error, 'select', table) });
                    },
                    // Allow direct access to builder if needed
                    builder
                };
                return wrapper;
            },
            insert: async (item) => {
                const { data, error } = await supabase.from(table).insert(item).select().single();
                return { data, error: formatSupabaseError(error, 'insert', table) };
            },
            update: async (id, updates) => {
                const { data, error } = await supabase.from(table).update(updates).eq('id', id).select().single();
                return { data, error: formatSupabaseError(error, 'update', table) };
            },
            delete: async (id) => {
                const { error } = await supabase.from(table).delete().eq('id', id);
                return { error: formatSupabaseError(error, 'delete', table) };
            },
        };
    }
    async getSettings() {
        // Fetch settings from 'settings' table
        const { data, error } = await supabase
            .from('settings')
            .select('*')
            .eq('id', 1)
            .single();

        if (error || !data) {
            // If no settings exist yet, return defaults
            console.log('[DB] No settings found, using defaults');
            return initialData.settings;
        }

        // Settings are stored as JSON in the 'data' column
        return data.data || initialData.settings;
    }

    async updateSettings(settings) {
        // Upsert settings to 'settings' table
        const { error } = await supabase
            .from('settings')
            .upsert({
                id: 1,
                data: settings
            }, {
                onConflict: 'id'
            });

        if (error) {
            const formattedError = formatSupabaseError(error, 'upsert', 'settings');
            console.error('[DB] Settings update error:', formattedError);
            return { error: formattedError };
        }

        return { error: null };
    }
}

// Mock Service for local development
class MockSupabaseService {
    constructor() {
        const saved = localStorage.getItem('crm_data');
        this.data = saved ? JSON.parse(saved) : JSON.parse(JSON.stringify(initialData));
        // Migration: Ensure sales_snapshots exists
        if (!this.data.sales_snapshots) this.data.sales_snapshots = [];
        // Migration: Ensure menu tables exist
        if (!this.data.menus) this.data.menus = [];
        if (!this.data.menu_categories) this.data.menu_categories = [];
        if (!this.data.menu_items) this.data.menu_items = [];
        // Migration: Ensure item modifier tables exist
        if (!this.data.item_variants) this.data.item_variants = [];
        if (!this.data.variant_options) this.data.variant_options = [];
        if (!this.data.item_addons) this.data.item_addons = [];
        if (!this.data.item_choice_groups) this.data.item_choice_groups = [];
        if (!this.data.choice_options) this.data.choice_options = [];
        if (!this.data.item_removables) this.data.item_removables = [];

        // Migration: Inject coordinates into existing stores if missing (Fix for Map)
        this.data.stores = this.data.stores.map(store => {
            const initialStore = initialData.stores.find(s => s.id === store.id);
            // Only inject if the store is a demo store AND has no coordinates yet
            if (initialStore && initialStore.lat && !store.lat) {
                return { ...store, lat: initialStore.lat, lng: initialStore.lng };
            }
            return store;
        });
        this.save();
    }

    save() { localStorage.setItem('crm_data', JSON.stringify(this.data)); }
    from(table) {
        return {
            select: (query = '*', options = {}) => {
                const wrapper = {
                    eq: (col, val) => { /* Mock EQ - not fully implemented for all fields but can be added if needed */ return wrapper; },
                    range: async (from, to) => {
                        await delay(100);
                        const data = this.data[table].slice(from, to + 1);
                        return { data: [...data], count: this.data[table].length, error: null };
                    },
                    then: async (resolve) => {
                        await delay(100);
                        return resolve({ data: [...this.data[table]], error: null });
                    }
                };
                return wrapper;
            },
            insert: async (item) => {
                await delay(100);
                const newItem = { ...item, id: item.id || Date.now().toString() };
                this.data[table].push(newItem);
                this.save();
                return { data: newItem, error: null };
            },
            update: async (id, updates) => {
                await delay(100);
                const idx = this.data[table].findIndex(i => i.id === id);
                if (idx !== -1) { this.data[table][idx] = { ...this.data[table][idx], ...updates }; this.save(); }
                return { data: this.data[table][idx], error: null };
            },
            delete: async (id) => {
                await delay(100);
                this.data[table] = this.data[table].filter(i => i.id !== id);
                this.save();
                return { error: null };
            },
        };
    }
    async getSettings() { await delay(50); return this.data.settings; }
    async updateSettings(settings) { await delay(50); this.data.settings = settings; this.save(); return { error: null }; }
}

// Use real Supabase if configured, otherwise use mock
export const db = isSupabaseConfigured ? new SupabaseService() : new MockSupabaseService();

// ============= SUPABASE AUTH HELPERS =============

// Sign in with email/password
export const signIn = async (email, password) => {
    // Log for debugging (only in development)
    if (import.meta.env.DEV) {
        console.log('signIn called, supabase configured:', !!supabase);
    }

    if (!supabase) {
        // Mock auth for development when Supabase is not configured
        const validEmail = import.meta.env.VITE_ADMIN_EMAIL || 'admin@example.com';
        const validPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'password123';

        if (import.meta.env.DEV) {
            console.log('Mock auth - checking credentials');
        }

        if (email === validEmail && password === validPassword) {
            const mockUser = { id: '1', email, user_metadata: { username: 'admin' } };
            return { data: { user: mockUser, session: { user: mockUser } }, error: null };
        }
        return { data: null, error: { message: 'Invalid credentials' } };
    }

    try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });

        if (import.meta.env.DEV && error) {
            console.log('Supabase auth error:', error.message);
        }

        return { data, error };
    } catch (err) {
        console.error('signIn exception:', err);
        return { data: null, error: { message: 'Connection error. Please try again.' } };
    }
};

// Sign out
export const signOut = async () => {
    if (!supabase) {
        return { error: null };
    }
    const { error } = await supabase.auth.signOut();
    return { error };
};

// Get current session
export const getSession = async () => {
    if (!supabase) {
        return { data: { session: null }, error: null };
    }
    const { data, error } = await supabase.auth.getSession();
    return { data, error };
};

// Get current user
export const getUser = async () => {
    if (!supabase) {
        return { data: { user: null }, error: null };
    }
    const { data: { user }, error } = await supabase.auth.getUser();
    return { data: { user }, error };
};

// Listen for auth state changes
export const onAuthStateChange = (callback) => {
    if (!supabase) {
        return { data: { subscription: { unsubscribe: () => { } } } };
    }
    return supabase.auth.onAuthStateChange(callback);
};
