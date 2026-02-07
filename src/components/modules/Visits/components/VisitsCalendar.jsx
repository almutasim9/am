import React from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { formatDate } from '../../../../utils/helpers';
import Modal from '../../../common/Modal';

/**
 * Calendar component for visits module
 * Shows monthly calendar view with visits marked
 */
const VisitsCalendar = ({
    currentMonth,
    setCurrentMonth,
    visits,
    stores,
    selectedDate,
    setSelectedDate,
    onComplete,
    onEdit
}) => {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const isToday = (date) => {
        if (!date) return false;
        try {
            return new Date(date).toDateString() === new Date().toDateString();
        } catch {
            return false;
        }
    };

    const getDaysInMonth = (date) => {
        try {
            const year = date.getFullYear();
            const month = date.getMonth();
            const firstDay = new Date(year, month, 1);
            const lastDay = new Date(year, month + 1, 0);
            const days = [];
            for (let i = 0; i < firstDay.getDay(); i++) {
                days.push(null);
            }
            for (let i = 1; i <= lastDay.getDate(); i++) {
                days.push(new Date(year, month, i));
            }
            return days;
        } catch {
            return [];
        }
    };

    const getVisitsForDate = (date) => {
        if (!date) return [];
        try {
            return visits.filter(v => v.date && new Date(v.date).toDateString() === date.toDateString());
        } catch {
            return [];
        }
    };

    return (
        <>
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden">
                {/* Calendar Header */}
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary-600 to-indigo-700 text-white">
                    <button
                        onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                        className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                        aria-label="Previous month"
                    >
                        <ChevronRight size={20} />
                    </button>
                    <h3 className="text-xl font-bold">{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</h3>
                    <button
                        onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                        className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                        aria-label="Next month"
                    >
                        <ChevronLeft size={20} />
                    </button>
                </div>

                {/* Day Names */}
                <div className="grid grid-cols-7 bg-slate-50 dark:bg-slate-700/50">
                    {dayNames.map(day => (
                        <div key={day} className="p-2 text-center text-xs font-medium text-slate-500 dark:text-slate-400">{day}</div>
                    ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-px bg-slate-200 dark:bg-slate-700">
                    {getDaysInMonth(currentMonth).map((day, idx) => (
                        <div
                            key={idx}
                            onClick={() => day && setSelectedDate(day)}
                            className={`min-h-[80px] p-1 bg-white dark:bg-slate-800 ${day ? 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50' : ''} ${day && isToday(day) ? 'ring-2 ring-emerald-500 ring-inset' : ''}`}
                        >
                            {day && (
                                <div className={`text-sm font-medium ${isToday(day) ? 'text-primary-600 font-bold' : 'text-slate-600 dark:text-slate-300'}`}>
                                    {day.getDate()}
                                    {getVisitsForDate(day).length > 0 && (
                                        <div className="mt-1 space-y-0.5">
                                            {getVisitsForDate(day).filter(v => v.status === 'scheduled').slice(0, 2).map(v => (
                                                <div key={v.id} className="text-xs px-1 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 truncate">
                                                    {stores.find(s => s.id === v.store_id)?.name?.substring(0, 8) || '...'}
                                                </div>
                                            ))}
                                            {getVisitsForDate(day).filter(v => v.status === 'completed').slice(0, 1).map(v => (
                                                <div key={v.id} className="text-xs px-1 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 truncate">
                                                    ✓ {stores.find(s => s.id === v.store_id)?.name?.substring(0, 6) || '...'}
                                                </div>
                                            ))}
                                            {getVisitsForDate(day).length > 3 && <div className="text-xs text-slate-400">+{getVisitsForDate(day).length - 3}</div>}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Legend */}
                <div className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-700/50 text-xs">
                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-500"></span> Scheduled</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-500"></span> Completed</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded ring-2 ring-emerald-500"></span> Today</span>
                </div>
            </div>

            {/* Selected Date Modal */}
            <Modal isOpen={!!selectedDate} onClose={() => setSelectedDate(null)} title={selectedDate ? `Visits on ${formatDate(selectedDate.toISOString())}` : ''}>
                {selectedDate && (
                    <div className="space-y-3">
                        {getVisitsForDate(selectedDate).length > 0 ? getVisitsForDate(selectedDate).map(visit => {
                            const store = stores.find(s => s.id === visit.store_id);
                            return (
                                <div key={visit.id} className={`p-3 rounded-xl border ${visit.status === 'completed' ? 'bg-emerald-50 border-emerald-200' : 'bg-emerald-50 border-emerald-200'}`}>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-bold">{store?.name}</p>
                                            <p className="text-sm text-slate-500">{visit.type}</p>
                                        </div>
                                        <span className={`px-2 py-1 rounded-full text-xs ${visit.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                                            {visit.status === 'completed' ? '✓ Completed' : '📅 Scheduled'}
                                        </span>
                                    </div>
                                    {visit.status === 'scheduled' && (
                                        <div className="flex gap-2 mt-3">
                                            <button onClick={() => { onComplete(visit); setSelectedDate(null); }} className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm">Complete</button>
                                            <button onClick={() => { onEdit(visit); setSelectedDate(null); }} className="py-2 px-3 bg-slate-200 hover:bg-slate-300 rounded-lg text-sm">Edit</button>
                                        </div>
                                    )}
                                </div>
                            );
                        }) : (
                            <div className="text-center py-6 text-slate-500">
                                <p>No visits on this day</p>
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </>
    );
};

export default VisitsCalendar;
