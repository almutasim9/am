import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children }) => {
    const modalRef = useRef(null);
    const closeButtonRef = useRef(null);

    // Handle Escape key to close modal
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            // Focus close button when modal opens
            setTimeout(() => closeButtonRef.current?.focus(), 100);
            // Prevent body scroll when modal is open
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            <div
                ref={modalRef}
                className="bg-white dark:bg-slate-800 rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-lg sm:mx-4 max-h-[95vh] sm:max-h-[90vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-4 border-b dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800 z-10">
                    <h2 id="modal-title" className="text-lg sm:text-xl font-bold dark:text-white">{title}</h2>
                    <button
                        ref={closeButtonRef}
                        onClick={onClose}
                        aria-label="Close modal"
                        className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg min-w-[44px] min-h-[44px] flex items-center justify-center active:bg-slate-200 dark:active:bg-slate-600 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    >
                        <X size={22} aria-hidden="true" />
                    </button>
                </div>
                <div className="p-4 pb-8 sm:pb-4">{children}</div>
            </div>
        </div>
    );
};

export default Modal;
