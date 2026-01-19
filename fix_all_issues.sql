-- =============================================
-- إصلاح شامل لقاعدة بيانات AM-CRM
-- قم بتشغيل هذا الملف في Supabase SQL Editor
-- =============================================

-- =============================================
-- 1. إيقاف RLS على جميع الجداول
-- =============================================
ALTER TABLE public.stores DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.visits DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings DISABLE ROW LEVEL SECURITY;

-- =============================================
-- 2. إضافة الأعمدة المفقودة لجدول Stores
-- =============================================
ALTER TABLE public.stores 
ADD COLUMN IF NOT EXISTS store_code text, -- كود المتجر الظاهر للمستخدم (مطلوب وفريد)
ADD COLUMN IF NOT EXISTS address text,
ADD COLUMN IF NOT EXISTS area_name text,
ADD COLUMN IF NOT EXISTS has_pos boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS has_sim_card boolean DEFAULT false;

-- جعل store_code فريد (UNIQUE)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'stores_store_code_key') THEN
        ALTER TABLE public.stores ADD CONSTRAINT stores_store_code_key UNIQUE (store_code);
    END IF;
END $$;

-- ملاحظة: يمكنك جعل store_code مطلوب (NOT NULL) بعد تعبئة البيانات الموجودة:
-- ALTER TABLE public.stores ALTER COLUMN store_code SET NOT NULL;

-- =============================================
-- 3. إضافة عمود reason لجدول Visits
-- =============================================
ALTER TABLE public.visits 
ADD COLUMN IF NOT EXISTS reason text;

-- =============================================
-- 4. إنشاء جداول القوائم (Menus)
-- =============================================

-- جدول القوائم الرئيسية
CREATE TABLE IF NOT EXISTS public.menus (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  store_id text,
  name text not null,
  description text
);

-- فئات القائمة
CREATE TABLE IF NOT EXISTS public.menu_categories (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  menu_id uuid references public.menus(id) on delete cascade,
  name text not null,
  name_ar text,
  name_ku text,
  position integer default 0
);

-- عناصر القائمة
CREATE TABLE IF NOT EXISTS public.menu_items (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  category_id uuid references public.menu_categories(id) on delete cascade,
  name text not null,
  name_ar text,
  name_ku text,
  description text,
  description_ar text,
  description_ku text,
  price numeric(10,2) not null default 0,
  position integer default 0,
  modifiers jsonb default '{"variants":[],"addons":[],"choices":[],"removables":[]}'
);

-- إيقاف RLS للجداول الجديدة
ALTER TABLE public.menus DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items DISABLE ROW LEVEL SECURITY;

-- =============================================
-- 5. التحقق من نجاح التعديلات
-- =============================================
SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name AND table_schema = 'public') as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
AND table_name IN ('stores', 'visits', 'tasks', 'settings', 'menus', 'menu_categories', 'menu_items')
ORDER BY table_name;

-- =============================================
-- تم! الآن يجب أن يعمل النظام بشكل صحيح
-- =============================================
