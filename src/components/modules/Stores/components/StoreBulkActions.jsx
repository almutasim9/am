import React from 'react';
import { Trash2 } from 'lucide-react';

const StoreBulkActions = ({
    selectedCount,
    totalFiltered,
    onSelectAll,
    onDelete,
    onCancel
}) => {
    return (
        <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-top-2">
            <button
                onClick={onSelectAll}
                className="flex items-center gap-2 px-4 py-2 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-xl border border-primary-100 dark:border-primary-800 transition-colors"
            >
                Select All ({totalFiltered})
            </button>
            <button
                onClick={onDelete}
                disabled={selectedCount === 0}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-lg shadow-red-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
                <Trash2 size={18} />
                Delete ({selectedCount})
            </button>
            <button
                onClick={onCancel}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-200 transition-colors border border-slate-200 dark:border-slate-600"
            >
                Cancel
            </button>
        </div>
    );
};

export default StoreBulkActions;
