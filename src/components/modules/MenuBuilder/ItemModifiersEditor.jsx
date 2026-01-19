import React, { useState } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp, DollarSign, GripVertical, Package, Layers, ListChecks, MinusCircle } from 'lucide-react';

const ItemModifiersEditor = ({ itemId, modifiers, onChange }) => {
    const [activeTab, setActiveTab] = useState('variants');

    // Initialize modifiers structure if not exists
    const data = {
        variants: modifiers?.variants || [],
        addons: modifiers?.addons || [],
        choiceGroups: modifiers?.choiceGroups || [],
        removables: modifiers?.removables || []
    };

    const updateData = (key, value) => {
        onChange({ ...data, [key]: value });
    };

    // ============ VARIANTS ============
    const addVariant = () => {
        updateData('variants', [...data.variants, {
            id: `temp_var_${Date.now()}`,
            name: '',
            is_required: true,
            options: []
        }]);
    };

    const updateVariant = (varId, field, value) => {
        updateData('variants', data.variants.map(v =>
            v.id === varId ? { ...v, [field]: value } : v
        ));
    };

    const deleteVariant = (varId) => {
        updateData('variants', data.variants.filter(v => v.id !== varId));
    };

    const addVariantOption = (varId) => {
        updateData('variants', data.variants.map(v => {
            if (v.id === varId) {
                return {
                    ...v,
                    options: [...v.options, {
                        id: `temp_opt_${Date.now()}`,
                        name: '',
                        price: 0,
                        is_default: v.options.length === 0
                    }]
                };
            }
            return v;
        }));
    };

    const updateVariantOption = (varId, optId, field, value) => {
        updateData('variants', data.variants.map(v => {
            if (v.id === varId) {
                return {
                    ...v,
                    options: v.options.map(opt =>
                        opt.id === optId ? { ...opt, [field]: value } : opt
                    )
                };
            }
            return v;
        }));
    };

    const deleteVariantOption = (varId, optId) => {
        updateData('variants', data.variants.map(v => {
            if (v.id === varId) {
                return { ...v, options: v.options.filter(opt => opt.id !== optId) };
            }
            return v;
        }));
    };

    // ============ ADDONS ============
    const addAddon = () => {
        updateData('addons', [...data.addons, {
            id: `temp_addon_${Date.now()}`,
            name: '',
            price: 0,
            is_available: true
        }]);
    };

    const updateAddon = (addonId, field, value) => {
        updateData('addons', data.addons.map(a =>
            a.id === addonId ? { ...a, [field]: value } : a
        ));
    };

    const deleteAddon = (addonId) => {
        updateData('addons', data.addons.filter(a => a.id !== addonId));
    };

    // ============ CHOICE GROUPS ============
    const addChoiceGroup = () => {
        updateData('choiceGroups', [...data.choiceGroups, {
            id: `temp_cg_${Date.now()}`,
            name: '',
            is_required: true,
            options: []
        }]);
    };

    const updateChoiceGroup = (cgId, field, value) => {
        updateData('choiceGroups', data.choiceGroups.map(cg =>
            cg.id === cgId ? { ...cg, [field]: value } : cg
        ));
    };

    const deleteChoiceGroup = (cgId) => {
        updateData('choiceGroups', data.choiceGroups.filter(cg => cg.id !== cgId));
    };

    const addChoiceOption = (cgId) => {
        updateData('choiceGroups', data.choiceGroups.map(cg => {
            if (cg.id === cgId) {
                return {
                    ...cg,
                    options: [...cg.options, {
                        id: `temp_co_${Date.now()}`,
                        name: '',
                        is_default: cg.options.length === 0
                    }]
                };
            }
            return cg;
        }));
    };

    const updateChoiceOption = (cgId, optId, field, value) => {
        updateData('choiceGroups', data.choiceGroups.map(cg => {
            if (cg.id === cgId) {
                return {
                    ...cg,
                    options: cg.options.map(opt =>
                        opt.id === optId ? { ...opt, [field]: value } : opt
                    )
                };
            }
            return cg;
        }));
    };

    const deleteChoiceOption = (cgId, optId) => {
        updateData('choiceGroups', data.choiceGroups.map(cg => {
            if (cg.id === cgId) {
                return { ...cg, options: cg.options.filter(opt => opt.id !== optId) };
            }
            return cg;
        }));
    };

    // ============ REMOVABLES ============
    const addRemovable = () => {
        updateData('removables', [...data.removables, {
            id: `temp_rem_${Date.now()}`,
            name: ''
        }]);
    };

    const updateRemovable = (remId, name) => {
        updateData('removables', data.removables.map(r =>
            r.id === remId ? { ...r, name } : r
        ));
    };

    const deleteRemovable = (remId) => {
        updateData('removables', data.removables.filter(r => r.id !== remId));
    };

    const tabs = [
        { id: 'variants', label: 'المتغيرات', labelEn: 'Variants', icon: Package, count: data.variants.length },
        { id: 'addons', label: 'الإضافات', labelEn: 'Add-ons', icon: Plus, count: data.addons.length },
        { id: 'choices', label: 'الاختيارات', labelEn: 'Choices', icon: ListChecks, count: data.choiceGroups.length },
        { id: 'removables', label: 'قابل للإزالة', labelEn: 'Removables', icon: MinusCircle, count: data.removables.length },
    ];

    return (
        <div className="bg-slate-50 dark:bg-slate-700/30 rounded-xl border border-slate-200 dark:border-slate-600 overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-slate-200 dark:border-slate-600 overflow-x-auto">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors ${activeTab === tab.id
                                ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 border-b-2 border-primary-600'
                                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                            }`}
                    >
                        <tab.icon size={16} />
                        {tab.labelEn}
                        {tab.count > 0 && (
                            <span className="px-1.5 py-0.5 text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full">
                                {tab.count}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="p-4">
                {/* VARIANTS TAB */}
                {activeTab === 'variants' && (
                    <div className="space-y-3">
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                            Add size, weight, skewer count, etc. Each variant affects the price.
                        </p>
                        {data.variants.map(variant => (
                            <div key={variant.id} className="bg-white dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 p-3">
                                <div className="flex items-center gap-2 mb-3">
                                    <input
                                        type="text"
                                        value={variant.name}
                                        onChange={(e) => updateVariant(variant.id, 'name', e.target.value)}
                                        placeholder="Variant name (e.g., Size, Weight)"
                                        className="flex-1 px-3 py-1.5 bg-slate-50 dark:bg-slate-600 border border-slate-200 dark:border-slate-500 rounded-lg text-sm dark:text-white"
                                    />
                                    <label className="flex items-center gap-1.5 text-xs text-slate-500 whitespace-nowrap">
                                        <input
                                            type="checkbox"
                                            checked={variant.is_required}
                                            onChange={(e) => updateVariant(variant.id, 'is_required', e.target.checked)}
                                            className="w-4 h-4 text-primary-600 rounded"
                                        />
                                        Required
                                    </label>
                                    <button
                                        onClick={() => deleteVariant(variant.id)}
                                        className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg"
                                    >
                                        <Trash2 size={16} className="text-red-500" />
                                    </button>
                                </div>
                                {/* Variant Options */}
                                <div className="space-y-2 ml-4">
                                    {variant.options.map(opt => (
                                        <div key={opt.id} className="flex items-center gap-2">
                                            <GripVertical size={14} className="text-slate-300" />
                                            <input
                                                type="text"
                                                value={opt.name}
                                                onChange={(e) => updateVariantOption(variant.id, opt.id, 'name', e.target.value)}
                                                placeholder="Option (e.g., Small, Medium)"
                                                className="flex-1 px-2 py-1 bg-slate-50 dark:bg-slate-600 border border-slate-200 dark:border-slate-500 rounded text-sm dark:text-white"
                                            />
                                            <div className="flex items-center">
                                                <DollarSign size={14} className="text-slate-400" />
                                                <input
                                                    type="number"
                                                    value={opt.price}
                                                    onChange={(e) => updateVariantOption(variant.id, opt.id, 'price', parseFloat(e.target.value) || 0)}
                                                    className="w-16 px-2 py-1 bg-slate-50 dark:bg-slate-600 border border-slate-200 dark:border-slate-500 rounded text-sm dark:text-white text-right"
                                                    step="0.01"
                                                    min="0"
                                                />
                                            </div>
                                            <label className="flex items-center gap-1 text-xs text-slate-500" title="Default option">
                                                <input
                                                    type="radio"
                                                    name={`default_${variant.id}`}
                                                    checked={opt.is_default}
                                                    onChange={() => {
                                                        updateData('variants', data.variants.map(v => {
                                                            if (v.id === variant.id) {
                                                                return {
                                                                    ...v,
                                                                    options: v.options.map(o => ({
                                                                        ...o,
                                                                        is_default: o.id === opt.id
                                                                    }))
                                                                };
                                                            }
                                                            return v;
                                                        }));
                                                    }}
                                                    className="w-3 h-3"
                                                />
                                                Default
                                            </label>
                                            <button
                                                onClick={() => deleteVariantOption(variant.id, opt.id)}
                                                className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                                            >
                                                <Trash2 size={14} className="text-red-400" />
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        onClick={() => addVariantOption(variant.id)}
                                        className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1 ml-5"
                                    >
                                        <Plus size={14} /> Add Option
                                    </button>
                                </div>
                            </div>
                        ))}
                        <button
                            onClick={addVariant}
                            className="w-full py-2 text-sm text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg flex items-center justify-center gap-1 border border-dashed border-primary-300 dark:border-primary-700"
                        >
                            <Plus size={16} /> Add Variant (Size/Weight/etc.)
                        </button>
                    </div>
                )}

                {/* ADDONS TAB */}
                {activeTab === 'addons' && (
                    <div className="space-y-3">
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                            Optional extras that add to the base price. Customers can select multiple.
                        </p>
                        {data.addons.map(addon => (
                            <div key={addon.id} className="flex items-center gap-2 bg-white dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 p-2">
                                <GripVertical size={14} className="text-slate-300" />
                                <input
                                    type="text"
                                    value={addon.name}
                                    onChange={(e) => updateAddon(addon.id, 'name', e.target.value)}
                                    placeholder="Add-on name (e.g., Extra Cheese)"
                                    className="flex-1 px-2 py-1.5 bg-slate-50 dark:bg-slate-600 border border-slate-200 dark:border-slate-500 rounded text-sm dark:text-white"
                                />
                                <div className="flex items-center">
                                    <span className="text-xs text-slate-400 mr-1">+$</span>
                                    <input
                                        type="number"
                                        value={addon.price}
                                        onChange={(e) => updateAddon(addon.id, 'price', parseFloat(e.target.value) || 0)}
                                        className="w-16 px-2 py-1.5 bg-slate-50 dark:bg-slate-600 border border-slate-200 dark:border-slate-500 rounded text-sm dark:text-white text-right"
                                        step="0.01"
                                        min="0"
                                    />
                                </div>
                                <input
                                    type="checkbox"
                                    checked={addon.is_available}
                                    onChange={(e) => updateAddon(addon.id, 'is_available', e.target.checked)}
                                    title="Available"
                                    className="w-4 h-4 text-emerald-600 rounded"
                                />
                                <button
                                    onClick={() => deleteAddon(addon.id)}
                                    className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                                >
                                    <Trash2 size={14} className="text-red-500" />
                                </button>
                            </div>
                        ))}
                        <button
                            onClick={addAddon}
                            className="w-full py-2 text-sm text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg flex items-center justify-center gap-1 border border-dashed border-primary-300 dark:border-primary-700"
                        >
                            <Plus size={16} /> Add Extra / Add-on
                        </button>
                    </div>
                )}

                {/* CHOICES TAB */}
                {activeTab === 'choices' && (
                    <div className="space-y-3">
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                            Single-selection choices with no extra cost (e.g., Rice Type, Bread Type).
                        </p>
                        {data.choiceGroups.map(cg => (
                            <div key={cg.id} className="bg-white dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 p-3">
                                <div className="flex items-center gap-2 mb-3">
                                    <input
                                        type="text"
                                        value={cg.name}
                                        onChange={(e) => updateChoiceGroup(cg.id, 'name', e.target.value)}
                                        placeholder="Choice group (e.g., Rice Type)"
                                        className="flex-1 px-3 py-1.5 bg-slate-50 dark:bg-slate-600 border border-slate-200 dark:border-slate-500 rounded-lg text-sm dark:text-white"
                                    />
                                    <label className="flex items-center gap-1.5 text-xs text-slate-500 whitespace-nowrap">
                                        <input
                                            type="checkbox"
                                            checked={cg.is_required}
                                            onChange={(e) => updateChoiceGroup(cg.id, 'is_required', e.target.checked)}
                                            className="w-4 h-4 text-primary-600 rounded"
                                        />
                                        Required
                                    </label>
                                    <button
                                        onClick={() => deleteChoiceGroup(cg.id)}
                                        className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg"
                                    >
                                        <Trash2 size={16} className="text-red-500" />
                                    </button>
                                </div>
                                {/* Choice Options */}
                                <div className="space-y-2 ml-4">
                                    {cg.options.map(opt => (
                                        <div key={opt.id} className="flex items-center gap-2">
                                            <GripVertical size={14} className="text-slate-300" />
                                            <input
                                                type="text"
                                                value={opt.name}
                                                onChange={(e) => updateChoiceOption(cg.id, opt.id, 'name', e.target.value)}
                                                placeholder="Option (e.g., White Rice)"
                                                className="flex-1 px-2 py-1 bg-slate-50 dark:bg-slate-600 border border-slate-200 dark:border-slate-500 rounded text-sm dark:text-white"
                                            />
                                            <label className="flex items-center gap-1 text-xs text-slate-500" title="Default option">
                                                <input
                                                    type="radio"
                                                    name={`default_cg_${cg.id}`}
                                                    checked={opt.is_default}
                                                    onChange={() => {
                                                        updateData('choiceGroups', data.choiceGroups.map(g => {
                                                            if (g.id === cg.id) {
                                                                return {
                                                                    ...g,
                                                                    options: g.options.map(o => ({
                                                                        ...o,
                                                                        is_default: o.id === opt.id
                                                                    }))
                                                                };
                                                            }
                                                            return g;
                                                        }));
                                                    }}
                                                    className="w-3 h-3"
                                                />
                                                Default
                                            </label>
                                            <button
                                                onClick={() => deleteChoiceOption(cg.id, opt.id)}
                                                className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                                            >
                                                <Trash2 size={14} className="text-red-400" />
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        onClick={() => addChoiceOption(cg.id)}
                                        className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1 ml-5"
                                    >
                                        <Plus size={14} /> Add Option
                                    </button>
                                </div>
                            </div>
                        ))}
                        <button
                            onClick={addChoiceGroup}
                            className="w-full py-2 text-sm text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg flex items-center justify-center gap-1 border border-dashed border-primary-300 dark:border-primary-700"
                        >
                            <Plus size={16} /> Add Choice Group
                        </button>
                    </div>
                )}

                {/* REMOVABLES TAB */}
                {activeTab === 'removables' && (
                    <div className="space-y-3">
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                            Ingredients that customers can request to be removed (no extra cost).
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {data.removables.map(rem => (
                                <div key={rem.id} className="flex items-center gap-1 bg-white dark:bg-slate-700 rounded-full border border-slate-200 dark:border-slate-600 pl-3 pr-1 py-1">
                                    <input
                                        type="text"
                                        value={rem.name}
                                        onChange={(e) => updateRemovable(rem.id, e.target.value)}
                                        placeholder="Ingredient"
                                        className="w-24 bg-transparent text-sm dark:text-white outline-none"
                                    />
                                    <button
                                        onClick={() => deleteRemovable(rem.id)}
                                        className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full"
                                    >
                                        <Trash2 size={12} className="text-red-400" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={addRemovable}
                            className="w-full py-2 text-sm text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg flex items-center justify-center gap-1 border border-dashed border-primary-300 dark:border-primary-700"
                        >
                            <Plus size={16} /> Add Removable Ingredient
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ItemModifiersEditor;
