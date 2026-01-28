-- Add multiple offers support to stores table
ALTER TABLE public.stores 
ADD COLUMN IF NOT EXISTS offers jsonb DEFAULT '[]'::jsonb;

-- Update settings with available offer names
UPDATE public.settings 
SET data = data || '{"offerTypes": ["خصومات يومية", "TSN", "T+", "Winback", "punchcard", "camping"]}'::jsonb
WHERE id = 1;
