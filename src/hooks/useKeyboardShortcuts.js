import { useEffect, useCallback, useRef } from 'react';

/**
 * useKeyboardShortcuts - Hook لإدارة اختصارات لوحة المفاتيح
 * 
 * الاختصارات المدعومة:
 * - Ctrl/Cmd + K: فتح البحث
 * - Ctrl/Cmd + N: مهمة جديدة
 * - Ctrl/Cmd + Shift + N: زيارة جديدة
 * - ?: عرض المساعدة
 * - G + D: الذهاب للداشبورد
 * - G + T: الذهاب للمهام
 * - G + S: الذهاب للمتاجر
 * - G + V: الذهاب للزيارات
 * - G + M: الذهاب للخريطة
 * - Escape: إغلاق النوافذ
 */

const useKeyboardShortcuts = (options = {}) => {
    const {
        onSearch,
        onNewTask,
        onNewVisit,
        onShowHelp,
        onNavigate,
        onEscape,
        enabled = true
    } = options;

    const gKeyPressed = useRef(false);
    const gKeyTimeout = useRef(null);

    const handleKeyDown = useCallback((event) => {
        if (!enabled) return;

        // تجاهل الاختصارات إذا كان المستخدم يكتب في حقل إدخال
        const target = event.target;
        const isInputField = target.tagName === 'INPUT' ||
            target.tagName === 'TEXTAREA' ||
            target.isContentEditable;

        const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
        const cmdOrCtrl = isMac ? event.metaKey : event.ctrlKey;

        // Ctrl/Cmd + K: فتح البحث
        if (cmdOrCtrl && event.key === 'k') {
            event.preventDefault();
            onSearch?.();
            return;
        }

        // Ctrl/Cmd + N: مهمة جديدة
        if (cmdOrCtrl && !event.shiftKey && event.key === 'n') {
            event.preventDefault();
            onNewTask?.();
            return;
        }

        // Ctrl/Cmd + Shift + N: زيارة جديدة
        if (cmdOrCtrl && event.shiftKey && event.key === 'N') {
            event.preventDefault();
            onNewVisit?.();
            return;
        }

        // تجاهل باقي الاختصارات إذا كان في حقل إدخال
        if (isInputField) return;

        // ?: عرض المساعدة
        if (event.key === '?' && event.shiftKey) {
            event.preventDefault();
            onShowHelp?.();
            return;
        }

        // Escape: إغلاق
        if (event.key === 'Escape') {
            onEscape?.();
            return;
        }

        // G + حرف للتنقل السريع
        if (event.key.toLowerCase() === 'g' && !gKeyPressed.current) {
            gKeyPressed.current = true;

            // إلغاء التايمر السابق إن وجد
            if (gKeyTimeout.current) {
                clearTimeout(gKeyTimeout.current);
            }

            // إعادة تعيين بعد 1 ثانية
            gKeyTimeout.current = setTimeout(() => {
                gKeyPressed.current = false;
            }, 1000);
            return;
        }

        // التنقل إذا تم الضغط على G مسبقاً
        if (gKeyPressed.current) {
            gKeyPressed.current = false;
            if (gKeyTimeout.current) {
                clearTimeout(gKeyTimeout.current);
            }

            switch (event.key.toLowerCase()) {
                case 'd':
                case 'h': // Home
                    event.preventDefault();
                    onNavigate?.('/');
                    break;
                case 't':
                    event.preventDefault();
                    onNavigate?.('/tasks');
                    break;
                case 's':
                    event.preventDefault();
                    onNavigate?.('/stores');
                    break;
                case 'v':
                    event.preventDefault();
                    onNavigate?.('/visits');
                    break;
                case 'm':
                    event.preventDefault();
                    onNavigate?.('/map');
                    break;
                case 'a':
                    event.preventDefault();
                    onNavigate?.('/analytics');
                    break;
                case 'o':
                    event.preventDefault();
                    onNavigate?.('/offers');
                    break;
                case 'x': // Settings
                    event.preventDefault();
                    onNavigate?.('/settings');
                    break;
            }
        }
    }, [enabled, onSearch, onNewTask, onNewVisit, onShowHelp, onNavigate, onEscape]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            if (gKeyTimeout.current) {
                clearTimeout(gKeyTimeout.current);
            }
        };
    }, [handleKeyDown]);

    return {
        // إرجاع معلومات الاختصارات للعرض
        shortcuts: [
            { keys: ['Ctrl/Cmd', 'K'], description: 'فتح البحث', category: 'عام' },
            { keys: ['Ctrl/Cmd', 'N'], description: 'مهمة جديدة', category: 'إنشاء' },
            { keys: ['Ctrl/Cmd', 'Shift', 'N'], description: 'زيارة جديدة', category: 'إنشاء' },
            { keys: ['?'], description: 'عرض الاختصارات', category: 'عام' },
            { keys: ['Esc'], description: 'إغلاق النوافذ', category: 'عام' },
            { keys: ['G', 'D'], description: 'الذهاب للداشبورد', category: 'تنقل' },
            { keys: ['G', 'T'], description: 'الذهاب للمهام', category: 'تنقل' },
            { keys: ['G', 'S'], description: 'الذهاب للمتاجر', category: 'تنقل' },
            { keys: ['G', 'V'], description: 'الذهاب للزيارات', category: 'تنقل' },
            { keys: ['G', 'M'], description: 'الذهاب للخريطة', category: 'تنقل' },
            { keys: ['G', 'A'], description: 'الذهاب للتحليلات', category: 'تنقل' },
            { keys: ['G', 'O'], description: 'الذهاب للعروض', category: 'تنقل' },
            { keys: ['G', 'X'], description: 'الذهاب للإعدادات', category: 'تنقل' },
        ]
    };
};

export default useKeyboardShortcuts;
