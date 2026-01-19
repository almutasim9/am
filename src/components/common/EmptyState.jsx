import React from 'react';
import { Package, FileText, Calendar, Store, Map, Settings, BarChart3, Menu, Archive, Search } from 'lucide-react';

const illustrations = {
    stores: { icon: Store, color: 'emerald', emoji: '🏪' },
    tasks: { icon: FileText, color: 'amber', emoji: '📋' },
    visits: { icon: Calendar, color: 'blue', emoji: '📅' },
    map: { icon: Map, color: 'teal', emoji: '🗺️' },
    settings: { icon: Settings, color: 'slate', emoji: '⚙️' },
    analytics: { icon: BarChart3, color: 'purple', emoji: '📊' },
    menu: { icon: Menu, color: 'orange', emoji: '🍽️' },
    archive: { icon: Archive, color: 'gray', emoji: '📦' },
    search: { icon: Search, color: 'indigo', emoji: '🔍' },
    default: { icon: Package, color: 'emerald', emoji: '📦' },
};

const colorClasses = {
    emerald: 'from-emerald-100 to-emerald-200 dark:from-emerald-900/40 dark:to-emerald-800/30 text-emerald-600 dark:text-emerald-400',
    amber: 'from-amber-100 to-amber-200 dark:from-amber-900/40 dark:to-amber-800/30 text-amber-600 dark:text-amber-400',
    blue: 'from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/30 text-blue-600 dark:text-blue-400',
    teal: 'from-teal-100 to-teal-200 dark:from-teal-900/40 dark:to-teal-800/30 text-teal-600 dark:text-teal-400',
    purple: 'from-purple-100 to-purple-200 dark:from-purple-900/40 dark:to-purple-800/30 text-purple-600 dark:text-purple-400',
    orange: 'from-orange-100 to-orange-200 dark:from-orange-900/40 dark:to-orange-800/30 text-orange-600 dark:text-orange-400',
    slate: 'from-slate-100 to-slate-200 dark:from-slate-800/40 dark:to-slate-700/30 text-slate-600 dark:text-slate-400',
    gray: 'from-gray-100 to-gray-200 dark:from-gray-800/40 dark:to-gray-700/30 text-gray-600 dark:text-gray-400',
    indigo: 'from-indigo-100 to-indigo-200 dark:from-indigo-900/40 dark:to-indigo-800/30 text-indigo-600 dark:text-indigo-400',
};

const EmptyState = ({
    type = 'default',
    title,
    description,
    action,
    actionLabel,
    icon: CustomIcon,
    compact = false,
}) => {
    const config = illustrations[type] || illustrations.default;
    const Icon = CustomIcon || config.icon;
    const colorClass = colorClasses[config.color] || colorClasses.emerald;

    if (compact) {
        return (
            <div className="flex flex-col items-center justify-center py-8 px-4">
                <div className="text-4xl mb-3">{config.emoji}</div>
                <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
                    {description || 'لا توجد بيانات'}
                </p>
                {action && (
                    <button onClick={action} className="mt-3 text-sm text-emerald-600 hover:underline">
                        {actionLabel || 'إضافة جديد'}
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center py-16 px-4">
            {/* Animated Icon Container */}
            <div className="relative mb-8">
                {/* Background Glow */}
                <div className={`absolute inset-0 bg-gradient-to-br ${colorClass} rounded-3xl blur-xl opacity-50 animate-pulse`} />

                {/* Icon Box */}
                <div className={`relative w-28 h-28 bg-gradient-to-br ${colorClass} rounded-3xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-300`}>
                    <Icon size={48} strokeWidth={1.5} />
                </div>

                {/* Floating Emoji */}
                <div className="absolute -top-2 -right-2 text-3xl animate-bounce">
                    {config.emoji}
                </div>
            </div>

            {/* Title */}
            <h3 className="text-2xl font-bold text-slate-700 dark:text-slate-200 mb-3 text-center">
                {title || 'لا توجد بيانات'}
            </h3>

            {/* Description */}
            <p className="text-slate-500 dark:text-slate-400 text-center max-w-md mb-8 leading-relaxed">
                {description || 'ابدأ بإضافة عناصر جديدة لرؤيتها هنا'}
            </p>

            {/* Action Button */}
            {action && (
                <button
                    onClick={action}
                    className="group px-8 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold rounded-2xl transition-all duration-300 shadow-lg hover:shadow-emerald-500/40 hover:-translate-y-1 flex items-center gap-2"
                >
                    <span className="text-xl group-hover:scale-110 transition-transform">+</span>
                    {actionLabel || 'إضافة جديد'}
                </button>
            )}

            {/* Decorative Dots */}
            <div className="flex gap-2 mt-8 opacity-30">
                <div className="w-2 h-2 rounded-full bg-slate-400 animate-pulse" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-slate-400 animate-pulse" style={{ animationDelay: '200ms' }} />
                <div className="w-2 h-2 rounded-full bg-slate-400 animate-pulse" style={{ animationDelay: '400ms' }} />
            </div>
        </div>
    );
};

export default EmptyState;

