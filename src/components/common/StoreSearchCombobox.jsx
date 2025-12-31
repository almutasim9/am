import React, { useState, useRef, useEffect } from 'react';
import { Search, Store, X } from 'lucide-react';

/**
 * Autocomplete search combobox for selecting stores
 * Supports search by name, ID, or owner
 */
const StoreSearchCombobox = ({ stores, value, onChange, error, disabled }) => {
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [highlightIndex, setHighlightIndex] = useState(0);
    const inputRef = useRef(null);
    const listRef = useRef(null);

    // Find selected store
    const selectedStore = stores.find(s => s.id === value);

    // Filter stores based on query (name, ID, or owner)
    const filtered = query.length >= 1
        ? stores.filter(s =>
            s.name?.toLowerCase().includes(query.toLowerCase()) ||
            s.id?.toLowerCase().includes(query.toLowerCase()) ||
            s.owner?.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 10) // Limit to 10 results
        : stores.slice(0, 10);

    // Handle keyboard navigation
    const handleKeyDown = (e) => {
        if (!isOpen) {
            if (e.key === 'ArrowDown' || e.key === 'Enter') {
                setIsOpen(true);
            }
            return;
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setHighlightIndex(i => Math.min(i + 1, filtered.length - 1));
                break;
            case 'ArrowUp':
                e.preventDefault();
                setHighlightIndex(i => Math.max(i - 1, 0));
                break;
            case 'Enter':
                e.preventDefault();
                if (filtered[highlightIndex]) {
                    handleSelect(filtered[highlightIndex]);
                }
                break;
            case 'Escape':
                setIsOpen(false);
                break;
        }
    };

    // Handle store selection
    const handleSelect = (store) => {
        onChange(store.id);
        setQuery('');
        setIsOpen(false);
        inputRef.current?.blur();
    };

    // Clear selection
    const handleClear = () => {
        onChange('');
        setQuery('');
        inputRef.current?.focus();
    };

    // Scroll highlighted item into view
    useEffect(() => {
        if (listRef.current && isOpen) {
            const item = listRef.current.children[highlightIndex];
            item?.scrollIntoView({ block: 'nearest' });
        }
    }, [highlightIndex, isOpen]);

    // Reset highlight when query changes
    useEffect(() => {
        setHighlightIndex(0);
    }, [query]);

    return (
        <div className="relative">
            {/* Selected Store Display */}
            {selectedStore && !isOpen ? (
                <div
                    className={`flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-900/20 border rounded-xl cursor-pointer ${error ? 'border-red-500' : 'border-emerald-200 dark:border-emerald-800'}`}
                    onClick={() => { setIsOpen(true); inputRef.current?.focus(); }}
                >
                    <div className="flex items-center gap-3">
                        <Store size={18} className="text-emerald-600 dark:text-emerald-400" />
                        <div>
                            <p className="font-medium text-slate-800 dark:text-white">{selectedStore.name}</p>
                            <p className="text-xs text-slate-500">{selectedStore.id} • {selectedStore.owner}</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleClear(); }}
                        className="p-1 hover:bg-emerald-100 dark:hover:bg-emerald-800 rounded-full"
                    >
                        <X size={16} className="text-slate-400" />
                    </button>
                </div>
            ) : (
                <>
                    {/* Search Input */}
                    <div className="relative">
                        <Search size={18} className="absolute top-1/2 -translate-y-1/2 start-3 text-slate-400" />
                        <input
                            ref={inputRef}
                            type="text"
                            value={query}
                            onChange={(e) => { setQuery(e.target.value); setIsOpen(true); }}
                            onFocus={() => setIsOpen(true)}
                            onBlur={() => setTimeout(() => setIsOpen(false), 200)}
                            onKeyDown={handleKeyDown}
                            placeholder="Search by name, ID, or owner..."
                            disabled={disabled}
                            className={`w-full ps-10 pe-4 py-3 border rounded-xl dark:bg-slate-700 dark:border-slate-600 dark:text-white ${error ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : ''}`}
                        />
                    </div>

                    {/* Dropdown List */}
                    {isOpen && filtered.length > 0 && (
                        <ul
                            ref={listRef}
                            className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-xl shadow-xl max-h-60 overflow-auto"
                        >
                            {filtered.map((store, index) => (
                                <li
                                    key={store.id}
                                    onClick={() => handleSelect(store)}
                                    className={`flex items-center gap-3 p-3 cursor-pointer transition-colors ${index === highlightIndex
                                        ? 'bg-emerald-50 dark:bg-emerald-900/30'
                                        : 'hover:bg-slate-50 dark:hover:bg-slate-700'
                                        }`}
                                >
                                    <Store size={16} className="text-slate-400" />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-slate-800 dark:text-white truncate">{store.name}</p>
                                        <p className="text-xs text-slate-500 truncate">
                                            <span className="font-mono">{store.id}</span> • {store.owner}
                                        </p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}

                    {/* No Results */}
                    {isOpen && query.length >= 1 && filtered.length === 0 && (
                        <div className="absolute z-50 w-full mt-1 p-4 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-xl shadow-xl text-center text-slate-500">
                            No results found
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default StoreSearchCombobox;
