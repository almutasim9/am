import React from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

const PWAUpdatePrompt = () => {
    const {
        needRefresh: [needRefresh, setNeedRefresh],
        updateServiceWorker,
    } = useRegisterSW({
        onRegistered(r) {
            console.log('SW Registered:', r);
        },
        onRegisterError(error) {
            console.log('SW registration error', error);
        },
    });

    const close = () => {
        setNeedRefresh(false);
    };

    return (
        <>
            {needRefresh && (
                <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-6 py-3 rounded-2xl shadow-xl flex items-center gap-4 animate-bounce">
                    <span className="text-sm">New update available!</span>
                    <button
                        onClick={() => updateServiceWorker(true)}
                        className="px-4 py-1.5 bg-white text-emerald-600 rounded-lg text-sm font-medium hover:bg-emerald-50 transition-colors"
                    >
                        Update Now
                    </button>
                    <button
                        onClick={close}
                        className="text-white/70 hover:text-white"
                    >
                        ✕
                    </button>
                </div>
            )}
        </>
    );
};

export default PWAUpdatePrompt;
