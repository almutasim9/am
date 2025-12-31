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
    stores: [
        { id: '1', name: 'Al-Rasheed Market', zone: 'Baghdad Central', category: 'Grocery', owner: 'Ahmed Hassan', phone: '+964 770 123 4567', map_link: 'https://maps.google.com', status: 'Active', last_visit: today.toISOString(), pinned_note: 'VIP customer', contacts: [{ name: 'Ahmed', role: 'Owner', phone: '+964 770 123 4567' }], lat: 33.3128, lng: 44.3615 }, // Baghdad - Rasheed
        { id: '2', name: 'Basra Electronics', zone: 'Basra', category: 'Electronics', owner: 'Mohammed Ali', phone: '+964 771 234 5678', map_link: 'https://maps.google.com', status: 'Active', last_visit: lastWeek.toISOString(), pinned_note: '', contacts: [{ name: 'Mohammed', role: 'Manager', phone: '+964 771 234 5678' }], lat: 30.5081, lng: 47.7835 }, // Basra
        { id: '3', name: 'Erbil Fashion', zone: 'Erbil', category: 'Fashion', owner: 'Sara Ibrahim', phone: '+964 772 345 6789', map_link: 'https://maps.google.com', status: 'Active', last_visit: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(), pinned_note: 'Needs follow-up', contacts: [{ name: 'Sara', role: 'Owner', phone: '+964 772 345 6789' }], lat: 36.1901, lng: 44.0091 }, // Erbil
        { id: '4', name: 'Mosul Pharmacy', zone: 'Mosul', category: 'Pharmacy', owner: 'Dr. Zaid', phone: '+964 773 456 7890', map_link: 'https://maps.google.com', status: 'Active', last_visit: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(), lat: 36.3489, lng: 43.1577 }, // Mosul
        { id: '5', name: 'Karbala Sweets', zone: 'Karbala', category: 'Restaurant', owner: 'Hassan', phone: '+964 774 567 8901', map_link: 'https://maps.google.com', status: 'Active', last_visit: null, lat: 32.6160, lng: 44.0249 }, // Karbala
    ],
    visits: [
        // Completed Visits (Past)
        { id: '1', store_id: '1', date: lastWeek.toISOString(), type: 'Visit', note: 'Regular check-in', status: 'completed', is_effective: true },
        { id: '2', store_id: '3', date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), type: 'Call', note: 'Discussed new collection', status: 'completed', is_effective: true },
        { id: '3', store_id: '2', date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), type: 'Visit', note: 'Issue with delivery', status: 'completed', is_effective: false },

        // Scheduled (Future)
        { id: '4', store_id: '1', date: today.toISOString(), type: 'Visit', note: 'Discuss bulk order', status: 'scheduled', is_effective: null },
        { id: '5', store_id: '4', date: tomorrow.toISOString(), type: 'Visit', note: 'New product introduction', status: 'scheduled', is_effective: null },
        { id: '6', store_id: '5', date: nextWeek.toISOString(), type: 'Meeting', note: 'Sign contract', status: 'scheduled', is_effective: null },
        { id: '7', store_id: '2', date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), type: 'Call', note: 'Follow up payment', status: 'scheduled', is_effective: null },
    ],
    tasks: [
        // Pending High Priority
        { id: '1', store_id: '1', cat: 'Sales', sub: 'Finalize Deal', status: 'pending', priority: 'high', due_date: today.toISOString(), description: 'Close the bulk deal for Q1' },
        { id: '2', store_id: '4', cat: 'Support', sub: 'Urgent Delivery', status: 'pending', priority: 'high', due_date: tomorrow.toISOString(), description: 'Ensure delivery arrives by morning' },

        // Pending Normal
        { id: '3', store_id: '2', cat: 'Support', sub: 'Fix Display', status: 'pending', priority: 'medium', due_date: nextWeek.toISOString(), description: 'Help arrange the new stand' },
        { id: '4', store_id: '3', cat: 'Sales', sub: 'Send Catalog', status: 'pending', priority: 'low', due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), description: 'Email the PDF catalog' },

        // In Progress & Done
        { id: '5', store_id: '5', cat: 'Admin', sub: 'Update Contract', status: 'in_progress', priority: 'medium', due_date: tomorrow.toISOString(), description: 'Updating terms' },
        { id: '6', store_id: '1', cat: 'Sales', sub: 'Initial Contact', status: 'done', priority: 'medium', due_date: lastWeek.toISOString(), description: 'First meeting done' },
    ],
    sales_snapshots: [],
    settings: {
        visitTypes: ['Visit', 'Call', 'Meeting'],
        visitReasons: ['Sales', 'Collection', 'Support', 'Friendly', 'Training', 'Issue'],
        contactRoles: ['Owner', 'Manager', 'Sales Rep', 'Accountant'],
        taskCategories: { Sales: ['Product Demo', 'Contract Renewal', 'Pricing'], Support: ['Technical Issue', 'Training', 'Complaint'], Admin: ['Paperwork', 'Report'] },
        zones: ['Baghdad Central', 'Baghdad East', 'Basra', 'Erbil', 'Mosul', 'Karbala', 'Najaf'],
        storeCategories: ['Grocery', 'Electronics', 'Fashion', 'Pharmacy', 'Restaurant'],
    },
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
        if (error) throw error;
        return count;
    }

    async from(table) {
        return {
            select: async () => {
                const { data, error } = await supabase.from(table).select('*');
                return { data, error };
            },
            insert: async (item) => {
                const { data, error } = await supabase.from(table).insert(item).select().single();
                return { data, error };
            },
            update: async (id, updates) => {
                const { data, error } = await supabase.from(table).update(updates).eq('id', id).select().single();
                return { data, error };
            },
            delete: async (id) => {
                const { error } = await supabase.from(table).delete().eq('id', id);
                return { error };
            },
        };
    }
    async getSettings() {
        // Implement settings fetching from a specific table or JSON store if needed
        // For now, return mock settings or fetch from a 'settings' table
        return initialData.settings;
    }
    async updateSettings(settings) {
        // Implement settings update
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
    async from(table) {
        await delay(100);
        return {
            select: async () => ({ data: [...this.data[table]], error: null }),
            insert: async (item) => {
                const newItem = { ...item, id: item.id || Date.now().toString() };
                this.data[table].push(newItem);
                this.save();
                return { data: newItem, error: null };
            },
            update: async (id, updates) => {
                const idx = this.data[table].findIndex(i => i.id === id);
                if (idx !== -1) { this.data[table][idx] = { ...this.data[table][idx], ...updates }; this.save(); }
                return { data: this.data[table][idx], error: null };
            },
            delete: async (id) => {
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
