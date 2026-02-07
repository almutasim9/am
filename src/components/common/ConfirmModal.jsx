import React from 'react';
import { AlertCircle } from 'lucide-react';
import useTranslation from '../../hooks/useTranslation';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message }) => {
    const t = useTranslation();
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md transition-all duration-300" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden transform transition-all animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                <div className="p-8 text-center">
                    <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-white dark:border-slate-700 shadow-sm">
                        <AlertCircle size={40} className="text-red-500" />
                    </div>
                    <h2 className="text-2xl font-bold dark:text-white mb-2">{title}</h2>
                    <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">{message}</p>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={onClose}
                            className="py-3.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-all font-bold active:scale-95"
                        >
                            {t('cancel')}
                        </button>
                        <button
                            onClick={onConfirm}
                            className="py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-2xl transition-all font-bold shadow-lg shadow-red-500/20 active:scale-95"
                        >
                            {t('confirm')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
