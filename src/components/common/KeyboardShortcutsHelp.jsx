import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Keyboard, Command } from 'lucide-react';

/**
 * KeyboardShortcutsHelp - Modal لعرض اختصارات لوحة المفاتيح
 */
const KeyboardShortcutsHelp = ({ isOpen, onClose, shortcuts = [] }) => {
    if (!isOpen) return null;

    // تجميع الاختصارات حسب الفئة
    const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
        const category = shortcut.category || 'عام';
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(shortcut);
        return acc;
    }, {});

    const categoryIcons = {
        'عام': '⌨️',
        'إنشاء': '➕',
        'تنقل': '🧭'
    };

    const isMac = typeof navigator !== 'undefined' &&
        navigator.platform.toUpperCase().indexOf('MAC') >= 0;

    const formatKey = (key) => {
        if (key === 'Ctrl/Cmd') {
            return isMac ? '⌘' : 'Ctrl';
        }
        if (key === 'Shift') return '⇧';
        if (key === 'Esc') return 'Esc';
        return key;
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: 'spring', duration: 0.3 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    >
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-hidden">
                            {/* Header */}
                            <div className="flex items-center justify-between p-4 border-b dark:border-slate-700">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl text-white">
                                        <Keyboard size={20} />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold dark:text-white">اختصارات لوحة المفاتيح</h2>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">اضغط ? للعرض في أي وقت</p>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
                                >
                                    <X size={20} className="text-slate-500" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-4 overflow-y-auto max-h-[calc(80vh-120px)]">
                                {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
                                    <div key={category} className="mb-6 last:mb-0">
                                        <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-2">
                                            <span>{categoryIcons[category] || '📌'}</span>
                                            {category}
                                        </h3>
                                        <div className="space-y-2">
                                            {categoryShortcuts.map((shortcut, index) => (
                                                <div
                                                    key={index}
                                                    className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl"
                                                >
                                                    <span className="text-sm dark:text-white">
                                                        {shortcut.description}
                                                    </span>
                                                    <div className="flex items-center gap-1">
                                                        {shortcut.keys.map((key, keyIndex) => (
                                                            <React.Fragment key={keyIndex}>
                                                                <kbd className="inline-flex items-center justify-center min-w-[28px] h-7 px-2 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg shadow-sm">
                                                                    {formatKey(key)}
                                                                </kbd>
                                                                {keyIndex < shortcut.keys.length - 1 && (
                                                                    <span className="text-slate-400 text-xs mx-0.5">+</span>
                                                                )}
                                                            </React.Fragment>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Footer */}
                            <div className="p-4 border-t dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                                <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
                                    <Command size={12} />
                                    <span>اضغط</span>
                                    <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-700 border dark:border-slate-600 rounded text-xs">Esc</kbd>
                                    <span>للإغلاق</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default KeyboardShortcutsHelp;
