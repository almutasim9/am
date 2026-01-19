
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env from project root
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function addTestStore() {
    console.log('Attempting to add test store...');

    const testStore = {
        id: `TEST-${Date.now()}`, // Explicit ID
        name: "AI Test Store",
        category: "Electronics",
        owner: "AI Bot",
        phone: "1234567890",
        zone: "Baghdad Central",
        status: "Active",
        created_at: new Date().toISOString()
    };

    // 1. Insert
    const { data: insertData, error: insertError } = await supabase
        .from('stores')
        .insert([testStore])
        .select();

    if (insertError) {
        console.error('❌ Insert Error:', insertError);
        return;
    }

    console.log('✅ Insert Successful:', insertData);

    // 2. Try to Read it back
    console.log('Attempting to read back the store...');
    const { data: readData, error: readError } = await supabase
        .from('stores')
        .select('*')
        .eq('id', testStore.id);

    if (readError) {
        console.error('❌ Read Error:', readError);
    } else if (readData.length === 0) {
        console.error('⚠️ Read Successful but no data returned. This likely means RLS (Row Level Security) is blocking READ access for anonymous users.');
    } else {
        console.log('✅ Read Successful:', readData);
    }
}

addTestStore();
