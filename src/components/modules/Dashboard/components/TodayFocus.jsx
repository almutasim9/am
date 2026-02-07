import React from 'react';
import { motion } from 'framer-motion';
import { Target } from 'lucide-react';

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

const TodayFocus = ({ todayVisitsCount, highPriorityTasksCount, urgentStoresCount }) => {
    return (
        <motion.div variants={itemVariants} className="bg-gradient-to-br from-primary-600 via-primary-700 to-indigo-800 rounded-3xl p-6 text-white shadow-xl shadow-primary-500/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-6">
                    <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
                        <Target size={20} className="text-white" />
                    </div>
                    <h2 className="font-bold text-lg">Today's Focus</h2>
                </div>
                <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10 transition-transform hover:-translate-y-1">
                        <p className="text-3xl font-bold mb-1">{todayVisitsCount}</p>
                        <p className="text-xs text-primary-100 font-medium uppercase tracking-wider">Visits Today</p>
                    </div>
                    <div className="text-center p-4 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10 transition-transform hover:-translate-y-1">
                        <p className="text-3xl font-bold mb-1">{highPriorityTasksCount}</p>
                        <p className="text-xs text-primary-100 font-medium uppercase tracking-wider">High Priority</p>
                    </div>
                    <div className="text-center p-4 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10 transition-transform hover:-translate-y-1 relative group">
                        <div className={`absolute inset-0 bg-red-500/20 rounded-2xl blur-xl transition-opacity ${urgentStoresCount > 0 ? 'opacity-100' : 'opacity-0'}`} />
                        <p className="text-3xl font-bold text-red-100 relative z-10">{urgentStoresCount}</p>
                        <p className="text-xs text-primary-100 font-medium uppercase tracking-wider relative z-10">Need Visit</p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default TodayFocus;
