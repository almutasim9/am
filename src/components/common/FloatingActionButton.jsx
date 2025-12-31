import React, { useState, useContext } from 'react';
import { Plus, Calendar, CheckSquare, X } from 'lucide-react';
import useTranslation from '../../hooks/useTranslation';
import { LangContext } from '../../contexts/AppContext';

const FloatingActionButton = ({ onNewVisit, onNewTask }) => {
    const t = useTranslation();
    const { lang } = useContext(LangContext);
    const [isOpen, setIsOpen] = useState(false);

    // RTL-aware positioning: 
    // Arabic: Sidebar on RIGHT, so FAB on LEFT
    // English: Sidebar on LEFT, so FAB on RIGHT
    const isRTL = lang === 'ar';

    return (
        <div className={`fixed bottom-6 z-50 flex flex-col-reverse gap-3 pointer-events-none ${isRTL ? 'left-6 items-start' : 'right-6 items-end'}`}>
            {/* Main Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`pointer-events-auto p-4 rounded-full shadow-lg text-white transition-all duration-300 ${isOpen ? 'bg-red-500 rotate-90' : 'bg-emerald-600 hover:bg-emerald-700'}`}
            >
                {isOpen ? <X size={24} /> : <Plus size={24} />}
            </button>

            {/* Actions Menu */}
            <div className={`flex flex-col gap-3 transition-all duration-300 ${isOpen ? 'translate-y-0 opacity-100 pointer-events-auto' : 'translate-y-10 opacity-0 pointer-events-none'}`}>

                {/* New Task */}
                <button
                    onClick={() => { onNewTask(); setIsOpen(false); }}
                    className={`flex items-center gap-3 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-full shadow-md hover:shadow-lg transition-transform ${isRTL ? 'hover:translate-x-1 flex-row-reverse' : 'hover:-translate-x-1'}`}
                >
                    <span className="text-sm font-medium">{t('newTask')}</span>
                    <div className="p-2 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-full">
                        <CheckSquare size={20} />
                    </div>
                </button>

                {/* New Visit */}
                <button
                    onClick={() => { onNewVisit(); setIsOpen(false); }}
                    className={`flex items-center gap-3 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-full shadow-md hover:shadow-lg transition-transform ${isRTL ? 'hover:translate-x-1 flex-row-reverse' : 'hover:-translate-x-1'}`}
                >
                    <span className="text-sm font-medium">{t('newVisit')}</span>
                    <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full">
                        <Calendar size={20} />
                    </div>
                </button>
            </div>
        </div>
    );
};

export default FloatingActionButton;
