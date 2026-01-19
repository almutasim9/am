import React from 'react';

// Skeleton Base Component
const SkeletonPulse = ({ className = '' }) => (
    <div className={`animate-pulse bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 bg-[length:200%_100%] rounded ${className}`}
        style={{ animation: 'shimmer 1.5s infinite linear' }} />
);

// Card Skeleton
export const CardSkeleton = ({ hasImage = false }) => (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden">
        {hasImage && <SkeletonPulse className="h-40 w-full rounded-none" />}
        <div className="p-5 space-y-4">
            <SkeletonPulse className="h-6 w-3/4" />
            <SkeletonPulse className="h-4 w-1/2" />
            <div className="flex gap-2">
                <SkeletonPulse className="h-8 w-20" />
                <SkeletonPulse className="h-8 w-20" />
            </div>
        </div>
    </div>
);

// Store Card Skeleton
export const StoreCardSkeleton = () => (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md overflow-hidden">
        <SkeletonPulse className="h-1.5 w-full rounded-none" />
        <div className="p-5 space-y-4">
            <div className="flex justify-between">
                <div className="space-y-2 flex-1">
                    <SkeletonPulse className="h-5 w-3/4" />
                    <SkeletonPulse className="h-4 w-1/2" />
                </div>
                <SkeletonPulse className="h-6 w-16 rounded-full" />
            </div>
            <div className="grid grid-cols-2 gap-2">
                <SkeletonPulse className="h-16 rounded-xl" />
                <SkeletonPulse className="h-16 rounded-xl" />
            </div>
            <div className="flex gap-2 pt-3 border-t dark:border-slate-700">
                <SkeletonPulse className="h-10 w-10 rounded-xl" />
                <SkeletonPulse className="h-10 flex-1 rounded-xl" />
                <SkeletonPulse className="h-10 w-10 rounded-xl" />
            </div>
        </div>
    </div>
);

// Task Card Skeleton
export const TaskCardSkeleton = () => (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border-l-4 border-slate-300 dark:border-slate-600">
        <div className="flex justify-between items-start mb-3">
            <SkeletonPulse className="h-5 w-3/4" />
            <SkeletonPulse className="h-5 w-16 rounded-full" />
        </div>
        <SkeletonPulse className="h-4 w-1/2 mb-3" />
        <div className="flex justify-between items-center">
            <SkeletonPulse className="h-4 w-24" />
            <SkeletonPulse className="h-8 w-8 rounded-lg" />
        </div>
    </div>
);

// Visit Card Skeleton
export const VisitCardSkeleton = () => (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm">
        <div className="flex gap-4">
            <SkeletonPulse className="w-14 h-14 rounded-xl flex-shrink-0" />
            <div className="flex-1 space-y-2">
                <SkeletonPulse className="h-5 w-3/4" />
                <SkeletonPulse className="h-4 w-1/2" />
                <div className="flex gap-2">
                    <SkeletonPulse className="h-6 w-16 rounded-full" />
                    <SkeletonPulse className="h-6 w-20 rounded-full" />
                </div>
            </div>
        </div>
    </div>
);

// Stats Card Skeleton
export const StatsCardSkeleton = () => (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
            <SkeletonPulse className="h-10 w-10 rounded-xl" />
            <SkeletonPulse className="h-6 w-16 rounded-full" />
        </div>
        <SkeletonPulse className="h-8 w-24 mb-2" />
        <SkeletonPulse className="h-4 w-32" />
    </div>
);

// Dashboard Stats Grid Skeleton
export const DashboardStatsSkeleton = () => (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array(4).fill(0).map((_, i) => <StatsCardSkeleton key={i} />)}
    </div>
);

// Grid Skeleton
export const GridSkeleton = ({ count = 6, CardComponent = StoreCardSkeleton }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array(count).fill(0).map((_, i) => <CardComponent key={i} />)}
    </div>
);

// CSS for shimmer animation
const shimmerKeyframes = `
@keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
}
`;

if (typeof document !== 'undefined' && !document.getElementById('skeleton-styles')) {
    const style = document.createElement('style');
    style.id = 'skeleton-styles';
    style.textContent = shimmerKeyframes;
    document.head.appendChild(style);
}

export default SkeletonPulse;
