-- Run this in your Supabase SQL Editor to add the missing columns

ALTER TABLE public.stores 
ADD COLUMN IF NOT EXISTS name text,
ADD COLUMN IF NOT EXISTS category text,
ADD COLUMN IF NOT EXISTS owner text,
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS zone text,
ADD COLUMN IF NOT EXISTS address text,
ADD COLUMN IF NOT EXISTS area_name text,
ADD COLUMN IF NOT EXISTS map_link text,
ADD COLUMN IF NOT EXISTS status text DEFAULT 'Active',
ADD COLUMN IF NOT EXISTS has_pos boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS has_sim_card boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS pinned_note text,
ADD COLUMN IF NOT EXISTS last_visit timestamptz,
ADD COLUMN IF NOT EXISTS contacts jsonb DEFAULT '[]'::jsonb;

-- Also ensure RLS is enabled but allows access (optional if you already disabled it)
-- ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow public access" ON public.stores FOR ALL USING (true);
