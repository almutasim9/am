import React, { useState, useRef } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { Trash2, Check, Edit2 } from 'lucide-react';

/**
 * SwipeableRow - مكون قابل للسحب لإجراءات سريعة على الموبايل
 * 
 * الإجراءات:
 * - سحب لليسار: حذف (أحمر)
 * - سحب لليمين: إكمال/تعديل (أخضر)
 */
const SwipeableRow = ({
    children,
    onSwipeLeft,
    onSwipeRight,
    leftAction = 'delete',
    rightAction = 'complete',
    leftLabel = 'حذف',
    rightLabel = 'إكمال',
    threshold = 100,
    disabled = false
}) => {
    const [isSwipingLeft, setIsSwipingLeft] = useState(false);
    const [isSwipingRight, setIsSwipingRight] = useState(false);
    const constraintsRef = useRef(null);

    const x = useMotionValue(0);

    // تحويل الموضع إلى شفافية وحجم للأيقونات
    const leftOpacity = useTransform(x, [-threshold, -threshold / 2, 0], [1, 0.5, 0]);
    const rightOpacity = useTransform(x, [0, threshold / 2, threshold], [0, 0.5, 1]);
    const leftScale = useTransform(x, [-threshold, -threshold / 2, 0], [1, 0.8, 0.5]);
    const rightScale = useTransform(x, [0, threshold / 2, threshold], [0.5, 0.8, 1]);

    const handleDragEnd = (event, info) => {
        const offset = info.offset.x;
        const velocity = info.velocity.x;

        // حساب ما إذا كان السحب كافياً لتنفيذ الإجراء
        const shouldTrigger = Math.abs(offset) > threshold || Math.abs(velocity) > 500;

        if (shouldTrigger) {
            if (offset < 0 && onSwipeLeft) {
                setIsSwipingLeft(true);
                setTimeout(() => {
                    onSwipeLeft();
                    setIsSwipingLeft(false);
                }, 200);
            } else if (offset > 0 && onSwipeRight) {
                setIsSwipingRight(true);
                setTimeout(() => {
                    onSwipeRight();
                    setIsSwipingRight(false);
                }, 200);
            }
        }
    };

    const getLeftIcon = () => {
        switch (leftAction) {
            case 'delete':
                return <Trash2 size={20} />;
            case 'edit':
                return <Edit2 size={20} />;
            default:
                return <Trash2 size={20} />;
        }
    };

    const getRightIcon = () => {
        switch (rightAction) {
            case 'complete':
                return <Check size={20} />;
            case 'edit':
                return <Edit2 size={20} />;
            default:
                return <Check size={20} />;
        }
    };

    const getLeftColor = () => {
        switch (leftAction) {
            case 'delete':
                return 'bg-red-500';
            case 'edit':
                return 'bg-blue-500';
            default:
                return 'bg-red-500';
        }
    };

    const getRightColor = () => {
        switch (rightAction) {
            case 'complete':
                return 'bg-emerald-500';
            case 'edit':
                return 'bg-blue-500';
            default:
                return 'bg-emerald-500';
        }
    };

    if (disabled) {
        return <div>{children}</div>;
    }

    return (
        <div
            ref={constraintsRef}
            className="relative overflow-hidden rounded-xl touch-pan-y"
        >
            {/* خلفية الإجراء الأيسر (حذف) */}
            <motion.div
                className={`absolute inset-y-0 left-0 w-full ${getLeftColor()} flex items-center justify-end px-6`}
                style={{ opacity: leftOpacity }}
            >
                <motion.div
                    className="flex items-center gap-2 text-white font-medium"
                    style={{ scale: leftScale }}
                >
                    {getLeftIcon()}
                    <span className="text-sm">{leftLabel}</span>
                </motion.div>
            </motion.div>

            {/* خلفية الإجراء الأيمن (إكمال) */}
            <motion.div
                className={`absolute inset-y-0 right-0 w-full ${getRightColor()} flex items-center justify-start px-6`}
                style={{ opacity: rightOpacity }}
            >
                <motion.div
                    className="flex items-center gap-2 text-white font-medium"
                    style={{ scale: rightScale }}
                >
                    <span className="text-sm">{rightLabel}</span>
                    {getRightIcon()}
                </motion.div>
            </motion.div>

            {/* المحتوى القابل للسحب */}
            <motion.div
                drag="x"
                dragConstraints={constraintsRef}
                dragElastic={0.1}
                onDragEnd={handleDragEnd}
                style={{ x }}
                whileDrag={{ cursor: 'grabbing' }}
                className={`relative z-10 bg-white dark:bg-slate-800 ${isSwipingLeft ? 'translate-x-[-100%] opacity-0' : ''
                    } ${isSwipingRight ? 'translate-x-[100%] opacity-0' : ''
                    } transition-all duration-200`}
            >
                {children}
            </motion.div>
        </div>
    );
};

/**
 * SwipeableList - قائمة من العناصر القابلة للسحب
 */
export const SwipeableList = ({ children, className = '' }) => {
    return (
        <div className={`space-y-2 ${className}`}>
            {children}
        </div>
    );
};

/**
 * useSwipeGesture - Hook للتعامل مع إيماءات السحب
 */
export const useSwipeGesture = (options = {}) => {
    const {
        onSwipeLeft,
        onSwipeRight,
        threshold = 50
    } = options;

    const touchStart = useRef({ x: 0, y: 0 });
    const touchEnd = useRef({ x: 0, y: 0 });

    const handleTouchStart = (e) => {
        touchStart.current = {
            x: e.touches[0].clientX,
            y: e.touches[0].clientY
        };
    };

    const handleTouchMove = (e) => {
        touchEnd.current = {
            x: e.touches[0].clientX,
            y: e.touches[0].clientY
        };
    };

    const handleTouchEnd = () => {
        const diffX = touchStart.current.x - touchEnd.current.x;
        const diffY = touchStart.current.y - touchEnd.current.y;

        // تأكد من أن السحب أفقي وليس عمودي
        if (Math.abs(diffX) > Math.abs(diffY)) {
            if (diffX > threshold) {
                onSwipeLeft?.();
            } else if (diffX < -threshold) {
                onSwipeRight?.();
            }
        }
    };

    return {
        onTouchStart: handleTouchStart,
        onTouchMove: handleTouchMove,
        onTouchEnd: handleTouchEnd
    };
};

export default SwipeableRow;
