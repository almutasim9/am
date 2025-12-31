import React from 'react';
import { Package, FileText, Calendar, Store } from 'lucide-react';

const illustrations = {
    stores: Store,
    tasks: FileText,
    visits: Calendar,
    default: Package,
};

const EmptyState = ({
    type = 'default',
    title,
    description,
    action,
    actionLabel,
    icon: CustomIcon,
}) => {
    const Icon = CustomIcon || illustrations[type] || illustrations.default;

    return (
        <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-24 h-24 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-purple-900/30 rounded-3xl flex items-center justify-center mb-6 animate-pulse">
                <Icon size={40} className="text-emerald-500 dark:text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200 mb-2 text-center">
                {title || 'No data available'}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-center max-w-sm mb-6">
                {description || 'Start by adding new items to see them here'}
            </p>
            {action && (
                <button
                    onClick={action}
                    className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-purple-600 hover:from-emerald-700 hover:to-purple-700 text-white font-medium rounded-xl transition-all duration-300 shadow-lg hover:shadow-emerald-500/30"
                >
                    {actionLabel || 'Add New'}
                </button>
            )}
        </div>
    );
};

export default EmptyState;
