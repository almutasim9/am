-- ============================================
-- Menu Builder Schema for AM-CRM
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Menus Table (linked to stores)
create table if not exists public.menus (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  store_id text,
  name text not null,
  description text,
  is_active boolean default true
);

-- 2. Menu Categories
create table if not exists public.menu_categories (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  menu_id uuid references public.menus(id) on delete cascade,
  name text not null,
  sort_order int default 0
);

-- 3. Menu Items (with modifiers stored as JSON)
create table if not exists public.menu_items (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  category_id uuid references public.menu_categories(id) on delete cascade,
  name text not null,
  description text,
  price decimal(10,2) not null default 0,
  is_available boolean default true,
  sort_order int default 0,
  -- Modifiers stored as JSON for flexibility
  modifiers jsonb default '{
    "variants": [],
    "addons": [],
    "choiceGroups": [],
    "removables": []
  }'::jsonb
);

-- ============================================
-- INDEXES
-- ============================================
create index if not exists idx_menus_store_id on public.menus(store_id);
create index if not exists idx_menu_categories_menu_id on public.menu_categories(menu_id);
create index if not exists idx_menu_items_category_id on public.menu_items(category_id);

-- ============================================
-- MODIFIERS JSON STRUCTURE REFERENCE
-- ============================================
/*
modifiers: {
  variants: [
    {
      id: "uuid",
      name: "Size",
      is_required: true,
      options: [
        { id: "uuid", name: "Small", price: 5.00, is_default: true },
        { id: "uuid", name: "Large", price: 8.00, is_default: false }
      ]
    }
  ],
  addons: [
    { id: "uuid", name: "Extra Cheese", price: 2.00, is_available: true }
  ],
  choiceGroups: [
    {
      id: "uuid",
      name: "Rice Type",
      is_required: true,
      options: [
        { id: "uuid", name: "White Rice", is_default: true },
        { id: "uuid", name: "Bulgur", is_default: false }
      ]
    }
  ],
  removables: [
    { id: "uuid", name: "Onion" },
    { id: "uuid", name: "Tomato" }
  ]
}
*/
