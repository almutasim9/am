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
                <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-primary-600 text-white px-6 py-3 rounded-2xl shadow-xl flex items-center gap-4 animate-bounce">
                    <div className="flex flex-col">
                        <p className="font-bold text-sm">Update Available!</p>
                        <p className="text-[10px] opacity-80">New version is ready to install</p>
                    </div>
                    <button
                        onClick={updateServiceWorker}
                        className="px-4 py-1.5 bg-white text-primary-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
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
