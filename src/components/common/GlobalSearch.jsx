import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const GlobalSearch = ({ stores, tasks, visits }) => {
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [results, setResults] = useState({ stores: [], tasks: [], visits: [] });

    useEffect(() => {
        if (query.length < 2) {
            // eslint-disable-next-line
            setResults({ stores: [], tasks: [], visits: [] });
            return;
        }
        const q = query.toLowerCase();
        // eslint-disable-next-line
        setResults({
            stores: stores.filter(s => s.name?.toLowerCase().includes(q) || s.owner?.toLowerCase().includes(q)).slice(0, 5),
            tasks: tasks.filter(t => t.sub?.toLowerCase().includes(q) || t.cat?.toLowerCase().includes(q)).slice(0, 5),
            visits: visits.filter(v => {
                const store = stores.find(s => s.id === v.store_id);
                return store?.name?.toLowerCase().includes(q) || v.type?.toLowerCase().includes(q);
            }).slice(0, 5)
        });
    }, [query, stores, tasks, visits]);

    const hasResults = results.stores.length > 0 || results.tasks.length > 0 || results.visits.length > 0;

    const handleNavigate = (path) => {
        navigate(path);
        setIsOpen(false);
        setQuery('');
    };

    return (
        <div className="relative">
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-700 rounded-xl px-3 py-2">
                <Search size={18} className="text-slate-400" />
                <input type="text" value={query} onChange={e => { setQuery(e.target.value); setIsOpen(true); }}
                    onFocus={() => setIsOpen(true)} placeholder="Search..."
                    className="bg-transparent border-none outline-none text-sm w-48 dark:text-white dark:placeholder-slate-400" />
            </div>
            {isOpen && query.length >= 2 && (
                <div className="absolute top-full mt-2 right-0 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-xl border dark:border-slate-700 z-50 max-h-96 overflow-y-auto">
                    {hasResults ? (
                        <>
                            {results.stores.length > 0 && (
                                <div className="p-2">
                                    <p className="text-xs font-medium text-slate-500 px-2 mb-1">🏪 Stores</p>
                                    {results.stores.map(s => (
                                        <button key={s.id} onClick={() => handleNavigate('/stores')}
                                            className="w-full text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-sm dark:text-white">
                                            {s.name}
                                        </button>
                                    ))}
                                </div>
                            )}
                            {results.tasks.length > 0 && (
                                <div className="p-2 border-t dark:border-slate-700">
                                    <p className="text-xs font-medium text-slate-500 px-2 mb-1">✅ Tasks</p>
                                    {results.tasks.map(t => (
                                        <button key={t.id} onClick={() => handleNavigate('/tasks')}
                                            className="w-full text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-sm dark:text-white">
                                            {t.sub} <span className="text-xs text-slate-400">({t.cat})</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                            {results.visits.length > 0 && (
                                <div className="p-2 border-t dark:border-slate-700">
                                    <p className="text-xs font-medium text-slate-500 px-2 mb-1">📅 Visits</p>
                                    {results.visits.map(v => {
                                        const store = stores.find(s => s.id === v.store_id);
                                        return (
                                            <button key={v.id} onClick={() => handleNavigate('/visits')}
                                                className="w-full text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-sm dark:text-white">
                                                {store?.name} - {v.type}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </>
                    ) : (
                        <p className="p-4 text-center text-sm text-slate-500">No results found</p>
                    )}
                </div>
            )}
            {isOpen && <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />}
        </div>
    );
};

export default GlobalSearch;
