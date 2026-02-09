import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Plus, Store, Tag, Search, Filter, X, Phone, MessageCircle, Edit2, Gift, ExternalLink } from 'lucide-react';
import { DataContext } from '../../../contexts/DataContext';
import { ToastContext } from '../../../contexts/AppContext';
import useTranslation from '../../../hooks/useTranslation';
import { db } from '../../../services/db';
import Modal from '../../common/Modal';
import PageTransition from '../../common/PageTransition';
import EmptyState from '../../common/EmptyState';

const ActiveOffers = () => {
    const { stores, settings, refreshData } = useContext(DataContext);
    const { showToast } = useContext(ToastContext);
    const t = useTranslation();
    const navigate = useNavigate();

    const [searchTerm, setSearchTerm] = useState('');
    const [offerFilter, setOfferFilter] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedStoreId, setSelectedStoreId] = useState('');
    const [selectedOfferTypes, setSelectedOfferTypes] = useState([]);

    // Searchable store selection state
    const [modalStoreSearch, setModalStoreSearch] = useState('');
    const [isStoreDropdownOpen, setIsStoreDropdownOpen] = useState(false);

    // Filter stores that have active offers
    const storesWithOffers = stores.filter(store =>
        Array.isArray(store.offers) && store.offers.length > 0
    );

    // Stats Calculations
    const totalActiveStores = storesWithOffers.length;
    const totalSubscriptions = storesWithOffers.reduce((acc, s) => acc + s.offers.length, 0);
    const allActiveOfferTypes = [...new Set(storesWithOffers.flatMap(s => s.offers))];

    const stats = {
        totalStores: totalActiveStores,
        totalOffers: allActiveOfferTypes.length,
        totalLinks: totalSubscriptions // Assuming links relate to subscriptions for now
    };

    // Apply UI filters
    const filteredStores = storesWithOffers.filter(store => {
        const matchesSearch = store.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesOffer = !offerFilter || store.offers.includes(offerFilter);
        return matchesSearch && matchesOffer;
    });

    const offerTypes = settings?.offerTypes || ["خصومات يومية", "TSN", "T+", "Winback", "punchcard", "camping"];

    // Color mapping for offers
    const getOfferStyle = (type) => {
        const styles = {
            'خصومات يومية': 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
            'TSN': 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
            'T+': 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800',
            'Winback': 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
            'punchcard': 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
            'camping': 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800',
        };
        return styles[type] || 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600';
    };

    const handleAddOffer = async () => {
        if (!selectedStoreId || selectedOfferTypes.length === 0) {
            showToast('Please select both a store and at least one offer type', 'error');
            return;
        }

        const store = stores.find(s => s.id === selectedStoreId);
        if (!store) return;

        // If editing, we replace the whole array. If adding via the general button, we still allow merging but direct edit from card implies full control.
        // Actually, let's make it consistent: whatever is selected in the modal is what the store will have.
        const newOffers = [...selectedOfferTypes];

        try {
            const table = await db.from('stores');
            const { error } = await table.update(store.id, { offers: newOffers });
            if (error) {
                showToast(error.userMessage || 'Failed to add offers', 'error');
                return;
            }
            showToast(t('savedSuccess'), 'success');
            closeModal();
            refreshData();
        } catch (error) {
            console.error('Error adding offers:', error);
            showToast('Unexpected error. Please try again.', 'error');
        }
    };

    const handleEditOffer = (store) => {
        setSelectedStoreId(store.id);
        setModalStoreSearch(store.name);
        setSelectedOfferTypes(Array.isArray(store.offers) ? [...store.offers] : []);
        setIsEditing(true);
        setIsAddModalOpen(true);
    };

    const handleRemoveOffer = async (storeId, offerToRemove) => {
        const store = stores.find(s => s.id === storeId);
        if (!store) return;

        const updatedOffers = store.offers.filter(o => o !== offerToRemove);

        try {
            const table = await db.from('stores');
            await table.update(store.id, { offers: updatedOffers });
            showToast(t('deletedSuccess'), 'success');
            refreshData();
        } catch (error) {
            console.error('Error removing offer:', error);
            showToast('Failed to remove offer', 'error');
        }
    };

    const closeModal = () => {
        setIsAddModalOpen(false);
        setIsEditing(false);
        setSelectedStoreId('');
        setSelectedOfferTypes([]);
        setModalStoreSearch('');
        setIsStoreDropdownOpen(false);
    };

    return (
        <PageTransition>
            <div className="space-y-8 pb-10">
                {/* Modern Header */}
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-2xl font-bold dark:text-white flex items-center gap-3">
                                <Gift className="text-primary-600" size={28} />
                                {t('activeOffers')}
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400 mt-1">Manage and track promotional offers across stores</p>
                        </div>

                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl transition-all shadow-lg shadow-primary-500/25 active:scale-[0.98] font-bold"
                        >
                            <Plus size={20} />
                            Associate New Offer
                        </button>
                    </div>
                </div>

                {/* Stats Summary Panel */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex items-center gap-4 p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="bg-primary-100 dark:bg-primary-900/30 p-2 rounded-lg">
                            <Store className="text-primary-600 dark:text-primary-400" size={20} />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Participating Stores</p>
                            <p className="text-lg font-bold dark:text-white leading-none">{stats.totalStores}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-lg">
                            <Gift className="text-amber-600 dark:text-amber-400" size={20} />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Distinct Offers</p>
                            <p className="text-lg font-bold dark:text-white leading-none">{stats.totalOffers}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="bg-violet-100 dark:bg-violet-900/30 p-2 rounded-lg">
                            <ExternalLink className="text-violet-600 dark:text-violet-400" size={20} />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Active Links</p>
                            <p className="text-lg font-bold dark:text-white leading-none">{stats.totalLinks}</p>
                        </div>
                    </div>
                </div>

                {/* Offer Type Breakdown */}
                <div className="bg-slate-100/50 dark:bg-slate-900/30 p-4 rounded-[2.5rem] border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3 mb-4 px-2">
                        <Tag size={18} className="text-primary-500" />
                        <h2 className="text-sm font-black dark:text-white uppercase tracking-widest">Campaign Distribution</h2>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                        {offerTypes.map(type => {
                            const count = storesWithOffers.filter(s => s.offers.includes(type)).length;
                            const style = getOfferStyle(type);
                            return (
                                <div key={type} className="bg-white dark:bg-slate-800 p-4 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col items-center text-center group hover:border-primary-500/30 transition-all">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 ${style}`}>
                                        <Tag size={16} />
                                    </div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">{type}</p>
                                    <p className="text-xl font-black dark:text-white">{count}</p>
                                    <div className="w-8 h-1 bg-slate-100 dark:bg-slate-700 rounded-full mt-2 group-hover:w-16 group-hover:bg-primary-500 transition-all duration-300"></div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Unified Tools Bar */}
                <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-3 rounded-[2rem] shadow-lg border border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row gap-3 sticky top-4 z-10">
                    <div className="relative flex-1 group">
                        <Search size={22} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                        <input
                            type="text"
                            placeholder={t('search') || 'Find a store with active offers...'}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-900/50 border-none rounded-2xl dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all font-medium"
                        />
                    </div>
                    <div className="flex gap-3">
                        <div className="relative flex-shrink-0">
                            <Filter size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            <select
                                value={offerFilter}
                                onChange={(e) => setOfferFilter(e.target.value)}
                                className="pl-12 pr-10 py-4 bg-slate-50 dark:bg-slate-900/50 border-none rounded-2xl dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all font-bold appearance-none min-w-[180px]"
                            >
                                <option value="">{t('all') || 'All Offers'}</option>
                                {offerTypes.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 font-bold">▾</div>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                {filteredStores.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredStores.map(store => (
                            <div key={store.id} className="group bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-sm hover:shadow-2xl hover:shadow-primary-500/10 border border-slate-100 dark:border-slate-700 overflow-hidden transition-all duration-500 hover:-translate-y-1">
                                <div className="p-8">
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 bg-slate-50 dark:bg-slate-900 rounded-2xl flex items-center justify-center text-slate-400 border border-slate-100 dark:border-slate-700 group-hover:bg-primary-500 group-hover:text-white transition-all duration-500 group-hover:rotate-6 shadow-sm">
                                                <Store size={28} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-extrabold text-xl dark:text-white truncate leading-tight">{store.name}</h3>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className="text-xs font-bold text-slate-400 flex items-center gap-1 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-lg">
                                                        <Search size={10} /> {store.zone}
                                                    </span>
                                                    {store.phone && (
                                                        <div className="flex items-center gap-2">
                                                            <a href={`tel:${store.phone}`} className="text-[10px] font-bold text-slate-400 hover:text-primary-50 transition-colors flex items-center gap-1">
                                                                <Phone size={10} /> {store.phone}
                                                            </a>
                                                            <a
                                                                href={`https://wa.me/${store.phone.replace(/\D/g, '')}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="p-1 px-1.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-200 transition-all flex items-center gap-1 text-[10px] font-black"
                                                            >
                                                                <MessageCircle size={10} /> WhatsApp
                                                            </a>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleEditOffer(store)}
                                            className="p-3 bg-slate-50 dark:bg-slate-900 text-slate-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-2xl transition-all border border-transparent hover:border-primary-100 dark:hover:border-primary-800"
                                            title="Edit Subscriptions"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between pb-2">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('activeOffers') || 'Active Subscriptions'}</p>
                                            <span className="bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 text-[10px] font-black px-2 py-1 rounded-full">{store.offers.length}</span>
                                        </div>

                                        <div className="flex flex-wrap gap-2.5">
                                            {store.offers.map((offer, idx) => {
                                                const style = getOfferStyle(offer);
                                                return (
                                                    <div key={idx} className={`flex items-center gap-2 px-4 py-2 ${style} rounded-2xl text-[13px] font-black border transition-all duration-300 hover:scale-105 shadow-sm group/offer relative overflow-hidden`}>
                                                        <Tag size={14} className="group-hover/offer:scale-110 transition-transform" />
                                                        {offer}
                                                        <button
                                                            onClick={() => handleRemoveOffer(store.id, offer)}
                                                            className="ml-1 p-1 bg-white/20 hover:bg-white/40 dark:bg-black/10 dark:hover:bg-black/30 rounded-lg transition-colors"
                                                            title={t('removeOffer') || 'Remove Offer'}
                                                        >
                                                            <X size={14} strokeWidth={2.5} />
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                                <div className="px-8 py-4 bg-slate-50 dark:bg-slate-900/30 border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-between">
                                    <div className="text-[10px] font-bold text-slate-400 italic">ID: {store.id?.toString().slice(-6)}</div>
                                    <button
                                        onClick={() => navigate(`/stores/${store.id}`)}
                                        className="text-[11px] font-black text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1 group"
                                    >
                                        View Profile <Plus size={12} className="group-hover:translate-x-0.5 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        type="offers"
                        title={t('noOffersFound') || 'No Active Offers'}
                        description="Subscribe stores to marketing offers to expand your reach."
                        action={() => setIsAddModalOpen(true)}
                        actionLabel={t('addStoreToOffer') || 'Start Adding Subscriptions'}
                    />
                )}

                {/* Add Offer Modal */}
                <Modal
                    isOpen={isAddModalOpen}
                    onClose={closeModal}
                    title={isEditing ? `Edit Subscriptions: ${modalStoreSearch}` : (t('addStoreToOffer') || 'Marketing Subscription')}
                >
                    <div className="space-y-8 p-1">
                        <p className="text-sm text-slate-500 font-medium -mt-4">
                            {isEditing ? 'Modify marketing offers for this store.' : 'Search for an existing store to apply marketing offers.'}
                        </p>

                        <div className="relative">
                            <label className="block text-xs font-black dark:text-slate-400 mb-3 uppercase tracking-widest">{t('selectStore') || 'Store Identity'}</label>

                            <div className="relative group">
                                <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                                <input
                                    type="text"
                                    placeholder={t('search') || 'Type store name or ID...'}
                                    value={modalStoreSearch}
                                    readOnly={isEditing}
                                    onChange={(e) => {
                                        setModalStoreSearch(e.target.value);
                                        setIsStoreDropdownOpen(true);
                                        if (selectedStoreId) setSelectedStoreId('');
                                    }}
                                    onFocus={() => !isEditing && setIsStoreDropdownOpen(true)}
                                    className={`w-full pl-14 pr-12 py-5 bg-slate-50 dark:bg-slate-900 border-2 rounded-3xl dark:text-white focus:ring-4 focus:ring-primary-500/10 outline-none transition-all font-bold ${selectedStoreId ? 'border-primary-500/50 text-primary-700 bg-primary-50/30' : 'border-slate-100 dark:border-slate-700'} ${isEditing ? 'opacity-70 cursor-not-allowed' : ''}`}
                                />
                                {modalStoreSearch && !isEditing && (
                                    <button
                                        onClick={() => { setModalStoreSearch(''); setSelectedStoreId(''); setIsStoreDropdownOpen(false); }}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
                                    >
                                        <X size={18} className="text-slate-400" />
                                    </button>
                                )}
                            </div>

                            {/* Dropdown Results */}
                            {isStoreDropdownOpen && modalStoreSearch && !selectedStoreId && (
                                <div className="absolute z-[100] w-full mt-3 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-[2rem] shadow-2xl max-h-[20rem] overflow-y-auto animate-fadeIn overflow-x-hidden">
                                    {stores
                                        .filter(s => s.name.toLowerCase().includes(modalStoreSearch.toLowerCase()) || (s.id && s.id.toString().includes(modalStoreSearch)))
                                        .slice(0, 15)
                                        .map(s => (
                                            <button
                                                key={s.id}
                                                onClick={() => {
                                                    setSelectedStoreId(s.id);
                                                    setModalStoreSearch(s.name);
                                                    setIsStoreDropdownOpen(false);
                                                }}
                                                className="w-full text-left px-6 py-4 hover:bg-primary-50 dark:hover:bg-primary-900/20 flex items-center gap-4 transition-all border-b last:border-b-0 dark:border-slate-700 group"
                                            >
                                                <div className="w-12 h-12 rounded-[1rem] bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400 group-hover:bg-primary-500 group-hover:text-white transition-all">
                                                    <Store size={22} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-extrabold dark:text-white truncate">{s.name}</p>
                                                    <p className="text-xs text-slate-500 font-bold">📍 {s.zone}</p>
                                                </div>
                                            </button>
                                        ))
                                    }
                                    {stores.filter(s => s.name.toLowerCase().includes(modalStoreSearch.toLowerCase())).length === 0 && (
                                        <div className="p-12 text-center">
                                            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                                                <Search size={32} />
                                            </div>
                                            <p className="text-slate-500 dark:text-slate-400 font-bold">No results found.</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-black dark:text-slate-400 mb-4 uppercase tracking-widest">{t('selectOffer') || 'Campaign Categories'}</label>
                            <div className="grid grid-cols-2 gap-4">
                                {offerTypes.map(type => {
                                    const isSelected = selectedOfferTypes.includes(type);
                                    const style = getOfferStyle(type);
                                    return (
                                        <button
                                            key={type}
                                            onClick={() => {
                                                setSelectedOfferTypes(prev =>
                                                    isSelected
                                                        ? prev.filter(t => t !== type)
                                                        : [...prev, type]
                                                );
                                            }}
                                            className={`group relative px-5 py-6 rounded-[2rem] border-2 text-sm font-black transition-all flex flex-col items-center justify-center gap-3 ${isSelected
                                                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 shadow-lg scale-[1.05] z-10'
                                                : 'border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 hover:border-slate-200 dark:hover:border-slate-700 text-slate-500 dark:text-slate-400'
                                                }`}
                                        >
                                            <div className={`p-3 rounded-2xl ${isSelected ? 'bg-primary-500 text-white shadow-lg' : 'bg-white dark:bg-slate-800 text-slate-400 group-hover:text-primary-500'} transition-all`}>
                                                <div className={style.split(' ')[2]}> <Tag size={20} /> </div>
                                            </div>
                                            {type}
                                            {isSelected && (
                                                <div className="flex items-center gap-1 mt-1 text-xs font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wider">
                                                    <AlertCircle size={12} />
                                                    Active Assignment
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="flex gap-4 pt-6">
                            <button
                                onClick={handleAddOffer}
                                disabled={!selectedStoreId || selectedOfferTypes.length === 0}
                                className="flex-[2] py-5 bg-primary-600 hover:bg-primary-700 text-white rounded-[1.5rem] font-black tracking-wide shadow-2xl shadow-primary-500/30 disabled:opacity-50 disabled:grayscale transition-all hover:scale-[1.02] active:scale-[0.98]"
                            >
                                {isEditing ? 'Update Subscriptions' : t('save')}
                            </button>
                            <button
                                onClick={closeModal}
                                className="flex-1 py-5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-[1.5rem] font-black hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-[0.98]"
                            >
                                {t('cancel')}
                            </button>
                        </div>
                    </div>
                </Modal>
            </div>
        </PageTransition>
    );
};

export default ActiveOffers;
