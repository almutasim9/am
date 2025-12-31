import React from 'react';

// Base skeleton component
const SkeletonBase = ({ className = '', animate = true }) => (
    <div className={`bg-slate-200/70 dark:bg-slate-700/50 backdrop-blur-sm rounded ${animate ? 'animate-pulse' : ''} ${className}`} />
);

// Text line skeleton
export const SkeletonText = ({ width = 'w-full', height = 'h-4' }) => (
    <SkeletonBase className={`${width} ${height}`} />
);

// Circle skeleton (for avatars)
export const SkeletonCircle = ({ size = 'w-10 h-10' }) => (
    <SkeletonBase className={`${size} rounded-full`} />
);

// Card skeleton
export const SkeletonCard = () => (
    <div className="glass-card p-6 rounded-3xl">
        <div className="flex items-center gap-4 mb-4">
            <SkeletonCircle />
            <div className="flex-1 space-y-2">
                <SkeletonText width="w-3/4" />
                <SkeletonText width="w-1/2" height="h-3" />
            </div>
        </div>
        <div className="space-y-3">
            <SkeletonText />
            <SkeletonText width="w-5/6" />
            <SkeletonText width="w-4/6" />
        </div>
    </div>
);

// Store card skeleton
export const SkeletonStoreCard = () => (
    <div className="glass-card rounded-3xl overflow-hidden">
        <SkeletonBase className="h-2 w-full" animate={false} />
        <div className="p-5 space-y-4">
            <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                    <SkeletonText width="w-3/4" height="h-5" />
                    <SkeletonText width="w-1/2" height="h-3" />
                </div>
                <SkeletonBase className="w-16 h-6 rounded-lg" />
            </div>
            <div className="flex gap-2">
                <SkeletonBase className="w-20 h-8 rounded-lg" />
                <SkeletonBase className="w-20 h-8 rounded-lg" />
                <SkeletonBase className="w-20 h-8 rounded-lg" />
            </div>
        </div>
    </div>
);

// Task card skeleton
export const SkeletonTaskCard = () => (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-lg">
        <div className="flex items-center gap-3 mb-3">
            <SkeletonBase className="w-1 h-12 rounded-full" />
            <div className="flex-1 space-y-2">
                <SkeletonText width="w-4/5" height="h-4" />
                <SkeletonText width="w-2/3" height="h-3" />
            </div>
        </div>
        <div className="flex justify-between items-center">
            <SkeletonText width="w-24" height="h-5" />
            <SkeletonBase className="w-16 h-6 rounded-lg" />
        </div>
    </div>
);

// Stats card skeleton
export const SkeletonStats = () => (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
            <div key={i} className="bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 rounded-2xl p-6 animate-pulse">
                <SkeletonBase className="w-8 h-8 rounded-lg mb-2" animate={false} />
                <SkeletonBase className="w-16 h-8 mb-1" animate={false} />
                <SkeletonBase className="w-24 h-4" animate={false} />
            </div>
        ))}
    </div>
);

// Table row skeleton
export const SkeletonTableRow = () => (
    <div className="flex items-center gap-4 p-4 border-b dark:border-slate-700">
        <SkeletonCircle size="w-8 h-8" />
        <SkeletonText width="w-1/4" />
        <SkeletonText width="w-1/5" />
        <SkeletonText width="w-1/6" />
        <SkeletonBase className="w-20 h-6 rounded-lg" />
    </div>
);

// Generic list skeleton
export const SkeletonList = ({ count = 5, ItemComponent = SkeletonCard }) => (
    <div className="space-y-4">
        {Array.from({ length: count }).map((_, i) => (
            <ItemComponent key={i} />
        ))}
    </div>
);

// Grid skeleton
export const SkeletonGrid = ({ count = 6, ItemComponent = SkeletonStoreCard, cols = 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' }) => (
    <div className={`grid ${cols} gap-4`}>
        {Array.from({ length: count }).map((_, i) => (
            <ItemComponent key={i} />
        ))}
    </div>
);

export default SkeletonBase;
