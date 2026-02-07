import React from 'react';
import { motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

const DashboardHeader = ({ greeting, user, isRefreshing, onRefresh }) => {
    return (
        <motion.div variants={itemVariants} className="flex items-center justify-between">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold dark:text-white font-sans tracking-tight">
                    {greeting} <span className="text-yellow-400 inline-block animate-wave">👋</span>
                </h1>
                <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">
                    Welcome back, <span className="text-primary-600 dark:text-primary-400 font-bold">{user?.user?.username || user?.username || 'User'}</span>
                </p>
            </div>
            <button
                onClick={onRefresh}
                disabled={isRefreshing}
                className="p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm hover:shadow-lg hover:shadow-primary-500/10 transition-all disabled:opacity-50 border border-slate-100 dark:border-slate-700"
                aria-label="Refresh data"
            >
                <RefreshCw size={20} className={`text-primary-600 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
        </motion.div>
    );
};

export default DashboardHeader;
