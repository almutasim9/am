-- =============================================
-- إصلاح سياسات الأمان (RLS) لـ Supabase
-- قم بتشغيل هذا الكود في Supabase SQL Editor
-- =============================================

-- 1. إيقاف RLS على الجداول (للتطوير فقط)
-- أو يمكنك إضافة سياسات مناسبة

-- خيار 1: إيقاف RLS تماماً (للتطوير)
ALTER TABLE public.stores DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.visits DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings DISABLE ROW LEVEL SECURITY;

-- خيار 2: أو إضافة سياسات تسمح بالوصول الكامل
-- (استخدم هذا إذا كنت تريد RLS مفعّل)

/*
-- سياسة القراءة للجميع
CREATE POLICY "Allow public read" ON public.stores FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON public.visits FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON public.tasks FOR SELECT USING (true);

-- سياسة الإضافة للجميع
CREATE POLICY "Allow public insert" ON public.stores FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert" ON public.visits FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert" ON public.tasks FOR INSERT WITH CHECK (true);

-- سياسة التحديث للجميع
CREATE POLICY "Allow public update" ON public.stores FOR UPDATE USING (true);
CREATE POLICY "Allow public update" ON public.visits FOR UPDATE USING (true);
CREATE POLICY "Allow public update" ON public.tasks FOR UPDATE USING (true);

-- سياسة الحذف للجميع
CREATE POLICY "Allow public delete" ON public.stores FOR DELETE USING (true);
CREATE POLICY "Allow public delete" ON public.visits FOR DELETE USING (true);
CREATE POLICY "Allow public delete" ON public.tasks FOR DELETE USING (true);
*/

-- =============================================
-- اختبار: التحقق من الجداول
-- =============================================
SELECT table_name, 
       pg_catalog.has_table_privilege('anon', table_name, 'SELECT') as can_select,
       pg_catalog.has_table_privilege('anon', table_name, 'INSERT') as can_insert
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('stores', 'visits', 'tasks');
