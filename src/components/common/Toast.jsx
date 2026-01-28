import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

const toastConfig = {
    success: {
        icon: CheckCircle,
        bg: 'bg-emerald-500',
        border: 'border-emerald-600',
        progress: 'bg-emerald-300',
        emoji: '✅'
    },
    error: {
        icon: XCircle,
        bg: 'bg-red-500',
        border: 'border-red-600',
        progress: 'bg-red-300',
        emoji: '❌'
    },
    warning: {
        icon: AlertCircle,
        bg: 'bg-amber-500',
        border: 'border-amber-600',
        progress: 'bg-amber-300',
        emoji: '⚠️'
    },
    info: {
        icon: Info,
        bg: 'bg-blue-500',
        border: 'border-blue-600',
        progress: 'bg-blue-300',
        emoji: 'ℹ️'
    }
};

const Toast = ({ message, type = 'info', onClose, duration = 4000 }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isLeaving, setIsLeaving] = useState(false);
    const config = toastConfig[type] || toastConfig.info;
    const Icon = config.icon;

    const handleClose = () => {
        setIsLeaving(true);
        setTimeout(onClose, 300);
    };

    useEffect(() => {
        // Animate in
        requestAnimationFrame(() => setIsVisible(true));

        // Auto close
        const timer = setTimeout(() => {
            handleClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration]);



    return (
        <div
            className={`fixed top-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm z-50 transition-all duration-300 ease-out ${isVisible && !isLeaving
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 -translate-y-4'
                }`}
        >
            <div className={`${config.bg} rounded-2xl shadow-2xl overflow-hidden border-2 ${config.border}`}>
                <div className="flex items-center gap-3 p-4 text-white">
                    {/* Icon */}
                    <div className="flex-shrink-0 p-1.5 bg-white/20 rounded-xl">
                        <Icon size={22} strokeWidth={2.5} />
                    </div>

                    {/* Message */}
                    <p className="flex-1 font-medium text-sm leading-relaxed">
                        {message}
                    </p>

                    {/* Close Button */}
                    <button
                        onClick={handleClose}
                        className="flex-shrink-0 p-1 hover:bg-white/20 rounded-lg transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Progress Bar */}
                <div className="h-1 bg-black/10">
                    <div
                        className={`h-full ${config.progress}`}
                        style={{
                            animation: `shrink ${duration}ms linear forwards`
                        }}
                    />
                </div>
            </div>

            {/* CSS Animation */}
            <style>{`
                @keyframes shrink {
                    from { width: 100%; }
                    to { width: 0%; }
                }
            `}</style>
        </div>
    );
};

export default Toast;

