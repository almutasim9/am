import React, { useState, useContext } from 'react';
import { useOutletContext } from 'react-router-dom';
import { ChevronRight, Phone, MapPin, Edit2, User, Plus, Trash2, Calendar, CheckSquare, CheckCircle, CreditCard, Smartphone, Hash, Copy, Clock, Filter, Circle, CheckCircle2, Tag } from 'lucide-react';
import useTranslation from '../../../hooks/useTranslation';
import { ToastContext } from '../../../contexts/AppContext';
import { DataContext } from '../../../contexts/DataContext';
import { db } from '../../../services/db';
import { formatDate, getStoreHealth, healthColors, priorityColors } from '../../../utils/helpers';

const StoreProfile = ({ store, onBack, onEdit, onUpdateStore }) => {
    const { visits, tasks, dispatch } = useContext(DataContext);
    const { openVisitDialog, openTaskDialog } = useOutletContext();
    const onAddVisit = (id) => openVisitDialog(id);
    const onAddTask = (id) => openTaskDialog(id);
    const t = useTranslation();
    const { showToast } = useContext(ToastContext);
    const health = getStoreHealth(store.last_visit);
    const daysSinceVisit = store.last_visit
        ? Math.floor((Date.now() - new Date(store.last_visit).getTime()) / (1000 * 60 * 60 * 24))
        : null;

    // State
    const [showContactForm, setShowContactForm] = useState(false);
    const [newContact, setNewContact] = useState({ name: '', role: 'Cashier', phone: '' });
    const [confirmDeleteContact, setConfirmDeleteContact] = useState(null);
    const [filterType, setFilterType] = useState('all'); // 'all', 'visit', 'task'

    // Get visits for this store
    const storeVisits = visits.filter(v => v.store_id === store.id).map(v => ({ ...v, type_record: 'visit' }));
    const storeTasks = tasks.filter(t => t.store_id === store.id).map(t => ({ ...t, type_record: 'task' }));

    // Helper: Group by Date
    const getRelativeDateGroup = (dateStr) => {
        const date = new Date(dateStr);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) return 'Today';
        if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';

        const diffDays = Math.floor((today - date) / (1000 * 60 * 60 * 24));
        if (diffDays <= 7) return 'This Week';
        if (diffDays <= 30) return 'This Month';
        return 'Older';
    };

    // Prepare & Filter Data
    const rawTimelineData = [...storeVisits, ...storeTasks].sort((a, b) => {
        const dateA = a.type_record === 'visit' ? new Date(a.date) : new Date(a.due_date || a.created_at);
        const dateB = b.type_record === 'visit' ? new Date(b.date) : new Date(b.due_date || b.created_at);
        return dateB - dateA;
    });

    const filteredData = rawTimelineData.filter(item => {
        if (filterType === 'all') return true;
        return item.type_record === filterType;
    });

    // Group Data
    const groupedData = filteredData.reduce((groups, item) => {
        const date = item.type_record === 'visit' ? item.date : (item.due_date || item.created_at);
        const group = getRelativeDateGroup(date);
        if (!groups[group]) groups[group] = [];
        groups[group].push(item);
        return groups;
    }, {});

    const groupOrder = ['Today', 'Yesterday', 'This Week', 'This Month', 'Older'];


    // Handlers
    const handleAddContact = async () => {
        if (!newContact.name || !newContact.phone) {
            showToast('Please fill all fields', 'error');
            return;
        }
        const updatedContacts = [...(store.contacts || []), newContact];
        const table = await db.from('stores');
        await table.update(store.id, { contacts: updatedContacts });
        if (onUpdateStore) onUpdateStore({ ...store, contacts: updatedContacts });
        setNewContact({ name: '', role: 'Cashier', phone: '' });
        setShowContactForm(false);
        showToast(t('savedSuccess'), 'success');
    };

    const handleDeleteContact = async (idx) => {
        const updatedContacts = store.contacts.filter((_, i) => i !== idx);
        const table = await db.from('stores');
        await table.update(store.id, { contacts: updatedContacts });
        if (onUpdateStore) onUpdateStore({ ...store, contacts: updatedContacts });
        setConfirmDeleteContact(null);
        showToast(t('deletedSuccess'), 'success');
    };

    const handleToggleTask = async (task) => {
        const newStatus = task.status === 'done' ? 'pending' : 'done';

        // Optimistic Update
        dispatch({
            type: 'UPDATE_TASK',
            payload: { id: task.id, status: newStatus }
        });

        // DB Update
        try {
            const table = await db.from('tasks');
            await table.update(task.id, { status: newStatus });
            showToast(newStatus === 'done' ? 'Task completed! 🎉' : 'Task pending', 'success');
        } catch (error) {
            console.error(error);
            showToast('Failed to update task', 'error');
            // Revert on error would be ideal here
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        showToast('Copied to clipboard', 'success');
    };

    // Stats
    const thisMonthVisits = storeVisits.filter(v => {
        const visitDate = new Date(v.date);
        const now = new Date();
        return visitDate.getMonth() === now.getMonth() && visitDate.getFullYear() === now.getFullYear();
    }).length;

    const pendingTasks = storeTasks.filter(t => t.status === 'pending');
    const completedTasks = storeTasks.filter(t => t.status === 'done');


    return (
        <div className="space-y-6">
            {/* Back Button */}
            <button onClick={onBack} className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-emerald-600">
                <ChevronRight size={20} className="rotate-180" />
                <span>{t('back')}</span>
            </button>

            {/* Header Card */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden">
                <div className={`h-3 ${healthColors[health]}`} />
                <div className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-2xl font-bold dark:text-white">{store.name}</h1>
                                {store.store_code && (
                                    <div
                                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-sm font-mono cursor-pointer hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors border border-emerald-200 dark:border-emerald-800"
                                        onClick={() => copyToClipboard(store.store_code)}
                                        title="Click to copy Store Code"
                                    >
                                        <Hash size={14} />
                                        <span className="font-bold">{store.store_code}</span>
                                        <Copy size={12} className="ml-1 opacity-60" />
                                    </div>
                                )}
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 mt-1">
                                {store.zone}{store.area_name ? ` - ${store.area_name}` : ''} • {store.category}
                            </p>

                            <div className="flex gap-2 mt-3">
                                {store.has_pos && (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                                        <CreditCard size={14} />
                                        POS System
                                    </span>
                                )}
                                {store.has_sim_card && (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                                        <Smartphone size={14} />
                                        Sim Cards
                                    </span>
                                )}
                            </div>

                            {store.pinned_note && (
                                <p className="mt-2 text-sm bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-3 py-1 rounded-lg inline-block">
                                </p>
                            )}

                            {store.pinned_note && (
                                <p className="mt-2 text-sm bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-3 py-1 rounded-lg inline-block">
                                    📌 {store.pinned_note}
                                </p>
                            )}

                            {/* Active Offers Badges */}
                            {Array.isArray(store.offers) && store.offers.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-3">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block w-full mb-1">Active Offers</span>
                                    {store.offers.map((offer, idx) => (
                                        <span key={idx} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                                            <Tag size={12} />
                                            {offer}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <span className={`px-3 py-1 rounded-lg text-sm text-white ${store.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-500'}`}>
                                {store.status}
                            </span>
                            <span className={`px-3 py-1 rounded-lg text-sm text-white ${healthColors[health]}`}>
                                {daysSinceVisit !== null ? `${daysSinceVisit} ${t('daysAgo')}` : t('neverVisited')}
                            </span>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t dark:border-slate-700">
                        <button onClick={() => window.open(`tel:${store.phone}`)}
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-xl hover:bg-emerald-200">
                            <Phone size={18} />{t('call')}
                        </button>
                        {store.phone && (
                            <button onClick={() => window.open(`https://wa.me/${store.phone.replace(/[^0-9]/g, '')}`)}
                                className="flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-xl hover:bg-green-200">
                                <Phone size={18} />WhatsApp
                            </button>
                        )}
                        <button onClick={onEdit}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200">
                            <Edit2 size={18} />{t('edit')}
                        </button>
                        <button onClick={async () => {
                            const newStatus = store.status === 'Active' ? 'Closed' : 'Active';
                            const table = await db.from('stores');
                            await table.update(store.id, { status: newStatus });
                            if (onUpdateStore) onUpdateStore({ ...store, status: newStatus });
                            showToast(`Store marked as ${newStatus}`, 'success');
                        }}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${store.status === 'Active' ? 'bg-red-50 dark:bg-red-900/20 text-red-600 hover:bg-red-100' : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 hover:bg-emerald-200'}`}>
                            {store.status === 'Active' ? '🛑 Close Store' : '✅ Activate Store'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 text-center shadow">
                    <p className="text-2xl font-bold text-emerald-600">{storeVisits.length}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{t('visits')}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 text-center shadow">
                    <p className="text-2xl font-bold text-emerald-600">{thisMonthVisits}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{t('thisMonth')}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 text-center shadow">
                    <p className="text-2xl font-bold text-amber-600">{pendingTasks.length}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{t('pendingTasks')}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 text-center shadow">
                    <p className="text-2xl font-bold text-slate-600">{completedTasks.length}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{t('done')}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Contact & Quick Actions */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Contact Info */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold dark:text-white flex items-center gap-2">
                                <User size={20} className="text-emerald-600" />
                                {t('owner')} & {t('contactRoles')}
                            </h3>
                            <button onClick={() => setShowContactForm(!showContactForm)}
                                className="flex items-center gap-1 px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-lg text-sm hover:bg-emerald-200">
                                <Plus size={16} />{t('addContact')}
                            </button>
                        </div>

                        {showContactForm && (
                            <div className="mb-4 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border-2 border-dashed border-emerald-300 space-y-3">
                                <input
                                    type="text"
                                    placeholder={t('contactName')}
                                    value={newContact.name}
                                    onChange={e => setNewContact({ ...newContact, name: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                />
                                <div className="grid grid-cols-2 gap-2">
                                    <select
                                        value={newContact.role}
                                        onChange={e => setNewContact({ ...newContact, role: e.target.value })}
                                        className="px-3 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                    >
                                        <option value="Cashier">{t('cashier')}</option>
                                        <option value="Accountant">{t('accountant')}</option>
                                        <option value="Manager">{t('manager')}</option>
                                    </select>
                                    <input
                                        type="tel"
                                        placeholder={t('phone')}
                                        value={newContact.phone}
                                        onChange={e => setNewContact({ ...newContact, phone: e.target.value })}
                                        className="px-3 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={handleAddContact}
                                        className="flex-1 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
                                        {t('save')}
                                    </button>
                                    <button onClick={() => { setShowContactForm(false); setNewContact({ name: '', role: 'Cashier', phone: '' }); }}
                                        className="flex-1 py-2 bg-slate-200 dark:bg-slate-700 dark:text-white rounded-lg">
                                        {t('cancel')}
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-xl">
                                <div>
                                    <p className="font-medium dark:text-white">{store.owner}</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">{t('owner')}</p>
                                </div>
                                <div className="flex gap-1">
                                    <button onClick={() => window.open(`tel:${store.phone}`)} className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-lg">
                                        <Phone size={16} />
                                    </button>
                                </div>
                            </div>
                            {store.contacts && store.contacts.map((contact, idx) => (
                                contact.name !== store.owner && (
                                    <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-xl">
                                        <div>
                                            <p className="font-medium dark:text-white">{contact.name}</p>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">{contact.role} • {contact.phone}</p>
                                        </div>
                                        <div className="flex gap-1">
                                            <button onClick={() => window.open(`tel:${contact.phone}`)} className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-lg">
                                                <Phone size={16} />
                                            </button>
                                            <button onClick={() => handleDeleteContact(idx)} className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-lg hover:bg-red-200">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                )
                            ))}
                            {store.address && (
                                <div className="p-3 bg-slate-50 dark:bg-slate-700 rounded-xl">
                                    <p className="text-sm text-slate-500 dark:text-slate-400">{t('address')}</p>
                                    <p className="font-medium dark:text-white">{store.address}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Add */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6">
                        <h3 className="text-lg font-bold mb-4 dark:text-white">Quick Actions</h3>
                        <div className="space-y-3">
                            <button onClick={() => onAddVisit(store.id)}
                                className="w-full flex items-center justify-center gap-2 p-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-xl hover:bg-emerald-100 border-2 border-dashed border-emerald-300 transition-colors">
                                <Calendar size={20} />
                                <span className="font-medium">{t('newVisit')}</span>
                            </button>
                            <button onClick={() => onAddTask(store.id)}
                                className="w-full flex items-center justify-center gap-2 p-4 bg-teal-50 dark:bg-purple-900/20 text-teal-600 rounded-xl hover:bg-teal-100 border-2 border-dashed border-teal-300 transition-colors">
                                <CheckSquare size={20} />
                                <span className="font-medium">{t('newTask')}</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Column: Unified Timeline */}
                <div className="lg:col-span-2">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 min-h-[500px]">
                        {/* Timeline Header with Filters */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                            <h3 className="text-lg font-bold dark:text-white flex items-center gap-2">
                                <Clock size={20} className="text-emerald-600" />
                                Activity Timeline
                            </h3>
                            <div className="flex p-1 bg-slate-100 dark:bg-slate-700 rounded-lg">
                                {['all', 'visit', 'task'].map(type => (
                                    <button
                                        key={type}
                                        onClick={() => setFilterType(type)}
                                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${filterType === type
                                            ? 'bg-white dark:bg-slate-600 text-emerald-600 shadow-sm'
                                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                                            }`}
                                    >
                                        {/* Capitalize first letter */}
                                        {type.charAt(0).toUpperCase() + type.slice(1) + (type === 'all' ? '' : 's')}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Timeline Content */}
                        {filteredData.length > 0 ? (
                            <div className="ml-2 space-y-6">
                                {groupOrder.map(group => {
                                    const items = groupedData[group];
                                    if (!items) return null;

                                    return (
                                        <div key={group}>
                                            <div className="flex items-center gap-3 mb-4">
                                                <span className="px-3 py-1 text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-700/50 dark:text-slate-400 rounded-full">
                                                    {group}
                                                </span>
                                                <div className="h-px flex-1 bg-slate-100 dark:bg-slate-700"></div>
                                            </div>

                                            <div className="space-y-0">
                                                {items.map((item, index) => {
                                                    const isVisit = item.type_record === 'visit';
                                                    return (
                                                        <div key={item.id || index} className="relative pl-8 pb-8 border-l-2 border-slate-200 dark:border-slate-700 last:border-0 last:pb-0">
                                                            {/* Connector Dot */}
                                                            <div className={`absolute -left-[9px] top-4 w-4 h-4 rounded-full ring-4 ring-white dark:ring-slate-800 ${isVisit ? 'bg-emerald-500' : 'bg-amber-500'}`} />

                                                            <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700 hover:shadow-md transition-shadow group">
                                                                <div className="flex justify-between items-start mb-2">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${isVisit ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'}`}>
                                                                            {isVisit ? t('visit') : t('task')}
                                                                        </span>
                                                                        <span className="text-sm text-slate-500 dark:text-slate-400">
                                                                            {new Date(isVisit ? item.date : item.due_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                        </span>
                                                                        {/* Simulated User Attribution */}
                                                                        <span className="text-xs text-slate-400 flex items-center gap-1">
                                                                            • By You
                                                                        </span>
                                                                    </div>
                                                                    {isVisit ? (
                                                                        <div className="flex gap-2">
                                                                            {item.status === 'completed' && (
                                                                                <span className={`px-2 py-1 rounded-md text-xs border ${item.is_effective
                                                                                    ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800'
                                                                                    : 'bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-800 dark:border-slate-600'}`}>
                                                                                    {item.is_effective ? '✓ User Interested' : '✗ No Sale'}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    ) : (
                                                                        <div className="flex items-center gap-2">
                                                                            {/* Quick Action Toggle */}
                                                                            <button
                                                                                onClick={() => handleToggleTask(item)}
                                                                                className={`p-1 rounded-full transition-colors ${item.status === 'done' ? 'text-emerald-500 hover:bg-emerald-50' : 'text-slate-300 hover:text-slate-500 hover:bg-slate-100'}`}
                                                                                title={item.status === 'done' ? "Mark as pending" : "Mark as done"}
                                                                            >
                                                                                {item.status === 'done' ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                                                                            </button>
                                                                            <span className={`px-2 py-1 rounded-md text-xs text-white ${priorityColors[item.priority]}`}>
                                                                                {t(item.priority)}
                                                                            </span>
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                {isVisit ? (
                                                                    <div>
                                                                        <p className="font-semibold text-slate-800 dark:text-slate-200 text-lg mb-1">{item.type}</p>
                                                                        {item.notes && (
                                                                            <p className="text-slate-600 dark:text-slate-400 text-sm bg-white dark:bg-slate-800 p-2 rounded-lg border dark:border-slate-600">
                                                                                "{item.notes}"
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                ) : (
                                                                    <div>
                                                                        <div className="flex items-center gap-2 mb-1">
                                                                            <p className={`font-semibold text-lg transition-all ${item.status === 'done' ? 'line-through text-slate-400 decoration-slate-400' : 'text-slate-800 dark:text-slate-200'}`}>
                                                                                {item.sub}
                                                                            </p>
                                                                        </div>
                                                                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">{item.cat}</p>
                                                                        {item.notes && (
                                                                            <p className="text-slate-600 dark:text-slate-400 text-sm bg-white dark:bg-slate-800 p-2 rounded-lg border dark:border-slate-600">
                                                                                "{item.notes}"
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400">
                                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700/50 rounded-full flex items-center justify-center mb-4">
                                    <Filter size={32} className="opacity-50" />
                                </div>
                                <p className="text-lg font-medium text-slate-500 dark:text-slate-300">No {filterType}s found</p>
                                <p className="text-sm max-w-xs mx-auto mt-1">
                                    {filterType === 'all' ? "Start by adding a visit or task." : `Try changing the filter or add a new ${filterType}.`}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Location Picker Modal - Removed */}
        </div>
    );
};

export default StoreProfile;
