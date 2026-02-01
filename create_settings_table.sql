-- Create settings table for storing application settings
-- Run this in your Supabase SQL Editor

-- Create the settings table
CREATE TABLE IF NOT EXISTS settings (
    id TEXT PRIMARY KEY DEFAULT 'global',
    data JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default settings if not exists
INSERT INTO settings (id, data) 
VALUES ('global', '{
    "visitTypes": ["Visit", "Call", "Meeting"],
    "visitReasons": ["Sales", "Collection", "Support", "Friendly", "Training", "Issue"],
    "contactRoles": ["Owner", "Manager", "Sales Rep", "Accountant"],
    "taskCategories": {
        "Sales": ["Product Demo", "Contract Renewal", "Pricing"],
        "Support": ["Technical Issue", "Training", "Complaint"],
        "Admin": ["Paperwork", "Report"]
    },
    "zones": ["Baghdad Central", "Baghdad East", "Basra", "Erbil", "Mosul", "Karbala", "Najaf"],
    "storeCategories": ["Grocery", "Electronics", "Fashion", "Pharmacy", "Restaurant"]
}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies to allow all authenticated users to read/write settings
-- You may want to restrict this to admins only in production

-- Allow all authenticated users to read settings
CREATE POLICY "Allow authenticated read settings" ON settings
    FOR SELECT TO authenticated USING (true);

-- Allow all authenticated users to update settings  
CREATE POLICY "Allow authenticated update settings" ON settings
    FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- Allow all authenticated users to insert settings
CREATE POLICY "Allow authenticated insert settings" ON settings
    FOR INSERT TO authenticated WITH CHECK (true);

-- Grant permissions
GRANT ALL ON settings TO authenticated;
GRANT ALL ON settings TO anon;
