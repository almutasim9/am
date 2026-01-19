-- ============================================
-- Add modifiers column to menu_items table
-- Run this in Supabase SQL Editor
-- ============================================

-- Add the modifiers column if it doesn't exist
ALTER TABLE public.menu_items 
ADD COLUMN IF NOT EXISTS modifiers jsonb DEFAULT '{
    "variants": [],
    "addons": [],
    "choiceGroups": [],
    "removables": []
}'::jsonb;

-- Verify the column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'menu_items' AND column_name = 'modifiers';
