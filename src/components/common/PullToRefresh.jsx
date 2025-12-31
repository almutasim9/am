import React, { useState, useRef, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';

const PullToRefresh = ({ onRefresh, children }) => {
    const [isPulling, setIsPulling] = useState(false);
    const [pullDistance, setPullDistance] = useState(0);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const containerRef = useRef(null);
    const startY = useRef(0);
    const threshold = 80;

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleTouchStart = (e) => {
            if (container.scrollTop === 0) {
                startY.current = e.touches[0].clientY;
                setIsPulling(true);
            }
        };

        const handleTouchMove = (e) => {
            if (!isPulling || isRefreshing) return;

            const currentY = e.touches[0].clientY;
            const diff = currentY - startY.current;

            if (diff > 0 && container.scrollTop === 0) {
                setPullDistance(Math.min(diff * 0.5, threshold * 1.5));
                if (diff > threshold) {
                    e.preventDefault();
                }
            }
        };

        const handleTouchEnd = async () => {
            if (pullDistance > threshold && !isRefreshing) {
                setIsRefreshing(true);
                try {
                    await onRefresh();
                } finally {
                    setIsRefreshing(false);
                }
            }
            setIsPulling(false);
            setPullDistance(0);
        };

        container.addEventListener('touchstart', handleTouchStart, { passive: true });
        container.addEventListener('touchmove', handleTouchMove, { passive: false });
        container.addEventListener('touchend', handleTouchEnd);

        return () => {
            container.removeEventListener('touchstart', handleTouchStart);
            container.removeEventListener('touchmove', handleTouchMove);
            container.removeEventListener('touchend', handleTouchEnd);
        };
    }, [isPulling, pullDistance, isRefreshing, onRefresh]);

    return (
        <div ref={containerRef} className="relative overflow-auto h-full">
            {/* Pull indicator */}
            <div
                className="absolute left-0 right-0 flex items-center justify-center transition-transform duration-200 z-10"
                style={{
                    transform: `translateY(${pullDistance - 50}px)`,
                    opacity: pullDistance / threshold
                }}
            >
                <div className={`p-3 bg-emerald-500 rounded-full shadow-lg ${isRefreshing ? 'animate-spin' : ''}`}>
                    <RefreshCw size={20} className="text-white" />
                </div>
            </div>

            {/* Content with pull offset */}
            <div
                style={{
                    transform: isRefreshing ? 'translateY(60px)' : `translateY(${pullDistance}px)`,
                    transition: isPulling ? 'none' : 'transform 0.2s ease-out'
                }}
            >
                {children}
            </div>
        </div>
    );
};

export default PullToRefresh;
