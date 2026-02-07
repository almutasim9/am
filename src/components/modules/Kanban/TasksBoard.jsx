import React, { useState, useContext, useMemo } from 'react';
import { Plus, CheckSquare, CheckCircle, Edit2, Trash2, ChevronLeft, ChevronRight, Calendar, Filter, Search, Download, AlertTriangle, Clock, TrendingUp } from 'lucide-react';
import useTranslation from '../../../hooks/useTranslation';
import { ToastContext, LangContext } from '../../../contexts/AppContext';
import { DataContext } from '../../../contexts/DataContext';
import { db } from '../../../services/db';
import { formatDate, priorityColors } from '../../../utils/helpers';
import Modal from '../../common/Modal';
import ConfirmModal from '../../common/ConfirmModal';
import TaskForm from './TaskForm';
import PageTransition from '../../common/PageTransition';
import * as XLSX from 'xlsx';

const TasksBoard = () => {
    const { tasks, setTasks, stores, settings, refreshData: onRefresh } = useContext(DataContext);
    const t = useTranslation();
    const { showToast } = useContext(ToastContext);
    const { lang } = useContext(LangContext);
    const [editTask, setEditTask] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [viewTask, setViewTask] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(null);

    // View States
    const [viewMode, setViewMode] = useState('board'); // 'board', 'list', 'calendar'
    const [listFilter, setListFilter] = useState('all'); // 'all', 'pending', 'in_progress', 'done'
    const [quickFilter, setQuickFilter] = useState('all'); // 'all', 'today', 'week'
    const [searchQuery, setSearchQuery] = useState('');

    // Calendar States
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);

    // Statistics
    const stats = useMemo(() => {
        const now = new Date();
        const todayStr = now.toDateString();
        return {
            total: tasks.length,
            pending: tasks.filter(t => t.status === 'pending' || !t.status).length,
            inProgress: tasks.filter(t => t.status === 'in_progress').length,
            done: tasks.filter(t => t.status === 'done').length,
            overdue: tasks.filter(t => {
                if (!t.due_date || t.status === 'done') return false;
                const dueDate = new Date(t.due_date);
                return dueDate < now && dueDate.toDateString() !== todayStr;
            }).length,
            highPriority: tasks.filter(t => t.priority === 'high' && t.status !== 'done').length,
            dueToday: tasks.filter(t => t.due_date && new Date(t.due_date).toDateString() === todayStr && t.status !== 'done').length
        };
    }, [tasks]);

    // Search filter function
    const matchesSearch = (task) => {
        if (!searchQuery.trim()) return true;
        const store = stores.find(s => s.id === task.store_id);
        const query = searchQuery.toLowerCase();
        return (
            task.sub?.toLowerCase().includes(query) ||
            task.cat?.toLowerCase().includes(query) ||
            task.description?.toLowerCase().includes(query) ||
            store?.name?.toLowerCase().includes(query)
        );
    };

    // Export to Excel
    const handleExportTasks = () => {
        const exportData = tasks.map(task => {
            const store = stores.find(s => s.id === task.store_id);
            return {
                'Store': store?.name || '-',
                'Category': task.cat || '-',
                'Task': task.sub || '-',
                'Priority': task.priority || 'medium',
                'Status': task.status || 'pending',
                'Due Date': task.due_date ? formatDate(task.due_date) : '-',
                'Description': task.description || '-'
            };
        });

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Tasks');

        // Set column widths
        ws['!cols'] = [
            { wch: 25 }, // Store
            { wch: 15 }, // Category
            { wch: 25 }, // Task
            { wch: 10 }, // Priority
            { wch: 12 }, // Status
            { wch: 15 }, // Due Date
            { wch: 40 }  // Description
        ];

        XLSX.writeFile(wb, `tasks_${new Date().toISOString().split('T')[0]}.xlsx`);
        showToast('Tasks exported successfully!', 'success');
    };

    // Columns definition
    const columns = [
        { id: 'pending', title: 'Pending', icon: '📋', bgColor: 'bg-amber-50 dark:bg-amber-900/10', borderColor: 'border-amber-300' },
        { id: 'in_progress', title: 'In Progress', icon: '⏳', bgColor: 'bg-blue-50 dark:bg-blue-900/10', borderColor: 'border-blue-300' },
        { id: 'done', title: 'Done', icon: '✅', bgColor: 'bg-indigo-50/50 dark:bg-indigo-900/10', borderColor: 'border-primary-200' }
    ];

    // Helper: Filter by Time (Today/Week)
    const filterByTime = (taskList) => {
        if (quickFilter === 'all') return taskList;
        const now = new Date();
        const todayStr = now.toDateString();

        return taskList.filter(task => {
            if (!task.due_date) return false;
            const dueDate = new Date(task.due_date);

            if (quickFilter === 'today') {
                return dueDate.toDateString() === todayStr;
            }
            if (quickFilter === 'week') {
                const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // Actually looking at next 7 days typically for tasks, or current week?
                // Let's implement "This Week" (Next 7 days + Today)
                const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
                return dueDate >= new Date(new Date().setHours(0, 0, 0, 0)) && dueDate <= nextWeek;
            }
            return true;
        });
    };

    // Get tasks for each column
    const getColumnTasks = (columnId) => {
        let filtered = tasks.filter(task => {
            if (columnId === 'pending') return task.status === 'pending' || (!task.status);
            if (columnId === 'in_progress') return task.status === 'in_progress';
            if (columnId === 'done') return task.status === 'done';
            return false;
        });

        filtered = filterByTime(filtered);
        filtered = filtered.filter(matchesSearch); // Apply search filter

        return filtered.sort((a, b) => {
            const order = { high: 0, medium: 1, low: 2 };
            return order[a.priority] - order[b.priority];
        });
    };

    // Get filtered tasks for list view
    const getFilteredTasks = () => {
        let filtered = [...tasks];

        // Status Filter
        if (listFilter !== 'all') {
            filtered = filtered.filter(task => {
                if (listFilter === 'pending') return task.status === 'pending' || (!task.status);
                return task.status === listFilter;
            });
        }

        // Time Filter
        filtered = filterByTime(filtered);

        // Search Filter
        filtered = filtered.filter(matchesSearch);

        return filtered.sort((a, b) => {
            const order = { high: 0, medium: 1, low: 2 };
            return order[a.priority] - order[b.priority];
        });
    };

    const isOverdue = (dueDate) => {
        if (!dueDate) return false;
        return new Date(dueDate) < new Date() && new Date(dueDate).toDateString() !== new Date().toDateString();
    };

    const getDaysUntilDue = (dueDate) => {
        if (!dueDate) return null;
        return Math.ceil((new Date(dueDate) - new Date()) / (1000 * 60 * 60 * 24));
    };

    // Calendar Helper Functions
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

    const getTasksForDate = (date) => {
        if (!date) return [];
        try {
            return tasks.filter(t => t.due_date && new Date(t.due_date).toDateString() === date.toDateString());
        } catch {
            return [];
        }
    };

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];


    // Drag and Drop handlers
    const [draggedTask, setDraggedTask] = useState(null);
    const [dropTarget, setDropTarget] = useState(null);

    const handleDragStart = (e, task) => {
        setDraggedTask(task);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e, columnId) => {
        e.preventDefault();
        setDropTarget(columnId);
    };

    const handleDragLeave = () => {
        setDropTarget(null);
    };

    const handleDrop = async (e, columnId) => {
        e.preventDefault();
        setDropTarget(null);
        if (draggedTask && draggedTask.status !== columnId) {
            await handleStatusChange(draggedTask, columnId);
        }
        setDraggedTask(null);
    };

    const handleSave = async (taskData) => {
        try {
            const table = await db.from('tasks');
            if (editTask) {
                // Optimistic update
                if (setTasks) {
                    const updated = tasks.map(t => t.id === editTask.id ? { ...t, ...taskData } : t);
                    setTasks(updated);
                }
                const { error } = await table.update(editTask.id, taskData);
                if (error) {
                    // Revert optimistic update on error
                    onRefresh();
                    showToast(error.userMessage || 'Error updating task', 'error');
                    return;
                }
            } else {
                // For create, we wait for DB to get ID
                const { data, error } = await table.insert(taskData);
                if (error) {
                    showToast(error.userMessage || 'Error creating task. Check Supabase RLS settings.', 'error');
                    console.error('Insert error:', error);
                    return;
                }
            }
            showToast(t('savedSuccess'), 'success');
            setShowModal(false);
            setEditTask(null);
            onRefresh();
        } catch (err) {
            console.error('handleSave error:', err);
            showToast(err.userMessage || 'Unexpected error. Please try again.', 'error');
        }
    };

    const handleDeleteConfirm = async () => {
        if (!confirmDelete) return;
        // Optimistic update
        if (setTasks) {
            setTasks(tasks.filter(t => t.id !== confirmDelete));
        }

        const table = await db.from('tasks');
        await table.delete(confirmDelete);
        showToast(t('deletedSuccess'), 'success');
        setConfirmDelete(null);
        setViewTask(null);
        onRefresh();
    };

    const handleStatusChange = async (task, newStatus) => {
        // Optimistic Update
        if (setTasks) {
            const updated = tasks.map(t => t.id === task.id ? { ...t, status: newStatus } : t);
            setTasks(updated);
        }

        const table = await db.from('tasks');
        await table.update(task.id, { status: newStatus });
        showToast(t('savedSuccess'), 'success');
        // Silent refresh to ensure consistency
        onRefresh();
    };

    return (
        <PageTransition>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold dark:text-white">{t('tasks')}</h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{tasks.length} tasks total</p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full xl:w-auto">
                        {/* Quick Filters */}
                        <div className="flex bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
                            <button onClick={() => setQuickFilter('all')}
                                className={`px-3 py-2 rounded-md text-sm transition-colors ${quickFilter === 'all' ? 'bg-white dark:bg-slate-600 shadow-sm text-primary-600 font-bold' : 'text-slate-500 hover:text-slate-700'}`}>
                                All Time
                            </button>
                            <button onClick={() => setQuickFilter('today')}
                                className={`px-3 py-2 rounded-md text-sm transition-colors ${quickFilter === 'today' ? 'bg-white dark:bg-slate-600 shadow-sm text-primary-600 font-bold' : 'text-slate-500 hover:text-slate-700'}`}>
                                Today
                            </button>
                            <button onClick={() => setQuickFilter('week')}
                                className={`px-3 py-2 rounded-md text-sm transition-colors ${quickFilter === 'week' ? 'bg-white dark:bg-slate-600 shadow-sm text-primary-600 font-bold' : 'text-slate-500 hover:text-slate-700'}`}>
                                This Week
                            </button>
                        </div>

                        {/* View Toggle */}
                        <div className="flex bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
                            <button onClick={() => setViewMode('board')}
                                className={`px-3 py-2 rounded-md text-sm transition-colors flex items-center gap-1 min-h-[40px] ${viewMode === 'board' ? 'bg-white dark:bg-slate-600 shadow-sm text-primary-600 font-medium' : 'text-slate-500 hover:text-slate-700'}`}>
                                🗂️ Board
                            </button>
                            <button onClick={() => setViewMode('list')}
                                className={`px-3 py-2 rounded-md text-sm transition-colors flex items-center gap-1 min-h-[40px] ${viewMode === 'list' ? 'bg-white dark:bg-slate-600 shadow-sm text-primary-600 font-medium' : 'text-slate-500 hover:text-slate-700'}`}>
                                📋 List
                            </button>
                            <button onClick={() => setViewMode('calendar')}
                                className={`px-3 py-2 rounded-md text-sm transition-colors flex items-center gap-1 min-h-[40px] ${viewMode === 'calendar' ? 'bg-white dark:bg-slate-600 shadow-sm text-primary-600 font-medium' : 'text-slate-500 hover:text-slate-700'}`}>
                                📅 <span className="hidden sm:inline">Calendar</span>
                            </button>
                        </div>

                        <button onClick={() => { setEditTask(null); setShowModal(true); }}
                            className="flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl transition-all shadow-lg shadow-primary-500/25 min-h-[44px] active:scale-[0.98] font-bold">
                            <Plus size={20} /><span className="hidden sm:inline">{t('newTask')}</span><span className="sm:hidden">Add</span>
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-100 dark:border-slate-700">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                <CheckSquare size={20} className="text-blue-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold dark:text-white">{stats.total}</p>
                                <p className="text-xs text-slate-500">Total Tasks</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-100 dark:border-slate-700">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                                <AlertTriangle size={20} className="text-red-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
                                <p className="text-xs text-slate-500">Overdue</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-100 dark:border-slate-700">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                                <Clock size={20} className="text-amber-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-amber-600">{stats.dueToday}</p>
                                <p className="text-xs text-slate-500">Due Today</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-100 dark:border-slate-700">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                                <TrendingUp size={20} className="text-primary-600" />
                            </div>
                            <div>
                                <h4 className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 tracking-[0.2em]">Finished</h4>
                                <p className="text-2xl font-bold text-primary-600">{stats.done}</p>
                                <p className="text-xs text-slate-500">Completed</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search and Export Bar */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative group w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Search tasks by name, category, or store..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border-none rounded-xl dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all font-medium"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                                ✕
                            </button>
                        )}
                    </div>
                    <button
                        onClick={handleExportTasks}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl transition-colors min-h-[44px]"
                    >
                        <Download size={18} />
                        <span>Export Excel</span>
                    </button>
                </div>


                {/* Kanban Board View */}
                {viewMode === 'board' && (
                    <div className="flex md:grid md:grid-cols-3 gap-4 overflow-x-auto pb-4 md:pb-0 snap-x snap-mandatory">
                        {columns.map(column => {
                            const columnTasks = getColumnTasks(column.id);
                            const isDragOver = dropTarget === column.id;
                            return (
                                <div key={column.id}
                                    onDragOver={(e) => handleDragOver(e, column.id)}
                                    onDragLeave={handleDragLeave}
                                    onDrop={(e) => handleDrop(e, column.id)}
                                    className={`rounded-2xl p-4 transition-colors min-w-[280px] md:min-w-0 snap-center flex-shrink-0 md:flex-shrink ${column.bgColor} ${isDragOver ? 'ring-2 ring-primary-500 bg-primary-50 dark:bg-primary-900/30' : ''}`}>
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xl">{column.icon}</span>
                                            <h3 className="font-bold dark:text-white">{column.title}</h3>
                                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300">{columnTasks.length}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-3 min-h-[200px]">
                                        {columnTasks.length > 0 ? columnTasks.map(task => {
                                            const store = stores.find(s => s.id === task.store_id);
                                            const overdue = isOverdue(task.due_date);
                                            const daysUntil = getDaysUntilDue(task.due_date);
                                            return (
                                                <div key={task.id}
                                                    draggable
                                                    onDragStart={(e) => handleDragStart(e, task)}
                                                    onClick={() => setViewTask(task)}
                                                    className={`bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing active:scale-[0.98] border-l-4 ${task.priority === 'high' ? 'border-red-500' : task.priority === 'medium' ? 'border-amber-500' : 'border-emerald-500'} ${overdue && column.id !== 'done' ? 'ring-2 ring-red-200' : ''} ${draggedTask?.id === task.id ? 'opacity-50' : ''}`}>
                                                    <div className="flex items-start justify-between gap-2 mb-2">
                                                        <h4 className={`font-medium dark:text-white text-sm ${column.id === 'done' ? 'line-through text-slate-400' : ''}`}>{task.sub}</h4>
                                                        <span className={`shrink-0 px-2 py-0.5 rounded text-xs text-white ${priorityColors[task.priority]}`}>{t(task.priority)}</span>
                                                    </div>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">🏪 {store?.name || 'Not specified'}</p>
                                                    <div className="flex items-center justify-between">
                                                        <p className={`text-xs ${overdue && column.id !== 'done' ? 'text-red-500 font-medium' : 'text-slate-400'}`}>📅 {formatDate(task.due_date)}</p>
                                                        {column.id !== 'done' && daysUntil !== null && (
                                                            <span className={`text-xs px-2 py-0.5 rounded-full ${daysUntil < 0 ? 'bg-red-100 text-red-700' : daysUntil === 0 ? 'bg-amber-100 text-amber-700' : daysUntil <= 2 ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-100 text-slate-600'}`}>
                                                                {daysUntil < 0 ? `${Math.abs(daysUntil)} days overdue` : daysUntil === 0 ? 'Today' : `${daysUntil} days`}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                                                        <span className="text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400">{task.cat}</span>
                                                    </div>
                                                </div>
                                            );
                                        }) : (
                                            <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                                                <CheckSquare size={32} className="mb-2 opacity-30" />
                                                <p className="text-sm">No tasks</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* List View */}
                {viewMode === 'list' && (
                    <div className="space-y-4">
                        {/* List Filters */}
                        <div className="flex flex-wrap gap-2">
                            {['all', 'pending', 'in_progress', 'done'].map(status => (
                                <button key={status} onClick={() => setListFilter(status)}
                                    className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${listFilter === status ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 font-bold' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'}`}>
                                    {status === 'all' ? `All (${tasks.length})` :
                                        status === 'pending' ? `📋 Pending` :
                                            status === 'in_progress' ? `⏳ In Progress` :
                                                `✅ Done`}
                                </button>
                            ))}
                        </div>

                        {/* Tasks - Responsive Cards */}
                        <div className="space-y-3">
                            {getFilteredTasks().length > 0 ? getFilteredTasks().map(task => {
                                const store = stores.find(s => s.id === task.store_id);
                                const overdue = isOverdue(task.due_date);
                                const daysUntil = getDaysUntilDue(task.due_date);
                                return (
                                    <div key={task.id}
                                        onClick={() => setViewTask(task)}
                                        className={`bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-100 dark:border-slate-700 transition-all cursor-pointer hover:shadow-md ${overdue && task.status !== 'done' ? 'border-l-4 border-l-red-500' : ''}`}>

                                        {/* Header Row - Title & Priority */}
                                        <div className="flex items-start justify-between gap-3 mb-3">
                                            <div className="flex-1 min-w-0">
                                                <h4 className={`font-medium dark:text-white truncate ${task.status === 'done' ? 'line-through text-slate-400' : ''}`}>
                                                    {task.sub}
                                                </h4>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{task.cat}</p>
                                            </div>
                                            <span className={`shrink-0 px-2 py-1 rounded-full text-xs text-white ${priorityColors[task.priority]}`}>
                                                {t(task.priority)}
                                            </span>
                                        </div>

                                        {/* Info Row - Store, Status, Date */}
                                        <div className="flex flex-wrap items-center gap-2 text-sm mb-3">
                                            <span className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-300">
                                                🏪 {store?.name || '-'}
                                            </span>
                                            <span className={`px-2 py-0.5 rounded-full text-xs ${task.status === 'done' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                                task.status === 'in_progress' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                                    'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                                }`}>
                                                {task.status === 'done' ? '✅ Done' : task.status === 'in_progress' ? '⏳ In Progress' : '📋 Pending'}
                                            </span>
                                        </div>

                                        {/* Footer Row - Due Date & Actions */}
                                        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700">
                                            <div>
                                                <p className={`text-sm ${overdue && task.status !== 'done' ? 'text-red-600 font-medium' : 'text-slate-600 dark:text-slate-300'}`}>
                                                    📅 {formatDate(task.due_date)}
                                                </p>
                                                {task.status !== 'done' && daysUntil !== null && (
                                                    <span className={`text-xs ${daysUntil < 0 ? 'text-red-500' : daysUntil === 0 ? 'text-amber-500' : 'text-slate-400'}`}>
                                                        {daysUntil < 0 ? `${Math.abs(daysUntil)} days overdue` : daysUntil === 0 ? 'Today' : `In ${daysUntil} days`}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                                                {task.status !== 'done' && (
                                                    <button onClick={() => handleStatusChange(task, 'done')} title="Complete"
                                                        className="p-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center">
                                                        <CheckCircle size={16} />
                                                    </button>
                                                )}
                                                <button onClick={() => { setEditTask(task); setShowModal(true); }}
                                                    className="p-2 bg-slate-100 dark:bg-slate-600 hover:bg-slate-200 text-slate-600 dark:text-slate-300 rounded-lg transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center">
                                                    <Edit2 size={16} />
                                                </button>
                                                <button onClick={() => setConfirmDelete(task.id)}
                                                    className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            }) : (
                                <div className="bg-white dark:bg-slate-800 rounded-xl p-12 text-center">
                                    <CheckSquare size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                                    <p className="text-slate-500 dark:text-slate-400">No tasks</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Calendar View */}
                {viewMode === 'calendar' && (
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden">
                        {/* Calendar Header */}
                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white">
                            <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                                className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                                <ChevronRight size={20} className="rotate-180" />
                            </button>
                            <h3 className="text-xl font-bold">{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</h3>
                            <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                                className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                                <ChevronRight size={20} />
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
                            {getDaysInMonth(currentMonth).map((day, idx) => {
                                const dayTasks = getTasksForDate(day);
                                const isToday = day && new Date().toDateString() === day.toDateString();

                                return (
                                    <div key={idx} onClick={() => day && setSelectedDate(day)}
                                        className={`min-h-[100px] p-1 bg-white dark:bg-slate-800 ${day ? 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50' : ''} ${isToday ? 'ring-2 ring-primary-500 ring-inset bg-primary-50/30' : ''}`}>
                                        {day && (
                                            <>
                                                <div className={`text-sm font-medium mb-1 ${isToday ? 'text-primary-600 font-bold' : 'text-slate-600 dark:text-slate-300'}`}>
                                                    {day.getDate()}
                                                </div>
                                                <div className="space-y-1">
                                                    {dayTasks.slice(0, 3).map(task => (
                                                        <div key={task.id} className={`text-xs px-1.5 py-0.5 rounded truncate ${task.status === 'done' ? 'bg-slate-100 text-slate-500 line-through' : task.status === 'in_progress' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                                                            {task.sub}
                                                        </div>
                                                    ))}
                                                    {dayTasks.length > 3 && (
                                                        <div className="text-xs text-slate-400 px-1">+ {dayTasks.length - 3} more</div>
                                                    )}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Task Detail Modal */}
                <Modal isOpen={!!viewTask} onClose={() => setViewTask(null)} title="Task Details">
                    {viewTask && (
                        <div className="space-y-4">
                            <div className="flex items-start justify-between gap-3">
                                <h3 className="text-xl font-bold dark:text-white">{viewTask.sub}</h3>
                                <span className={`shrink-0 px-3 py-1 rounded-full text-sm text-white ${priorityColors[viewTask.priority]}`}>{t(viewTask.priority)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-slate-500">{t('status')}:</span>
                                <select value={viewTask.status || 'pending'} onChange={(e) => { handleStatusChange(viewTask, e.target.value); setViewTask({ ...viewTask, status: e.target.value }); }}
                                    className="px-3 py-1.5 border rounded-lg text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white">
                                    <option value="pending">📋 Pending</option>
                                    <option value="in_progress">⏳ In Progress</option>
                                    <option value="done">✅ Done</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3">
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{t('stores')}</p>
                                    <p className="font-medium dark:text-white mt-1">{stores.find(s => s.id === viewTask.store_id)?.name || '-'}</p>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3">
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{t('category')}</p>
                                    <p className="font-medium dark:text-white mt-1">{viewTask.cat}</p>
                                </div>
                                <div className={`rounded-xl p-3 ${isOverdue(viewTask.due_date) && viewTask.status !== 'done' ? 'bg-red-50 dark:bg-red-900/20' : 'bg-slate-50 dark:bg-slate-700/50'}`}>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{t('dueDate')}</p>
                                    <p className={`font-medium mt-1 ${isOverdue(viewTask.due_date) && viewTask.status !== 'done' ? 'text-red-600' : 'dark:text-white'}`}>{formatDate(viewTask.due_date)}</p>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3">
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{t('priority')}</p>
                                    <p className="font-medium dark:text-white mt-1">{t(viewTask.priority)}</p>
                                </div>
                            </div>
                            {viewTask.description && (
                                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4">
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{t('description')}</p>
                                    <p className="dark:text-white whitespace-pre-wrap">{viewTask.description}</p>
                                </div>
                            )}
                            <div className="flex gap-2 pt-4 border-t dark:border-slate-700">
                                {viewTask.status !== 'done' && (
                                    <button onClick={() => { handleStatusChange(viewTask, 'done'); setViewTask(null); }}
                                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl transition-colors">
                                        <CheckCircle size={18} /> Complete
                                    </button>
                                )}
                                <button onClick={() => { setEditTask(viewTask); setShowModal(true); setViewTask(null); }}
                                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl transition-colors font-bold shadow-lg shadow-primary-500/20 active:scale-95">
                                    <Edit2 size={18} />{t('edit')}
                                </button>
                                <button onClick={() => setConfirmDelete(viewTask.id)}
                                    className="py-2.5 px-4 bg-red-100 hover:bg-red-200 text-red-600 rounded-xl transition-colors">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    )}
                </Modal>

                {/* Selected Date Modal */}
                <Modal isOpen={!!selectedDate} onClose={() => setSelectedDate(null)} title={selectedDate ? `Tasks on ${formatDate(selectedDate.toISOString())}` : ''}>
                    {selectedDate && (
                        <div className="space-y-3">
                            {getTasksForDate(selectedDate).length > 0 ? getTasksForDate(selectedDate).map(task => {
                                const store = stores.find(s => s.id === task.store_id);
                                return (
                                    <div key={task.id} className={`p-3 rounded-xl border ${task.status === 'done' ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-bold">{task.sub}</p>
                                                <p className="text-sm text-slate-500">at {store?.name}</p>
                                            </div>
                                            <span className={`px-2 py-1 rounded-full text-xs ${task.status === 'done' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                                {task.status === 'done' ? '✅ Done' : '⏳ Pending'}
                                            </span>
                                        </div>
                                        {task.status !== 'done' && (
                                            <div className="flex gap-2 mt-3">
                                                <button onClick={() => { handleStatusChange(task, 'done'); setSelectedDate(null); }} className="flex-1 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg text-sm">Complete</button>
                                                <button onClick={() => { setEditTask(task); setShowModal(true); setSelectedDate(null); }} className="py-2 px-3 bg-slate-200 hover:bg-slate-300 rounded-lg text-sm"><Edit2 size={16} /></button>
                                            </div>
                                        )}
                                    </div>
                                );
                            }) : (
                                <div className="text-center py-6 text-slate-500">
                                    <p>No tasks due on this day</p>
                                    <button onClick={() => { setSelectedDate(null); setEditTask(null); setShowModal(true); }} className="mt-3 px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm">+ Add Task</button>
                                </div>
                            )}
                        </div>
                    )}
                </Modal>

                <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditTask(null); }} title={editTask ? t('edit') : t('newTask')}>
                    <TaskForm task={editTask} stores={stores} settings={settings} onSave={handleSave} onCancel={() => setShowModal(false)} />
                </Modal>
                <ConfirmModal isOpen={!!confirmDelete} onClose={() => setConfirmDelete(null)} onConfirm={handleDeleteConfirm} title={t('confirmDelete')} message={t('confirmDeleteMessage')} />
            </div>
        </PageTransition>
    );
};

export default TasksBoard;
