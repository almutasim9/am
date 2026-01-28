-- Add discount columns to stores table
ALTER TABLE public.stores 
ADD COLUMN IF NOT EXISTS discount_type text,
ADD COLUMN IF NOT EXISTS discount_value text;

-- Update settings with new discount types
-- Note: Replace with actual update logic for JSONB if needed, 
-- but here we assume we'll update it via code or manual insertion.
UPDATE public.settings 
SET data = data || '{"discountTypes": ["خصومات يومية", "TSN", "T+", "Winback", "punchcard", "camping"]}'::jsonb
WHERE id = 1;
