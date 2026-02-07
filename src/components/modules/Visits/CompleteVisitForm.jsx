import React, { useState } from 'react';
import { CheckCircle, AlertTriangle, Star, MessageSquare } from 'lucide-react';
import useTranslation from '../../../hooks/useTranslation';

const CompleteVisitForm = ({ visit, onComplete, onCancel }) => {
    const t = useTranslation();
    const [isEffective, setIsEffective] = useState(true);
    const [createFollowUp, setCreateFollowUp] = useState(false);
    const [rating, setRating] = useState(0);
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleComplete = async () => {
        setIsSubmitting(true);
        try {
            await onComplete(visit, isEffective, createFollowUp, { rating, notes });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-4">
            {/* Visit Effectiveness */}
            <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-xl">
                <label className="flex items-center gap-3 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={isEffective}
                        onChange={e => setIsEffective(e.target.checked)}
                        className="w-5 h-5 rounded accent-emerald-600"
                    />
                    <span className="dark:text-white font-medium">{t('isEffective')}</span>
                </label>
                <div className={`mt-2 flex items-center gap-2 text-sm ${isEffective ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {isEffective ? (
                        <>
                            <CheckCircle size={16} />
                            <span>Store health will be updated</span>
                        </>
                    ) : (
                        <>
                            <AlertTriangle size={16} />
                            <span>Store health will NOT be updated</span>
                        </>
                    )}
                </div>
            </div>

            {/* Rating */}
            <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-xl">
                <label className="block text-sm font-medium dark:text-slate-300 mb-2">
                    Visit Rating
                </label>
                <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(star => (
                        <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            className={`p-1 transition-colors ${star <= rating ? 'text-amber-400' : 'text-slate-300 dark:text-slate-600'
                                } hover:text-amber-400`}
                        >
                            <Star size={28} fill={star <= rating ? 'currentColor' : 'none'} />
                        </button>
                    ))}
                </div>
                {rating > 0 && (
                    <p className="text-sm text-slate-500 mt-1">
                        {rating === 5 ? 'Excellent!' :
                            rating >= 4 ? 'Very Good' :
                                rating >= 3 ? 'Good' :
                                    rating >= 2 ? 'Fair' : 'Poor'}
                    </p>
                )}
            </div>

            {/* Completion Notes */}
            <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-xl">
                <label className="flex items-center gap-2 text-sm font-medium dark:text-slate-300 mb-2">
                    <MessageSquare size={16} />
                    Completion Notes
                </label>
                <textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    rows={2}
                    placeholder="What happened during the visit?"
                    className="w-full px-3 py-2 border rounded-lg dark:bg-slate-600 dark:border-slate-500 dark:text-white text-sm resize-none"
                />
            </div>

            {/* Create Follow-up */}
            <div className="p-4 bg-teal-50 dark:bg-purple-900/20 rounded-xl border border-teal-200 dark:border-teal-800">
                <label className="flex items-center gap-3 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={createFollowUp}
                        onChange={e => setCreateFollowUp(e.target.checked)}
                        className="w-5 h-5 rounded accent-teal-600"
                    />
                    <div>
                        <span className="dark:text-white font-medium">{t('createFollowUp')}</span>
                        <p className="text-xs text-teal-600 dark:text-teal-400">
                            A follow-up task will be created automatically
                        </p>
                    </div>
                </label>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
                <button
                    onClick={handleComplete}
                    disabled={isSubmitting}
                    className="flex-1 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isSubmitting ? (
                        <>
                            <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                            Completing...
                        </>
                    ) : (
                        <>
                            <CheckCircle size={18} />
                            {t('complete')}
                        </>
                    )}
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

export default CompleteVisitForm;
