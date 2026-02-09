import React, { useState, useContext } from 'react';
import { AlertCircle, Calendar, Save } from 'lucide-react';
import useTranslation from '../../../hooks/useTranslation';
import { LangContext } from '../../../contexts/AppContext';
import { safeValidate, taskSchema } from '../../../utils/validation';
import StoreSearchCombobox from '../../common/StoreSearchCombobox';

const TaskForm = ({ task, stores, settings, onSave, onCancel }) => {
    const t = useTranslation();
    const { lang } = useContext(LangContext);
    const [form, setForm] = useState(task || {
        store_id: '',
        cat: '',
        sub: '',
        priority: 'medium',
        due_date: '',
        description: '',
        status: 'pending'
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const categories = settings?.taskCategories || {};

    // Get selected store info
    const selectedStore = stores.find(s => s.id === form.store_id);

    // Smart Date Chips
    const dateChips = [
        { label: 'Today', days: 0 },
        { label: 'Tomorrow', days: 1 },
        { label: 'In 3 days', days: 3 },
        { label: 'Next week', days: 7 }
    ];

    const setQuickDate = (days) => {
        const d = new Date();
        d.setDate(d.getDate() + days);
        const value = d.toISOString().split('T')[0];
        setForm(prev => ({ ...prev, due_date: value }));
        if (errors.due_date) setErrors(prev => ({ ...prev, due_date: null }));
    };

    const applySmartPreset = (preset) => {
        const d = new Date();
        if (preset === 'call_tomorrow') {
            d.setDate(d.getDate() + 1);
            setForm({ ...form, cat: 'Sales', sub: 'Follow Up Call', priority: 'high', due_date: d.toISOString().split('T')[0] });
        } else if (preset === 'visit_next_week') {
            d.setDate(d.getDate() + 7);
            setForm({ ...form, cat: 'Sales', sub: 'Regular Visit', priority: 'medium', due_date: d.toISOString().split('T')[0] });
        }
        setErrors({});
    };

    const handleSubmit = async () => {
        // Validate form
        const validation = safeValidate(taskSchema, form);

        if (!validation.success) {
            setErrors(validation.errors);
            return;
        }

        setIsSubmitting(true);
        try {
            await onSave(form);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFieldChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: null }));
        }
    };

    return (
        <div className="space-y-4">
            {/* Smart Presets */}
            <div className="grid grid-cols-2 gap-3 mb-2">
                <button
                    onClick={() => applySmartPreset('call_tomorrow')}
                    className="flex items-center justify-center gap-2 p-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl border border-indigo-100 dark:border-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors"
                >
                    <span className="text-lg">📞</span>
                    <div className="text-left leading-tight">
                        <div className="font-bold text-xs">Call Tomorrow</div>
                        <div className="text-[10px] opacity-75">High Priority</div>
                    </div>
                </button>
                <button
                    onClick={() => applySmartPreset('visit_next_week')}
                    className="flex items-center justify-center gap-2 p-3 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-xl border border-primary-100 dark:border-primary-900/30 hover:bg-primary-100 dark:hover:bg-primary-900/40 transition-colors"
                >
                    <span className="text-lg">📅</span>
                    <div className="text-left leading-tight">
                        <div className="font-bold text-xs">Visit Next Week</div>
                        <div className="text-[10px] opacity-75">Regular Visit</div>
                    </div>
                </button>
            </div>

            {/* Store Selection with Autocomplete Search */}
            <div>
                <label className="block text-sm font-medium dark:text-slate-300 mb-1">
                    {t('selectStore')} <span className="text-red-500">*</span>
                </label>
                <StoreSearchCombobox
                    stores={stores}
                    value={form.store_id}
                    onChange={(id) => handleFieldChange('store_id', id)}
                    error={errors.store_id}
                />
                {errors.store_id && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1 font-bold">
                        <AlertCircle size={12} /> {errors.store_id}
                    </p>
                )}
            </div>

            {/* Category and Sub-task */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium dark:text-slate-300 mb-1">
                        {t('category')} <span className="text-red-500">*</span>
                    </label>
                    <select
                        value={form.cat}
                        onChange={e => {
                            const value = e.target.value;
                            setForm(prev => ({ ...prev, cat: value, sub: '' }));
                            if (errors.cat) setErrors(prev => ({ ...prev, cat: null }));
                        }}
                        className={`w-full px-4 py-2 border rounded-xl dark:bg-slate-700 dark:border-slate-600 dark:text-white ${errors.cat ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : ''
                            }`}
                    >
                        <option value="">--</option>
                        {Object.keys(categories).map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    {errors.cat && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1 font-bold">
                            <AlertCircle size={12} /> {errors.cat}
                        </p>
                    )}
                </div>
                <div>
                    <label className="block text-sm font-medium dark:text-slate-300 mb-1">
                        {t('subTask')} <span className="text-red-500">*</span>
                    </label>
                    <select
                        value={form.sub}
                        onChange={e => handleFieldChange('sub', e.target.value)}
                        disabled={!form.cat}
                        className={`w-full px-4 py-2 border rounded-xl dark:bg-slate-700 dark:border-slate-600 dark:text-white disabled:opacity-50 ${errors.sub ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : ''
                            }`}
                    >
                        <option value="">--</option>
                        {(categories[form.cat] || []).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    {errors.sub && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1 font-bold">
                            <AlertCircle size={12} /> {errors.sub}
                        </p>
                    )}
                </div>
            </div>

            {/* Priority and Due Date */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium dark:text-slate-300 mb-1">{t('priority')}</label>
                    <div className="flex gap-2">
                        {['high', 'medium', 'low'].map(p => (
                            <button
                                key={p}
                                type="button"
                                onClick={() => handleFieldChange('priority', p)}
                                className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${form.priority === p
                                    ? p === 'high' ? 'bg-red-500 text-white'
                                        : p === 'medium' ? 'bg-amber-500 text-white'
                                            : 'bg-blue-500 text-white'
                                    : 'bg-slate-100 dark:bg-slate-700 dark:text-slate-300 hover:bg-slate-200'
                                    }`}
                            >
                                {t(p)}
                            </button>
                        ))}
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium dark:text-slate-300 mb-1">
                        {t('dueDate')} <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="date"
                        value={form.due_date?.split('T')[0] || ''}
                        onChange={e => handleFieldChange('due_date', e.target.value)}
                        className={`w-full px-4 py-2 border rounded-xl dark:bg-slate-700 dark:border-slate-600 dark:text-white ${errors.due_date ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : ''
                            }`}
                    />
                    {errors.due_date && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1 font-bold">
                            <AlertCircle size={12} /> {errors.due_date}
                        </p>
                    )}
                </div>
            </div>

            {/* Smart Date Chips */}
            <div className="flex gap-2 flex-wrap">
                <Calendar size={16} className="text-slate-400 mt-1" />
                {dateChips.map((chip) => (
                    <button
                        key={chip.days}
                        type="button"
                        onClick={() => setQuickDate(chip.days)}
                        className="px-3 py-1 text-xs bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors"
                    >
                        {chip.label}
                    </button>
                ))}
            </div>

            {/* Description */}
            <div>
                <label className="block text-sm font-medium dark:text-slate-300 mb-1">{t('description')}</label>
                <textarea
                    value={form.description}
                    onChange={e => handleFieldChange('description', e.target.value)}
                    rows={3}
                    placeholder="Add additional details..."
                    className="w-full px-4 py-2 border rounded-xl dark:bg-slate-700 dark:border-slate-600 dark:text-white resize-none"
                />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
                <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex-1 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-primary-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-95"
                >
                    {isSubmitting ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Save size={20} />}
                    {task?.id ? t('saveChanges') : t('createTask')}
                </button>
                <button
                    onClick={onCancel}
                    disabled={isSubmitting}
                    className="flex-1 py-3 bg-slate-200 dark:bg-slate-700 dark:text-white rounded-xl font-medium hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors disabled:opacity-50"
                >
                    {t('cancel')}
                </button>
            </div>
        </div>
    );
};

export default TaskForm;
