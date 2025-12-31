import React, { useState, useContext } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Plus, Calendar, Edit2, Trash2, ChevronRight, ChevronLeft } from 'lucide-react';
import useTranslation from '../../../hooks/useTranslation';
import { ToastContext } from '../../../contexts/AppContext';
import { DataContext } from '../../../contexts/DataContext';
import { db } from '../../../services/db';
import { formatDate } from '../../../utils/helpers';
import Modal from '../../common/Modal';
import VisitForm from './VisitForm';
import CompleteVisitForm from './CompleteVisitForm';
import PageTransition from '../../common/PageTransition';

const VisitsList = () => {
    const { visits, stores, settings, refreshData: onRefresh } = useContext(DataContext);
    const { openTaskDialog } = useOutletContext();
    const onCreateTask = (storeId) => openTaskDialog(storeId);
    const t = useTranslation();
    const { showToast } = useContext(ToastContext);
    const [showModal, setShowModal] = useState(false);
    const [showComplete, setShowComplete] = useState(null);
    const [editVisit, setEditVisit] = useState(null);
    const [activeTab, setActiveTab] = useState('scheduled');
    const [storeFilter, setStoreFilter] = useState('');
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);

    // Counts
    const scheduledCount = visits.filter(v => v.status === 'scheduled').length;
    const completedCount = visits.filter(v => v.status === 'completed').length;

    // Filtered visits
    const getFilteredVisits = () => {
        let filtered = visits.filter(v => v.status === activeTab);
        if (storeFilter) {
            filtered = filtered.filter(v => v.store_id === storeFilter);
        }
        return filtered.sort((a, b) => {
            if (activeTab === 'scheduled') {
                return new Date(a.date) - new Date(b.date);
            }
            return new Date(b.date) - new Date(a.date);
        });
    };

    // Days until visit
    const getDaysUntil = (date) => {
        if (!date) return null;
        const diff = Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24));
        return diff;
    };

    // Is today
    const isToday = (date) => {
        if (!date) return false;
        try {
            return new Date(date).toDateString() === new Date().toDateString();
        } catch {
            return false;
        }
    };

    // Calendar helpers
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

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const handleSave = async (visitData) => {
        const table = await db.from('visits');
        if (editVisit) {
            await table.update(editVisit.id, visitData);
        } else {
            await table.insert(visitData);
        }
        showToast(t('savedSuccess'), 'success');
        setShowModal(false);
        setEditVisit(null);
        onRefresh();
    };

    const handleComplete = async (visit, isEffective, createFollowUp) => {
        const table = await db.from('visits');
        await table.update(visit.id, { status: 'completed', is_effective: isEffective });
        if (isEffective) {
            const storesTable = await db.from('stores');
            await storesTable.update(visit.store_id, { last_visit: new Date().toISOString() });
        }
        showToast(t('savedSuccess'), 'success');
        setShowComplete(null);
        onRefresh();
        if (createFollowUp) onCreateTask(visit.store_id);
    };

    const handleDelete = async (visitId) => {
        const table = await db.from('visits');
        await table.delete(visitId);
        showToast(t('deletedSuccess'), 'success');
        onRefresh();
    };

    return (
        <PageTransition>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold dark:text-white">{t('visits')}</h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{visits.length} visits total</p>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* View Toggle */}
                        <div className="flex bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
                            <button onClick={() => setViewMode('list')}
                                className={`px-3 py-2 rounded-md text-sm transition-colors min-h-[40px] ${viewMode === 'list' ? 'bg-white dark:bg-slate-600 shadow-sm text-emerald-600 font-medium' : 'text-slate-500 hover:text-slate-700'}`}>
                                📋 List
                            </button>
                            <button onClick={() => setViewMode('calendar')}
                                className={`px-3 py-2 rounded-md text-sm transition-colors min-h-[40px] ${viewMode === 'calendar' ? 'bg-white dark:bg-slate-600 shadow-sm text-emerald-600 font-medium' : 'text-slate-500 hover:text-slate-700'}`}>
                                📅 Calendar
                            </button>
                        </div>
                        <button onClick={() => { setEditVisit(null); setShowModal(true); }}
                            className="flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-purple-700 text-white rounded-xl transition-all shadow-lg shadow-emerald-500/25 min-h-[44px] active:scale-[0.98]">
                            <Plus size={20} /><span className="hidden sm:inline">{t('newVisit')}</span><span className="sm:hidden">Add</span>
                        </button>
                    </div>
                </div>

                {/* List View */}
                {viewMode === 'list' && (
                    <>
                        {/* Tabs */}
                        <div className="flex items-center gap-4 border-b dark:border-slate-700">
                            <button onClick={() => setActiveTab('scheduled')}
                                className={`pb-3 px-2 border-b-2 transition-colors min-h-[44px] ${activeTab === 'scheduled' ? 'border-emerald-600 text-emerald-600 font-medium' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
                                📅 <span className="hidden sm:inline">Scheduled</span> <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-emerald-100 text-emerald-700">{scheduledCount}</span>
                            </button>
                            <button onClick={() => setActiveTab('completed')}
                                className={`pb-3 px-2 border-b-2 transition-colors min-h-[44px] ${activeTab === 'completed' ? 'border-emerald-600 text-emerald-600 font-medium' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
                                ✅ <span className="hidden sm:inline">Completed</span> <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-emerald-100 text-emerald-700">{completedCount}</span>
                            </button>
                        </div>

                        {/* Filter */}
                        <div className="flex flex-wrap gap-3">
                            <select value={storeFilter} onChange={e => setStoreFilter(e.target.value)}
                                className="px-4 py-2.5 border rounded-xl dark:bg-slate-700 dark:border-slate-600 dark:text-white min-h-[44px]">
                                <option value="">{t('all')} - {t('stores')}</option>
                                {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                            {storeFilter && (
                                <button onClick={() => setStoreFilter('')} className="text-sm text-emerald-600 hover:underline">
                                    {t('clearFilters')}
                                </button>
                            )}
                        </div>

                        {/* Visits List */}
                        {getFilteredVisits().length > 0 ? (
                            <div className="space-y-3">
                                {getFilteredVisits().map(visit => {
                                    const store = stores.find(s => s.id === visit.store_id);
                                    const daysUntil = getDaysUntil(visit.date);
                                    const today = isToday(visit.date);
                                    const isPast = daysUntil !== null && daysUntil < 0;
                                    return (
                                        <div key={visit.id}
                                            className={`bg-white dark:bg-slate-800 rounded-xl shadow-sm hover:shadow-md transition-all border overflow-hidden ${today ? 'border-emerald-300 ring-2 ring-emerald-100' : isPast && activeTab === 'scheduled' ? 'border-red-300' : 'border-slate-100 dark:border-slate-700'}`}>
                                            <div className="flex items-stretch">
                                                <div className={`w-20 flex flex-col items-center justify-center p-3 ${today ? 'bg-emerald-500 text-white' : activeTab === 'completed' ? 'bg-emerald-50 dark:bg-emerald-900/20' : isPast ? 'bg-red-50 dark:bg-red-900/20' : 'bg-slate-50 dark:bg-slate-700/50'}`}>
                                                    <span className={`text-2xl font-bold ${today ? 'text-white' : activeTab === 'completed' ? 'text-emerald-600' : isPast ? 'text-red-600' : 'text-slate-700 dark:text-slate-300'}`}>
                                                        {new Date(visit.date).getDate()}
                                                    </span>
                                                    <span className={`text-xs ${today ? 'text-emerald-100' : 'text-slate-500'}`}>
                                                        {new Date(visit.date).toLocaleDateString('en', { month: 'short' })}
                                                    </span>
                                                </div>
                                                <div className="flex-1 flex items-center justify-between p-4">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <h3 className="font-bold dark:text-white">{store?.name || 'Unknown'}</h3>
                                                            {today && <span className="px-2 py-0.5 rounded-full text-xs bg-emerald-100 text-emerald-700">Today</span>}
                                                            {isPast && activeTab === 'scheduled' && <span className="px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-700">⚠️ Overdue</span>}
                                                            {activeTab === 'completed' && (
                                                                <span className={`px-2 py-0.5 rounded-full text-xs ${visit.is_effective ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                                                                    {visit.is_effective ? '✓ Effective' : '✗ Not effective'}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">🏷️ {visit.type} • 📅 {formatDate(visit.date)}</p>
                                                        {visit.note && <p className="text-xs text-slate-400 mt-1 truncate">💬 {visit.note}</p>}
                                                    </div>
                                                    {activeTab === 'scheduled' && daysUntil !== null && !today && (
                                                        <div className={`mx-3 text-center px-3 py-1.5 rounded-lg ${daysUntil < 0 ? 'bg-red-100 text-red-700' : daysUntil <= 2 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                                                            <p className="text-lg font-bold">{Math.abs(daysUntil)}</p>
                                                            <p className="text-xs">{daysUntil < 0 ? 'Overdue' : 'days'}</p>
                                                        </div>
                                                    )}
                                                    <div className="flex items-center gap-2">
                                                        {activeTab === 'scheduled' && (
                                                            <>
                                                                <button onClick={() => setShowComplete(visit)} className="px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm">Complete</button>
                                                                <button onClick={() => { setEditVisit(visit); setShowModal(true); }} className="p-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-600 dark:text-slate-300 rounded-lg"><Edit2 size={18} /></button>
                                                            </>
                                                        )}
                                                        {activeTab === 'completed' && (
                                                            <button onClick={() => handleDelete(visit.id)} className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg"><Trash2 size={18} /></button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <Calendar size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                                <p className="text-slate-500 dark:text-slate-400">{activeTab === 'scheduled' ? 'No scheduled visits' : 'No completed visits'}</p>
                            </div>
                        )}
                    </>
                )}

                {/* Calendar View */}
                {viewMode === 'calendar' && (
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden">
                        {/* Calendar Header */}
                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
                            <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                                className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                                <ChevronRight size={20} />
                            </button>
                            <h3 className="text-xl font-bold">{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</h3>
                            <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                                className="p-2 hover:bg-white/20 rounded-lg transition-colors">
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
                                <div key={idx} onClick={() => day && setSelectedDate(day)}
                                    className={`min-h-[80px] p-1 bg-white dark:bg-slate-800 ${day ? 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50' : ''} ${day && isToday(day) ? 'ring-2 ring-emerald-500 ring-inset' : ''}`}>
                                    {day && (
                                        <div className={`text-sm font-medium ${isToday(day) ? 'text-emerald-600 font-bold' : 'text-slate-600 dark:text-slate-300'}`}>
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
                )}

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
                                                <button onClick={() => { setShowComplete(visit); setSelectedDate(null); }} className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm">Complete</button>
                                                <button onClick={() => { setEditVisit(visit); setShowModal(true); setSelectedDate(null); }} className="py-2 px-3 bg-slate-200 hover:bg-slate-300 rounded-lg text-sm"><Edit2 size={16} /></button>
                                            </div>
                                        )}
                                    </div>
                                );
                            }) : (
                                <div className="text-center py-6 text-slate-500">
                                    <p>No visits on this day</p>
                                    <button onClick={() => { setSelectedDate(null); setShowModal(true); }} className="mt-3 px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm">+ Add Visit</button>
                                </div>
                            )}
                        </div>
                    )}
                </Modal>

                {/* Modals */}
                <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditVisit(null); }} title={editVisit ? t('edit') : t('newVisit')}>
                    <VisitForm visit={editVisit} stores={stores} settings={settings} onSave={handleSave} onCancel={() => setShowModal(false)} />
                </Modal>
                <Modal isOpen={!!showComplete} onClose={() => setShowComplete(null)} title={t('complete')}>
                    <CompleteVisitForm visit={showComplete} onComplete={handleComplete} onCancel={() => setShowComplete(null)} />
                </Modal>
            </div >
        </PageTransition>
    );
};

export default VisitsList;
