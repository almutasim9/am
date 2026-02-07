import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Store, AlertCircle, CheckSquare } from 'lucide-react';

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

const ModuleStatCards = ({ storesCount, urgentStoresCount, pendingTasksCount }) => {
    return (
        <motion.div variants={itemVariants} className="grid grid-cols-3 gap-3 sm:gap-4">
            <Link to="/stores" className="glass-card p-4 rounded-2xl hover:bg-primary-50/50 dark:hover:bg-primary-900/10 transition-all text-center group border border-transparent hover:border-primary-200 dark:hover:border-primary-800">
                <Store size={24} className="mx-auto mb-2 text-primary-600 group-hover:scale-110 transition-transform" />
                <p className="text-2xl font-bold dark:text-white group-hover:text-primary-700 transition-colors">{storesCount}</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Stores</p>
            </Link>
            <Link to="/stores" className="glass-card p-4 rounded-2xl hover:bg-red-50/50 dark:hover:bg-red-900/10 transition-all text-center group border border-transparent hover:border-red-200 dark:hover:border-red-800">
                <AlertCircle size={24} className="mx-auto mb-2 text-red-500 group-hover:scale-110 transition-transform" />
                <p className="text-2xl font-bold text-red-600 dark:text-red-400 group-hover:text-red-700 transition-colors">{urgentStoresCount}</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Urgent</p>
            </Link>
            <Link to="/tasks" className="glass-card p-4 rounded-2xl hover:bg-amber-50/50 dark:hover:bg-amber-900/10 transition-all text-center group border border-transparent hover:border-amber-200 dark:hover:border-amber-800">
                <CheckSquare size={24} className="mx-auto mb-2 text-amber-500 group-hover:scale-110 transition-transform" />
                <p className="text-2xl font-bold dark:text-white group-hover:text-amber-600 transition-colors">{pendingTasksCount}</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Tasks</p>
            </Link>
        </motion.div>
    );
};

export default ModuleStatCards;
