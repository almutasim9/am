import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function applySchema() {
    console.log('Applying schema updates...');

    try {
        // Note: Since we don't have an 'rpc' to run arbitrary SQL easily without a pre-defined function,
        // and if the user hasn't run the SQL in the dashboard, we might have issues.
        // However, we can try to update the 'settings' table directly since it exists.

        const { data: currentSettings, error: fetchError } = await supabase
            .from('settings')
            .select('*')
            .eq('id', 1)
            .single();

        if (fetchError) {
            console.error('Error fetching settings:', fetchError);
        } else {
            const updatedData = {
                ...currentSettings.data,
                offerTypes: ["خصومات يومية", "TSN", "T+", "Winback", "punchcard", "camping"]
            };

            const { error: updateError } = await supabase
                .from('settings')
                .update({ data: updatedData })
                .eq('id', 1);

            if (updateError) {
                console.error('Error updating settings:', updateError);
            } else {
                console.log('Settings updated successfully with new offer types.');
            }
        }

        console.log('\nIMPORTANT: Please run the following SQL in your Supabase SQL Editor manually to add the column:');
        console.log('ALTER TABLE public.stores ADD COLUMN IF NOT EXISTS offers jsonb DEFAULT \'[]\'::jsonb;');

    } catch (err) {
        console.error('Unexpected error:', err);
    }
}

applySchema();
