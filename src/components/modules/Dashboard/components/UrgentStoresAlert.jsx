import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Zap, CalendarPlus, Phone } from 'lucide-react';
import { getStoreHealth } from '../../../../utils/helpers';

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

const UrgentStoresAlert = ({ stores, onNewVisit }) => {
    const urgentStores = stores.filter(s => getStoreHealth(s.last_visit) === 'red');

    if (urgentStores.length === 0) return null;

    return (
        <motion.div variants={itemVariants} className="relative overflow-hidden rounded-3xl p-[1px] bg-gradient-to-r from-red-200 to-orange-200 dark:from-red-900/50 dark:to-orange-900/50">
            <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-[23px] p-5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />

                <div className="flex items-center justify-between mb-4 relative z-10">
                    <h3 className="font-bold text-red-700 dark:text-red-400 flex items-center gap-2 text-lg">
                        <div className="p-1.5 bg-red-100 dark:bg-red-900/40 rounded-lg animate-pulse">
                            <Zap size={18} />
                        </div>
                        Stores Need Visit
                    </h3>
                    <Link to="/stores" className="text-sm font-semibold text-red-600 hover:text-red-700 hover:underline">
                        View All
                    </Link>
                </div>
                <div className="space-y-3 relative z-10">
                    {urgentStores.slice(0, 3).map(store => {
                        const days = store.last_visit
                            ? Math.floor((Date.now() - new Date(store.last_visit).getTime()) / (1000 * 60 * 60 * 24))
                            : null;
                        return (
                            <div key={store.id} className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-2xl border border-red-100 dark:border-red-900/30 hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-600 dark:text-red-400 font-bold text-sm border border-red-100 dark:border-red-900/30">
                                        {store.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-bold dark:text-white text-sm">{store.name}</p>
                                        <p className="text-xs text-red-500 font-medium">{days !== null ? `${days} days ago` : 'Never visited'}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => onNewVisit(store.id)}
                                        className="p-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all shadow-sm shadow-primary-500/20 active:scale-95"
                                        aria-label={`Schedule visit for ${store.name}`}
                                    >
                                        <CalendarPlus size={18} />
                                    </button>
                                    <button
                                        onClick={() => window.open(`tel:${store.phone}`)}
                                        className="p-2.5 bg-secondary-600 text-white rounded-xl hover:bg-secondary-700 transition-all shadow-sm shadow-secondary-500/20 active:scale-95"
                                        aria-label={`Call ${store.name}`}
                                    >
                                        <Phone size={18} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </motion.div>
    );
};

export default UrgentStoresAlert;
