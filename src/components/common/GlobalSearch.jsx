import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Store, CheckSquare, Calendar, Command, ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { fuzzySearch, highlightMatch } from '../../utils/fuzzySearch';

const GlobalSearch = ({ stores, tasks, visits }) => {
    const navigate = useNavigate();
    const inputRef = useRef(null);
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [results, setResults] = useState({ stores: [], tasks: [], visits: [] });
    const [selectedIndex, setSelectedIndex] = useState(0);

    // البحث الذكي مع Fuzzy matching
    useEffect(() => {
        if (query.length < 1) {
            setResults({ stores: [], tasks: [], visits: [] });
            setSelectedIndex(0);
            return;
        }

        // البحث في المتاجر
        const storeResults = fuzzySearch(
            stores,
            query,
            ['name', 'owner', 'zone', 'category', 'phone'],
            { threshold: 0.3, limit: 5 }
        );

        // البحث في المهام
        const taskResults = fuzzySearch(
            tasks,
            query,
            ['title', 'sub', 'cat', 'description'],
            { threshold: 0.3, limit: 5 }
        );

        // البحث في الزيارات (مع اسم المتجر)
        const visitsWithStoreName = visits.map(v => {
            const store = stores.find(s => s.id === v.store_id);
            return { ...v, storeName: store?.name || '' };
        });
        const visitResults = fuzzySearch(
            visitsWithStoreName,
            query,
            ['storeName', 'type', 'notes'],
            { threshold: 0.3, limit: 5 }
        );

        setResults({
            stores: storeResults,
            tasks: taskResults,
            visits: visitResults
        });
        setSelectedIndex(0);
    }, [query, stores, tasks, visits]);

    // الحصول على جميع النتائج كمصفوفة واحدة
    const getAllResults = useCallback(() => {
        const all = [];
        results.stores.forEach((r, i) => all.push({ type: 'store', data: r, index: i }));
        results.tasks.forEach((r, i) => all.push({ type: 'task', data: r, index: i }));
        results.visits.forEach((r, i) => all.push({ type: 'visit', data: r, index: i }));
        return all;
    }, [results]);

    const hasResults = results.stores.length > 0 || results.tasks.length > 0 || results.visits.length > 0;

    const handleNavigate = (path) => {
        navigate(path);
        setIsOpen(false);
        setQuery('');
    };

    // التنقل بلوحة المفاتيح
    const handleKeyDown = (e) => {
        const allResults = getAllResults();

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex(prev => (prev + 1) % Math.max(allResults.length, 1));
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex(prev => (prev - 1 + allResults.length) % Math.max(allResults.length, 1));
                break;
            case 'Enter':
                e.preventDefault();
                if (allResults[selectedIndex]) {
                    const selected = allResults[selectedIndex];
                    if (selected.type === 'store') handleNavigate(`/stores/${selected.data.item.id}`);
                    else if (selected.type === 'task') handleNavigate('/tasks');
                    else if (selected.type === 'visit') handleNavigate('/visits');
                }
                break;
            case 'Escape':
                setIsOpen(false);
                setQuery('');
                inputRef.current?.blur();
                break;
        }
    };

    // عرض النص مع تمييز الجزء المطابق
    const HighlightedText = ({ text, query }) => {
        if (!text) return null;
        const parts = highlightMatch(text, query);
        return (
            <span>
                {parts.map((part, i) => (
                    part.highlight ? (
                        <mark key={i} className="bg-yellow-200 dark:bg-yellow-700 px-0.5 rounded">
                            {part.text}
                        </mark>
                    ) : (
                        <span key={i}>{part.text}</span>
                    )
                ))}
            </span>
        );
    };

    // الحصول على فهرس العنصر في القائمة الكلية
    const getGlobalIndex = (type, localIndex) => {
        let offset = 0;
        if (type === 'task') offset = results.stores.length;
        else if (type === 'visit') offset = results.stores.length + results.tasks.length;
        return offset + localIndex;
    };

    return (
        <div className="relative">
            <div className={`flex items-center gap-2 bg-slate-100 dark:bg-slate-700 rounded-xl px-3 py-2 transition-all ${isOpen ? 'ring-2 ring-primary-500' : ''}`}>
                <Search size={18} className="text-slate-400" />
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={e => { setQuery(e.target.value); setIsOpen(true); }}
                    onFocus={() => setIsOpen(true)}
                    onKeyDown={handleKeyDown}
                    placeholder="البحث... (Ctrl+K)"
                    className="bg-transparent border-none outline-none text-sm w-48 dark:text-white dark:placeholder-slate-400"
                />
                <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 text-xs text-slate-400 bg-slate-200 dark:bg-slate-600 rounded">
                    <Command size={10} />K
                </kbd>
            </div>

            {isOpen && query.length >= 1 && (
                <div className="absolute top-full mt-2 right-0 w-96 max-w-[calc(100vw-2rem)] bg-white dark:bg-slate-800 rounded-xl shadow-xl border dark:border-slate-700 z-50 overflow-hidden">
                    {/* Header with search info */}
                    <div className="px-3 py-2 bg-slate-50 dark:bg-slate-900/50 border-b dark:border-slate-700 flex items-center justify-between">
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Sparkles size={12} className="text-amber-500" />
                            بحث ذكي
                        </span>
                        <span className="text-xs text-slate-400">
                            {results.stores.length + results.tasks.length + results.visits.length} نتيجة
                        </span>
                    </div>

                    <div className="max-h-80 overflow-y-auto">
                        {hasResults ? (
                            <>
                                {/* Stores */}
                                {results.stores.length > 0 && (
                                    <div className="p-2">
                                        <p className="text-xs font-medium text-slate-500 px-2 mb-1 flex items-center gap-1">
                                            <Store size={12} /> المتاجر
                                        </p>
                                        {results.stores.map((result, i) => (
                                            <button
                                                key={result.item.id}
                                                onClick={() => handleNavigate(`/stores/${result.item.id}`)}
                                                className={`w-full text-left px-3 py-2 rounded-lg text-sm dark:text-white flex items-center justify-between group transition-colors ${selectedIndex === getGlobalIndex('store', i)
                                                    ? 'bg-primary-50 dark:bg-primary-900/30'
                                                    : 'hover:bg-slate-100 dark:hover:bg-slate-700'
                                                    }`}
                                            >
                                                <div>
                                                    <HighlightedText text={result.item.name} query={query} />
                                                    {result.item.zone && (
                                                        <span className="text-xs text-slate-400 mr-2">• {result.item.zone}</span>
                                                    )}
                                                </div>
                                                <ArrowRight size={14} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* Tasks */}
                                {results.tasks.length > 0 && (
                                    <div className="p-2 border-t dark:border-slate-700">
                                        <p className="text-xs font-medium text-slate-500 px-2 mb-1 flex items-center gap-1">
                                            <CheckSquare size={12} /> المهام
                                        </p>
                                        {results.tasks.map((result, i) => (
                                            <button
                                                key={result.item.id}
                                                onClick={() => handleNavigate('/tasks')}
                                                className={`w-full text-left px-3 py-2 rounded-lg text-sm dark:text-white flex items-center justify-between group transition-colors ${selectedIndex === getGlobalIndex('task', i)
                                                    ? 'bg-primary-50 dark:bg-primary-900/30'
                                                    : 'hover:bg-slate-100 dark:hover:bg-slate-700'
                                                    }`}
                                            >
                                                <div>
                                                    <HighlightedText text={result.item.title || result.item.sub} query={query} />
                                                    {result.item.cat && (
                                                        <span className="text-xs text-slate-400 mr-2">• {result.item.cat}</span>
                                                    )}
                                                </div>
                                                <span className={`text-xs px-1.5 py-0.5 rounded ${result.item.status === 'done' ? 'bg-secondary-100 text-secondary-600' :
                                                    result.item.status === 'in-progress' ? 'bg-primary-100 text-primary-600' :
                                                        'bg-slate-100 text-slate-600'
                                                    }`}>
                                                    {result.item.status === 'done' ? 'منجز' :
                                                        result.item.status === 'in-progress' ? 'قيد التنفيذ' : 'جديد'}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* Visits */}
                                {results.visits.length > 0 && (
                                    <div className="p-2 border-t dark:border-slate-700">
                                        <p className="text-xs font-medium text-slate-500 px-2 mb-1 flex items-center gap-1">
                                            <Calendar size={12} /> الزيارات
                                        </p>
                                        {results.visits.map((result, i) => {
                                            const store = stores.find(s => s.id === result.item.store_id);
                                            return (
                                                <button
                                                    key={result.item.id}
                                                    onClick={() => handleNavigate('/visits')}
                                                    className={`w-full text-left px-3 py-2 rounded-lg text-sm dark:text-white flex items-center justify-between group transition-colors ${selectedIndex === getGlobalIndex('visit', i)
                                                        ? 'bg-primary-50 dark:bg-primary-900/30'
                                                        : 'hover:bg-slate-100 dark:hover:bg-slate-700'
                                                        }`}
                                                >
                                                    <div>
                                                        <HighlightedText text={store?.name || 'متجر'} query={query} />
                                                        <span className="text-xs text-slate-400 mr-2">• {result.item.type}</span>
                                                    </div>
                                                    <span className={`text-xs px-1.5 py-0.5 rounded ${result.item.status === 'completed' ? 'bg-secondary-100 text-secondary-600' :
                                                        'bg-accent-100 text-accent-600'
                                                        }`}>
                                                        {result.item.status === 'completed' ? 'مكتملة' : 'مجدولة'}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="p-6 text-center">
                                <Search size={24} className="mx-auto text-slate-300 mb-2" />
                                <p className="text-sm text-slate-500">لا توجد نتائج لـ "{query}"</p>
                                <p className="text-xs text-slate-400 mt-1">جرب كلمات مختلفة</p>
                            </div>
                        )}
                    </div>

                    {/* Footer with keyboard hints */}
                    <div className="px-3 py-2 bg-slate-50 dark:bg-slate-900/50 border-t dark:border-slate-700 flex items-center justify-between text-xs text-slate-400">
                        <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1">
                                <kbd className="px-1 bg-slate-200 dark:bg-slate-600 rounded">↑↓</kbd> للتنقل
                            </span>
                            <span className="flex items-center gap-1">
                                <kbd className="px-1 bg-slate-200 dark:bg-slate-600 rounded">Enter</kbd> للفتح
                            </span>
                        </div>
                        <span className="flex items-center gap-1">
                            <kbd className="px-1 bg-slate-200 dark:bg-slate-600 rounded">Esc</kbd> للإغلاق
                        </span>
                    </div>
                </div>
            )}

            {isOpen && <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />}
        </div>
    );
};

export default GlobalSearch;
