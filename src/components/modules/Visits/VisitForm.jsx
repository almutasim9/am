import React, { useState, useContext } from 'react';
import { AlertCircle, Calendar, Clock } from 'lucide-react';
import useTranslation from '../../../hooks/useTranslation';
import { LangContext } from '../../../contexts/AppContext';
import { safeValidate, visitSchema } from '../../../utils/validation';
import StoreSearchCombobox from '../../common/StoreSearchCombobox';

const VisitForm = ({ visit, stores, settings, onSave, onCancel }) => {
    const t = useTranslation();
    const { lang } = useContext(LangContext);
    const [form, setForm] = useState(visit || {
        store_id: '',
        date: '',
        type: 'Visit',
        note: '',
        status: 'scheduled',
        is_effective: null
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Get selected store info
    const selectedStore = stores.find(s => s.id === form.store_id);

    // Smart Date Chips - Translated
    const dateChips = [
        { label: 'Today', days: 0 },
        { label: 'Tomorrow', days: 1 },
        { label: 'Day after', days: 2 },
        { label: 'Next week', days: 7 }
    ];

    const setQuickDate = (days) => {
        const d = new Date();
        d.setDate(d.getDate() + days);
        setForm({ ...form, date: d.toISOString() });
        if (errors.date) setErrors({ ...errors, date: null });
    };

    const handleSubmit = async () => {
        // Validate form
        const validation = safeValidate(visitSchema, form);

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
        setForm({ ...form, [field]: value });
        if (errors[field]) {
            setErrors({ ...errors, [field]: null });
        }
    };

    return (
        <div className="space-y-4">
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
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle size={12} /> {errors.store_id}
                    </p>
                )}
            </div>

            {/* Visit Type and Date */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium dark:text-slate-300 mb-1">
                        {t('visitType')} <span className="text-red-500">*</span>
                    </label>
                    <select
                        value={form.type}
                        onChange={e => handleFieldChange('type', e.target.value)}
                        className={`w-full px-4 py-2 border rounded-xl dark:bg-slate-700 dark:border-slate-600 dark:text-white ${errors.type ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : ''
                            }`}
                    >
                        {(settings?.visitTypes || []).map(vt => (
                            <option key={vt} value={vt}>{vt}</option>
                        ))}
                    </select>
                    {errors.type && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                            <AlertCircle size={12} /> {errors.type}
                        </p>
                    )}
                </div>
                <div>
                    <label className="block text-sm font-medium dark:text-slate-300 mb-1">
                        {t('visitReason')}
                    </label>
                    <select
                        value={form.reason || ''}
                        onChange={e => handleFieldChange('reason', e.target.value)}
                        className="w-full px-4 py-2 border rounded-xl dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    >
                        <option value="">{t('select')}...</option>
                        {(settings?.visitReasons || []).map(vr => (
                            <option key={vr} value={vr}>{vr}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Due Date */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium dark:text-slate-300 mb-1">
                        {t('dueDate')} <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="date"
                        value={form.date?.split('T')[0] || ''}
                        onChange={e => handleFieldChange('date', e.target.value)}
                        className={`w-full px-4 py-2 border rounded-xl dark:bg-slate-700 dark:border-slate-600 dark:text-white ${errors.date ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : ''
                            }`}
                    />
                    {errors.date && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                            <AlertCircle size={12} /> {errors.date}
                        </p>
                    )}
                </div>
            </div>

            {/* Smart Date Chips */}
            <div className="flex gap-2 flex-wrap items-center">
                <Calendar size={16} className="text-slate-400" />
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

            {/* Note */}
            <div>
                <label className="block text-sm font-medium dark:text-slate-300 mb-1">{t('note')}</label>
                <textarea
                    value={form.note}
                    onChange={e => handleFieldChange('note', e.target.value)}
                    rows={3}
                    placeholder="Additional notes for the visit..."
                    className="w-full px-4 py-2 border rounded-xl dark:bg-slate-700 dark:border-slate-600 dark:text-white resize-none"
                />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
                <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isSubmitting ? (
                        <>
                            <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                            Saving...
                        </>
                    ) : t('save')}
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

export default VisitForm;
