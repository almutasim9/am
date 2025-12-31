import React from 'react';
import useTranslation from '../../hooks/useTranslation';

const LoadingSpinner = ({ fullScreen = false, message }) => {
    const t = useTranslation();
    const content = (
        <div className="flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
            <p className="text-slate-600 dark:text-slate-400 font-medium">{message || t('loading')}</p>
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                {content}
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center py-12">
            {content}
        </div>
    );
};

export default LoadingSpinner;
