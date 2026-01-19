import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children, size = 'default' }) => {
    const modalRef = useRef(null);
    const closeButtonRef = useRef(null);
    const [isAnimating, setIsAnimating] = useState(false);
    const [showContent, setShowContent] = useState(false);

    // Size classes
    const sizeClasses = {
        small: 'sm:max-w-sm',
        default: 'sm:max-w-lg',
        large: 'sm:max-w-2xl',
        full: 'sm:max-w-4xl'
    };

    // Handle open/close animation
    useEffect(() => {
        if (isOpen) {
            setIsAnimating(true);
            requestAnimationFrame(() => setShowContent(true));
            document.body.style.overflow = 'hidden';
            setTimeout(() => closeButtonRef.current?.focus(), 100);
        } else {
            setShowContent(false);
            const timer = setTimeout(() => setIsAnimating(false), 300);
            document.body.style.overflow = '';
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    // Handle Escape key
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isOpen) onClose();
        };
        if (isOpen) document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isAnimating && !isOpen) return null;

    return (
        <div
            className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center transition-all duration-300 ${showContent ? 'bg-black/60 backdrop-blur-sm' : 'bg-transparent'
                }`}
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            <div
                ref={modalRef}
                className={`bg-white dark:bg-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl w-full ${sizeClasses[size]} sm:mx-4 max-h-[95vh] sm:max-h-[85vh] overflow-hidden flex flex-col transition-all duration-300 transform ${showContent
                        ? 'translate-y-0 opacity-100 scale-100'
                        : 'translate-y-8 sm:translate-y-4 opacity-0 scale-95'
                    }`}
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b dark:border-slate-700 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-800">
                    {/* Drag indicator for mobile */}
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1.5 bg-slate-300 dark:bg-slate-600 rounded-full sm:hidden" />

                    <h2 id="modal-title" className="text-xl font-bold dark:text-white flex items-center gap-2">
                        {title}
                    </h2>
                    <button
                        ref={closeButtonRef}
                        onClick={onClose}
                        aria-label="Close modal"
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl min-w-[40px] min-h-[40px] flex items-center justify-center transition-colors focus:ring-2 focus:ring-emerald-500 focus:outline-none active:scale-95"
                    >
                        <X size={20} className="text-slate-500" aria-hidden="true" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-5 pb-8 sm:pb-5">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;

