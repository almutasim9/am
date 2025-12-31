-- Enable Row Level Security (RLS) is generally recommended, but for simplicity in this V1,
-- we will just create the tables. You can enable RLS later in the Supabase Dashboard.

-- 1. Create Stores Table
create table public.stores (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  zone text,
  category text,
  owner text,
  phone text,
  map_link text,
  status text default 'Active',
  last_visit timestamp with time zone,
  pinned_note text,
  contacts jsonb default '[]'::jsonb
);

-- 2. Create Visits Table
create table public.visits (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  store_id uuid references public.stores(id) on delete cascade,
  date timestamp with time zone not null,
  type text,
  note text,
  status text default 'scheduled',
  is_effective boolean
);

-- 3. Create Tasks Table
create table public.tasks (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  store_id uuid references public.stores(id) on delete cascade,
  cat text,
  sub text,
  status text default 'pending',
  priority text default 'medium',
  due_date timestamp with time zone,
  description text
);

-- 4. Create Settings Table (Singleton)
create table public.settings (
  id int primary key default 1,
  data jsonb not null
);

-- Insert Default Settings
-- Add reason column to visits if it doesn't exist
ALTER TABLE public.visits 
ADD COLUMN IF NOT EXISTS reason text;

-- Insert Default Settings (Updated with visitReasons)
insert into public.settings (id, data)
values (1, '{
    "visitTypes": ["Visit", "Call", "Meeting"],
    "visitReasons": ["Sales", "Collection", "Support", "Friendly", "Training", "Issue"],
    "contactRoles": ["Owner", "Manager", "Sales Rep", "Accountant"],
    "taskCategories": {
        "Sales": ["Product Demo", "Contract Renewal", "Pricing"],
        "Support": ["Technical Issue", "Training", "Complaint"]
    },
    "zones": ["Baghdad Central", "Baghdad East", "Basra", "Erbil", "Mosul"],
    "storeCategories": ["Grocery", "Electronics", "Fashion", "Pharmacy", "Restaurant"]
}')
on conflict (id) do update 
set data = settings.data || '{"visitReasons": ["Sales", "Collection", "Support", "Friendly", "Training", "Issue"]}'::jsonb;
