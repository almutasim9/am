import React, { useState, useContext } from 'react';
import { AlertCircle, Store, MapPin, User, Phone as PhoneIcon, Map, FileText, CreditCard, Smartphone, Check, Tag as TagIcon } from 'lucide-react';
import useTranslation from '../../../hooks/useTranslation';
import { LangContext } from '../../../contexts/AppContext';
import { safeValidate, storeSchema } from '../../../utils/validation';

const StoreForm = ({ store, settings, onSave, onCancel }) => {
    const t = useTranslation();
    const { lang } = useContext(LangContext);
    const [form, setForm] = useState(store ? { ...store, store_code: store.store_code || store.id } : {
        store_code: '', // كود المتجر الظاهر للمستخدم
        name: '',
        zone: '',
        area_name: '',
        category: '',
        owner: '',
        phone: '',
        address: '',
        map_link: '',
        status: 'Active',
        last_visit: '',
        pinned_note: '',
        contacts: [],
        has_pos: false,
        has_sim_card: false
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeSection, setActiveSection] = useState('basic'); // 'basic', 'location', 'contact'
    const [coordsExtracted, setCoordsExtracted] = useState(false);

    // Helper: Extract coordinates from Google Maps URL
    const extractCoordinates = (url) => {
        if (!url) return { coords: null, isShort: false };

        const isShort = url.includes('maps.app.goo.gl') || url.includes('goo.gl/maps');

        // Pattern 1: !3dLat!4dLng format (more accurate place location)
        const d3Pattern = /!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/;
        const d3Match = url.match(d3Pattern);
        if (d3Match) {
            return { coords: { lat: parseFloat(d3Match[1]), lng: parseFloat(d3Match[2]) }, isShort };
        }

        // Pattern 2: @lat,lng format (map view center)
        const atPattern = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
        const atMatch = url.match(atPattern);
        if (atMatch) {
            return { coords: { lat: parseFloat(atMatch[1]), lng: parseFloat(atMatch[2]) }, isShort };
        }

        // Pattern 3: ?q=lat,lng format
        const qPattern = /[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/;
        const qMatch = url.match(qPattern);
        if (qMatch) {
            return { coords: { lat: parseFloat(qMatch[1]), lng: parseFloat(qMatch[2]) }, isShort };
        }

        // Pattern 4: /place/lat,lng format
        const placePattern = /\/place\/(-?\d+\.\d+),(-?\d+\.\d+)/;
        const placeMatch = url.match(placePattern);
        if (placeMatch) {
            return { coords: { lat: parseFloat(placeMatch[1]), lng: parseFloat(placeMatch[2]) }, isShort };
        }

        // Pattern 5: center=lat,lng format
        const centerPattern = /[?&]center=(-?\d+\.\d+),(-?\d+\.\d+)/;
        const centerMatch = url.match(centerPattern);
        if (centerMatch) {
            return { coords: { lat: parseFloat(centerMatch[1]), lng: parseFloat(centerMatch[2]) }, isShort };
        }

        return { coords: null, isShort };
    };

    const handleSubmit = async () => {
        // Validate form
        const validation = safeValidate(storeSchema, form);

        if (!validation.success) {
            setErrors(validation.errors);
            // Switch to section with errors
            if (validation.errors.store_code || validation.errors.name || validation.errors.category || validation.errors.status) {
                setActiveSection('basic');
            } else if (validation.errors.zone || validation.errors.address) {
                setActiveSection('location');
            } else if (validation.errors.owner || validation.errors.phone) {
                setActiveSection('contact');
            }
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
        let updatedForm = { ...form, [field]: value };

        // Auto-extract coordinates when map_link changes
        if (field === 'map_link' && value) {
            const { coords, isShort } = extractCoordinates(value);
            if (coords) {
                updatedForm.lat = coords.lat;
                updatedForm.lng = coords.lng;
                setCoordsExtracted(true);
            } else {
                setCoordsExtracted(false);
            }
            // Store if it's a short link for UI feedback
            setForm(prev => ({ ...prev, is_short_link: isShort }));
        }

        setForm(updatedForm);
        if (errors[field]) {
            setErrors({ ...errors, [field]: null });
        }
    };

    const SectionTab = ({ id, icon: Icon, label }) => (
        <button
            type="button"
            onClick={() => setActiveSection(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeSection === id
                ? 'bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 shadow-sm'
                : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
        >
            <Icon size={16} />
            {label}
        </button>
    );

    return (
        <div className="space-y-4">
            {/* Section Tabs */}
            <div className="flex gap-2 flex-wrap border-b dark:border-slate-700 pb-3">
                <SectionTab id="basic" icon={Store} label="Basic Info" />
                <SectionTab id="location" icon={MapPin} label="Location" />
                <SectionTab id="contact" icon={User} label="Contact" />
            </div>

            {/* Basic Info Section */}
            {activeSection === 'basic' && (
                <div className="space-y-4 animate-fadeIn">
                    {/* Store Code - كود المتجر */}
                    <div>
                        <label className="block text-sm font-medium dark:text-slate-300 mb-1">
                            Store Code <span className="text-red-500">*</span>
                            <span className="text-xs text-slate-400 ml-2">(5 أرقام)</span>
                        </label>
                        <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={5}
                            value={form.store_code || ''}
                            onChange={e => {
                                // Allow only numbers
                                const value = e.target.value.replace(/\D/g, '');
                                handleFieldChange('store_code', value);
                            }}
                            placeholder="12345"
                            dir="ltr"
                            className={`w-full px-4 py-2 border rounded-xl dark:bg-slate-700 dark:border-slate-600 dark:text-white font-mono text-lg tracking-widest ${errors.store_code ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : ''}`}
                        />
                        {errors.store_code && (
                            <p className="text-red-500 text-xs mt-1 flex items-center gap-1 font-bold">
                                <AlertCircle size={12} /> {errors.store_code}
                            </p>
                        )}
                        <p className="text-slate-400 text-xs mt-1">💡 كود فريد مكون من 5 أرقام</p>
                    </div>

                    {/* Store Name */}
                    <div>
                        <label className="block text-sm font-medium dark:text-slate-300 mb-1">
                            {t('name')} <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={e => handleFieldChange('name', e.target.value)}
                            placeholder="Store name"
                            className={`w-full px-4 py-2 border rounded-xl dark:bg-slate-700 dark:border-slate-600 dark:text-white ${errors.name ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : ''
                                }`}
                        />
                        {errors.name && (
                            <p className="text-red-500 text-xs mt-1 flex items-center gap-1 font-bold">
                                <AlertCircle size={12} /> {errors.name}
                            </p>
                        )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium dark:text-slate-300 mb-1">
                                {t('category')} <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={form.category}
                                onChange={e => handleFieldChange('category', e.target.value)}
                                className={`w-full px-4 py-2 border rounded-xl dark:bg-slate-700 dark:border-slate-600 dark:text-white ${errors.category ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : ''
                                    }`}
                            >
                                <option value="">-- {t('category')} --</option>
                                {(settings?.storeCategories || []).map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                            {errors.category && (
                                <p className="text-red-500 text-xs mt-1 flex items-center gap-1 font-bold">
                                    <AlertCircle size={12} /> {errors.category}
                                </p>
                            )}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium dark:text-slate-300 mb-1">
                            <FileText size={14} className="inline mr-1" />
                            Pinned Note
                        </label>
                        <textarea
                            value={form.pinned_note || ''}
                            onChange={e => handleFieldChange('pinned_note', e.target.value)}
                            rows={2}
                            placeholder="Note that appears on store profile..."
                            className="w-full px-4 py-2 border rounded-xl dark:bg-slate-700 dark:border-slate-600 dark:text-white resize-none"
                        />
                    </div>

                    {/* Features Toggles */}
                    <div className="flex gap-3 pt-2">
                        <div
                            onClick={() => handleFieldChange('has_pos', !form.has_pos)}
                            className={`flex-1 cursor-pointer px-4 py-2.5 rounded-xl border transition-all flex items-center gap-3 ${form.has_pos ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800'}`}
                        >
                            <div className={`p-1.5 rounded-lg ${form.has_pos ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}>
                                <CreditCard size={16} />
                            </div>
                            <div className="flex-1">
                                <span className={`text-sm font-semibold block ${form.has_pos ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400'}`}>
                                    POS System
                                </span>
                            </div>
                            {form.has_pos && <Check size={16} className="text-emerald-600 dark:text-emerald-400" />}
                        </div>

                        <div
                            onClick={() => handleFieldChange('has_sim_card', !form.has_sim_card)}
                            className={`flex-1 cursor-pointer px-4 py-2.5 rounded-xl border transition-all flex items-center gap-3 ${form.has_sim_card ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800'}`}
                        >
                            <div className={`p-1.5 rounded-lg ${form.has_sim_card ? 'bg-blue-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}>
                                <Smartphone size={16} />
                            </div>
                            <div className="flex-1">
                                <span className={`text-sm font-semibold block ${form.has_sim_card ? 'text-blue-700 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400'}`}>
                                    Sim Cards
                                </span>
                            </div>
                            {form.has_sim_card && <Check size={16} className="text-blue-600 dark:text-blue-400" />}
                        </div>
                    </div>

                    {/* Active Offers Selection */}
                    <div className="pt-4 border-t dark:border-slate-700">
                        <label className="block text-sm font-bold dark:text-slate-300 mb-2">
                            <TagIcon size={14} className="inline mr-1" />
                            Active Offers (Subscriptions)
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {(settings?.offerTypes || ["خصومات يومية", "TSN", "T+", "Winback", "punchcard", "camping"]).map(offer => {
                                const isActive = Array.isArray(form.offers) && form.offers.includes(offer);
                                return (
                                    <button
                                        key={offer}
                                        type="button"
                                        onClick={() => {
                                            const currentOffers = Array.isArray(form.offers) ? form.offers : [];
                                            const newOffers = isActive
                                                ? currentOffers.filter(o => o !== offer)
                                                : [...currentOffers, offer];
                                            handleFieldChange('offers', newOffers);
                                        }}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${isActive
                                            ? 'bg-amber-100 border-amber-500 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                                            : 'bg-slate-50 border-slate-200 text-slate-500 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-400'
                                            }`}
                                    >
                                        {offer}
                                    </button>
                                );
                            })}
                        </div>
                        <p className="text-[10px] text-slate-400 mt-2 italic">Select the offers this store is currently subscribed to.</p>
                    </div>
                </div >
            )}

            {/* Location Section */}
            {
                activeSection === 'location' && (
                    <div className="space-y-4 animate-fadeIn">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium dark:text-slate-300 mb-1">
                                    {t('zone')} <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={form.zone}
                                    onChange={e => handleFieldChange('zone', e.target.value)}
                                    className={`w-full px-4 py-2 border rounded-xl dark:bg-slate-700 dark:border-slate-600 dark:text-white ${errors.zone ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : ''
                                        }`}
                                >
                                    <option value="">-- {t('zone')} --</option>
                                    {(settings?.zones || []).map(z => <option key={z} value={z}>{z}</option>)}
                                </select>
                                {errors.zone && (
                                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1 font-bold">
                                        <AlertCircle size={12} /> {errors.zone}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium dark:text-slate-300 mb-1">
                                    {t('areaName')} <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={form.area_name || ''}
                                    onChange={e => handleFieldChange('area_name', e.target.value)}
                                    placeholder="اسم المنطقة"
                                    className={`w-full px-4 py-2 border rounded-xl dark:bg-slate-700 dark:border-slate-600 dark:text-white ${errors.area_name ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : ''}`}
                                />
                                {errors.area_name && (
                                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1 font-bold">
                                        <AlertCircle size={12} /> {errors.area_name}
                                    </p>
                                )}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium dark:text-slate-300 mb-1">
                                {t('address')} <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={form.address || ''}
                                onChange={e => handleFieldChange('address', e.target.value)}
                                placeholder="العنوان التفصيلي"
                                className={`w-full px-4 py-2 border rounded-xl dark:bg-slate-700 dark:border-slate-600 dark:text-white ${errors.address ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : ''}`}
                            />
                            {errors.address && (
                                <p className="text-red-500 text-xs mt-1 flex items-center gap-1 font-bold">
                                    <AlertCircle size={12} /> {errors.address}
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium dark:text-slate-300 mb-1">
                                <Map size={14} className="inline mr-1" />
                                {t('mapLink')}
                            </label>
                            <input
                                type="url"
                                value={form.map_link || ''}
                                onChange={e => handleFieldChange('map_link', e.target.value)}
                                placeholder="https://maps.google.com/... (paste full URL)"
                                className={`w-full px-4 py-2 border rounded-xl dark:bg-slate-700 dark:border-slate-600 dark:text-white ${errors.map_link ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : ''
                                    }`}
                            />
                            {errors.map_link && (
                                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                    <AlertCircle size={12} /> {errors.map_link}
                                </p>
                            )}
                            {/* Coordinate extraction feedback */}
                            {form.map_link && (
                                <div className="mt-2 space-y-1">
                                    {coordsExtracted && form.lat ? (
                                        <p className="text-emerald-600 text-[11px] flex items-center gap-1 bg-emerald-50 dark:bg-emerald-900/20 p-2 rounded-lg">
                                            ✅ تم استخراج الموقع بنجاح: {form.lat.toFixed(5)}, {form.lng.toFixed(5)}
                                        </p>
                                    ) : form.is_short_link ? (
                                        <div className="text-amber-600 text-[11px] bg-amber-50 dark:bg-amber-900/20 p-2 rounded-lg">
                                            <p className="font-bold mb-1">⚠️ تنبيه: الرابط المختصر لا يحتوي على موقع</p>
                                            <p>روابط (maps.app.goo.gl) لا تظهر الموقع تلقائياً. يرجى:</p>
                                            <ul className="list-disc list-inside mt-1 ml-1">
                                                <li>فتح الرابط في المتصفح ونسخ الرابط الكامل</li>
                                                <li>أو نسخ "رابط تضمين الخريطة" من خرائط جوجل</li>
                                            </ul>
                                        </div>
                                    ) : (
                                        <p className="text-amber-600 text-[11px] flex items-center gap-1 bg-amber-50 dark:bg-amber-900/20 p-2 rounded-lg">
                                            ⚠️ لم يتم استخراج الموقع. يرجى استخدام رابط المتصفح الكامل الذي يحتوي على الإحداثيات (@lat,lng)
                                        </p>
                                    )}
                                </div>
                            )}
                            {form.map_link && !errors.map_link && (
                                <a
                                    href={form.map_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-emerald-600 text-xs mt-1 hover:underline inline-block"
                                >
                                    🔗 Open in Maps
                                </a>
                            )}
                        </div>
                    </div>
                )
            }

            {/* Contact Section */}
            {
                activeSection === 'contact' && (
                    <div className="space-y-4 animate-fadeIn">
                        <div>
                            <label className="block text-sm font-medium dark:text-slate-300 mb-1">
                                {t('owner')} <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={form.owner}
                                onChange={e => handleFieldChange('owner', e.target.value)}
                                placeholder="Owner or manager name"
                                className={`w-full px-4 py-2 border rounded-xl dark:bg-slate-700 dark:border-slate-600 dark:text-white ${errors.owner ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : ''
                                    }`}
                            />
                            {errors.owner && (
                                <p className="text-red-500 text-xs mt-1 flex items-center gap-1 font-bold">
                                    <AlertCircle size={12} /> {errors.owner}
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium dark:text-slate-300 mb-1">
                                <PhoneIcon size={14} className="inline mr-1" />
                                {t('phone')} <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="tel"
                                value={form.phone}
                                onChange={e => handleFieldChange('phone', e.target.value)}
                                placeholder="+964 XXX XXX XXXX"
                                dir="ltr"
                                className={`w-full px-4 py-2 border rounded-xl dark:bg-slate-700 dark:border-slate-600 dark:text-white ${errors.phone ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : ''
                                    }`}
                            />
                            {errors.phone && (
                                <p className="text-red-500 text-xs mt-1 flex items-center gap-1 font-bold">
                                    <AlertCircle size={12} /> {errors.phone}
                                </p>
                            )}
                        </div>
                    </div>
                )
            }

            {/* Navigation + Actions */}
            <div className="flex flex-col gap-3 pt-4 border-t dark:border-slate-700">
                {/* Section Navigation */}
                <div className="flex justify-between text-sm">
                    <button
                        type="button"
                        onClick={() => {
                            if (activeSection === 'location') setActiveSection('basic');
                            else if (activeSection === 'contact') setActiveSection('location');
                        }}
                        disabled={activeSection === 'basic'}
                        className="text-primary-600 dark:text-primary-400 font-bold hover:underline disabled:opacity-50 disabled:no-underline"
                    >
                        ← Previous
                    </button>
                    <span className="text-slate-400 font-medium">
                        {activeSection === 'basic' ? '1' : activeSection === 'location' ? '2' : '3'} / 3
                    </span>
                    <button
                        type="button"
                        onClick={() => {
                            if (activeSection === 'basic') setActiveSection('location');
                            else if (activeSection === 'location') setActiveSection('contact');
                        }}
                        disabled={activeSection === 'contact'}
                        className="text-primary-600 dark:text-primary-400 font-bold hover:underline disabled:opacity-50 disabled:no-underline"
                    >
                        Next →
                    </button>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="flex-1 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-primary-500/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
        </div >
    );
};

export default StoreForm;
