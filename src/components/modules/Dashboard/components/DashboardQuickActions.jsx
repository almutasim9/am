import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, CheckSquare } from 'lucide-react';

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

const DashboardQuickActions = ({ onNewVisit, onNewTask }) => {
    return (
        <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4">
            <button onClick={onNewVisit}
                className="glass-card group flex items-center justify-center gap-3 p-6 rounded-3xl hover:border-primary-500/50 transition-all duration-300">
                <div className="p-3 bg-secondary-50 dark:bg-secondary-900/30 rounded-2xl text-secondary-600 transition-transform group-hover:scale-110 group-hover:rotate-3">
                    <Calendar size={24} />
                </div>
                <span className="font-bold text-slate-700 dark:text-slate-200 text-lg">New Visit</span>
            </button>
            <button onClick={onNewTask}
                className="glass-card group flex items-center justify-center gap-3 p-6 rounded-3xl hover:border-primary-500/50 transition-all duration-300">
                <div className="p-3 bg-primary-50 dark:bg-primary-900/30 rounded-2xl text-primary-600 transition-transform group-hover:scale-110 group-hover:-rotate-3">
                    <CheckSquare size={24} />
                </div>
                <span className="font-bold text-slate-700 dark:text-slate-200 text-lg">New Task</span>
            </button>
        </motion.div>
    );
};

export default DashboardQuickActions;
