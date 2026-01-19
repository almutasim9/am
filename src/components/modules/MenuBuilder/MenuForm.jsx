import React, { useState, useContext, useEffect } from 'react';
import { X, Plus, Trash2, GripVertical, ChevronDown, ChevronUp, Save, Store, Upload, Settings2 } from 'lucide-react';
import { DataContext } from '../../../contexts/DataContext';
import { ToastContext } from '../../../contexts/AppContext';
import { db } from '../../../services/db';
import * as XLSX from 'xlsx';
import ItemModifiersEditor from './ItemModifiersEditor';

const MenuForm = ({ menu, onClose }) => {
    const { stores, menuCategories, menuItems, queryClient } = useContext(DataContext);
    const { showToast } = useContext(ToastContext);

    const [formData, setFormData] = useState({
        name: menu?.name || '',
        description: menu?.description || '',
        store_id: menu?.store_id || '',
        is_active: menu?.is_active ?? true
    });

    const [categories, setCategories] = useState([]);
    const [expandedCategories, setExpandedCategories] = useState({});
    const [expandedModifiers, setExpandedModifiers] = useState({});
    const [saving, setSaving] = useState(false);

    // Load existing categories and items if editing
    useEffect(() => {
        if (menu) {
            const existingCategories = menuCategories
                .filter(c => c.menu_id === menu.id)
                .sort((a, b) => a.sort_order - b.sort_order)
                .map(cat => ({
                    ...cat,
                    items: menuItems
                        .filter(item => item.category_id === cat.id)
                        .sort((a, b) => a.sort_order - b.sort_order)
                        .map(item => ({
                            ...item,
                            modifiers: item.modifiers || { variants: [], addons: [], choiceGroups: [], removables: [] }
                        }))
                }));
            setCategories(existingCategories);
            // Expand all categories by default when editing
            const expanded = {};
            existingCategories.forEach(cat => expanded[cat.id] = true);
            setExpandedCategories(expanded);
        }
    }, [menu, menuCategories, menuItems]);

    // Add new category
    const addCategory = () => {
        const newCategory = {
            id: `temp_${Date.now()}`,
            name: '',
            sort_order: categories.length,
            items: [],
            isNew: true
        };
        setCategories([...categories, newCategory]);
        setExpandedCategories({ ...expandedCategories, [newCategory.id]: true });
    };

    // Update category name
    const updateCategoryName = (catId, name) => {
        setCategories(categories.map(cat =>
            cat.id === catId ? { ...cat, name } : cat
        ));
    };

    // Delete category
    const deleteCategory = (catId) => {
        setCategories(categories.filter(cat => cat.id !== catId));
    };

    // Toggle category expand
    const toggleCategory = (catId) => {
        setExpandedCategories(prev => ({
            ...prev,
            [catId]: !prev[catId]
        }));
    };

    // Add item to category
    const addItem = (catId) => {
        setCategories(categories.map(cat => {
            if (cat.id === catId) {
                return {
                    ...cat,
                    items: [...cat.items, {
                        id: `temp_${Date.now()}`,
                        name: '',
                        description: '',
                        price: 0,
                        is_available: true,
                        sort_order: cat.items.length,
                        isNew: true,
                        modifiers: { variants: [], addons: [], choiceGroups: [], removables: [] }
                    }]
                };
            }
            return cat;
        }));
    };

    // Toggle modifiers editor for an item
    const toggleModifiers = (itemId) => {
        setExpandedModifiers(prev => ({
            ...prev,
            [itemId]: !prev[itemId]
        }));
    };

    // Update item modifiers
    const updateItemModifiers = (catId, itemId, modifiers) => {
        setCategories(categories.map(cat => {
            if (cat.id === catId) {
                return {
                    ...cat,
                    items: cat.items.map(item =>
                        item.id === itemId ? { ...item, modifiers } : item
                    )
                };
            }
            return cat;
        }));
    };

    // Update item
    const updateItem = (catId, itemId, field, value) => {
        setCategories(categories.map(cat => {
            if (cat.id === catId) {
                return {
                    ...cat,
                    items: cat.items.map(item =>
                        item.id === itemId ? { ...item, [field]: value } : item
                    )
                };
            }
            return cat;
        }));
    };

    // Delete item
    const deleteItem = (catId, itemId) => {
        setCategories(categories.map(cat => {
            if (cat.id === catId) {
                return {
                    ...cat,
                    items: cat.items.filter(item => item.id !== itemId)
                };
            }
            return cat;
        }));
    };

    // Import from Excel
    const handleImport = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const data = evt.target.result;
                const workbook = XLSX.read(data, { type: 'binary' });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(sheet);

                // Group by category
                const categoryMap = {};
                jsonData.forEach((row, index) => {
                    const catName = row['Category'] || 'Uncategorized';
                    if (!categoryMap[catName]) {
                        categoryMap[catName] = {
                            id: `temp_import_${Date.now()}_${Object.keys(categoryMap).length}`,
                            name: catName,
                            sort_order: Object.keys(categoryMap).length,
                            items: [],
                            isNew: true
                        };
                    }
                    categoryMap[catName].items.push({
                        id: `temp_item_${Date.now()}_${index}`,
                        name: row['Item Name'] || '',
                        description: row['Description'] || '',
                        price: parseFloat(row['Price']) || 0,
                        is_available: (row['Available'] || 'Yes').toLowerCase() !== 'no',
                        sort_order: categoryMap[catName].items.length,
                        isNew: true
                    });
                });

                setCategories(Object.values(categoryMap));
                const expanded = {};
                Object.values(categoryMap).forEach(cat => expanded[cat.id] = true);
                setExpandedCategories(expanded);
                showToast(`Imported ${jsonData.length} items from ${Object.keys(categoryMap).length} categories`, 'success');
            } catch (error) {
                console.error('Import error:', error);
                showToast('Failed to import file. Please check the format.', 'error');
            }
        };
        reader.readAsBinaryString(file);
        e.target.value = ''; // Reset input
    };

    // Save menu
    const handleSave = async () => {
        if (!formData.name.trim()) {
            showToast('Please enter a menu name', 'error');
            return;
        }

        setSaving(true);
        try {
            const menuTable = await db.from('menus');
            const categoryTable = await db.from('menu_categories');
            const itemTable = await db.from('menu_items');

            let menuId = menu?.id;

            // Create or update menu
            if (menu) {
                await menuTable.update(menu.id, formData);
            } else {
                const { data: newMenu } = await menuTable.insert(formData);
                menuId = newMenu.id;
            }

            // Handle categories and items
            // First, get existing category IDs to track deletions
            const existingCatIds = menuCategories.filter(c => c.menu_id === menuId).map(c => c.id);
            const currentCatIds = categories.filter(c => !c.isNew).map(c => c.id);
            const deletedCatIds = existingCatIds.filter(id => !currentCatIds.includes(id));

            // Delete removed categories
            for (const catId of deletedCatIds) {
                await categoryTable.delete(catId);
            }

            // Save categories and items
            console.log('Saving categories:', categories);
            for (let i = 0; i < categories.length; i++) {
                const cat = categories[i];
                let catId = cat.id;

                if (cat.isNew || cat.id.startsWith('temp_')) {
                    // Create new category
                    console.log('Creating new category:', cat.name);
                    const { data: newCat } = await categoryTable.insert({
                        menu_id: menuId,
                        name: cat.name,
                        sort_order: i
                    });
                    catId = newCat.id;
                    console.log('New category created with ID:', catId);
                } else {
                    // Update existing category
                    await categoryTable.update(cat.id, {
                        name: cat.name,
                        sort_order: i
                    });
                }

                // Handle items in this category
                console.log(`Category ${cat.name} has ${cat.items?.length || 0} items:`, cat.items);
                const existingItemIds = menuItems.filter(item => item.category_id === cat.id).map(item => item.id);
                const currentItemIds = cat.items.filter(item => !item.isNew && !item.id.startsWith('temp_')).map(item => item.id);
                const deletedItemIds = existingItemIds.filter(id => !currentItemIds.includes(id));

                // Delete removed items
                for (const itemId of deletedItemIds) {
                    await itemTable.delete(itemId);
                }

                // Save items
                for (let j = 0; j < cat.items.length; j++) {
                    const item = cat.items[j];
                    const itemData = {
                        category_id: catId,
                        name: item.name,
                        description: item.description,
                        price: parseFloat(item.price) || 0,
                        is_available: item.is_available,
                        sort_order: j
                    };

                    // Only include modifiers if they have data (to avoid Supabase errors if column doesn't exist)
                    const mods = item.modifiers;
                    if (mods && (mods.variants?.length || mods.addons?.length || mods.choiceGroups?.length || mods.removables?.length)) {
                        itemData.modifiers = mods;
                    }

                    console.log('Saving item:', itemData);
                    try {
                        if (item.isNew || item.id.startsWith('temp_')) {
                            const result = await itemTable.insert(itemData);
                            console.log('Item inserted:', result);
                        } else {
                            const result = await itemTable.update(item.id, itemData);
                            console.log('Item updated:', result);
                        }
                    } catch (itemError) {
                        console.error('Error saving item:', itemError);
                        throw itemError;
                    }
                }
            }

            // Refresh data
            queryClient.invalidateQueries(['menus']);
            queryClient.invalidateQueries(['menu_categories']);
            queryClient.invalidateQueries(['menu_items']);

            showToast(menu ? 'Menu updated successfully' : 'Menu created successfully', 'success');
            onClose();
        } catch (error) {
            console.error('Save error:', error);
            showToast('Failed to save menu', 'error');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-xl font-bold dark:text-white">
                        {menu ? 'Edit Menu' : 'Create New Menu'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    >
                        <X size={20} className="text-slate-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Menu Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Menu Name *
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g., Main Menu, Lunch Special"
                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                <Store size={14} className="inline mr-1" />
                                Link to Store
                            </label>
                            <select
                                value={formData.store_id}
                                onChange={(e) => setFormData({ ...formData, store_id: e.target.value })}
                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 dark:text-white"
                            >
                                <option value="">Select a store (optional)</option>
                                {stores.filter(s => s.category === 'Restaurant').map(store => (
                                    <option key={store.id} value={store.id}>{store.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Description
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Brief description of this menu..."
                            rows={2}
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 dark:text-white resize-none"
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            id="isActive"
                            checked={formData.is_active}
                            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                            className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                        />
                        <label htmlFor="isActive" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            Menu is active
                        </label>
                    </div>

                    <hr className="border-slate-200 dark:border-slate-700" />

                    {/* Categories & Items Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold dark:text-white">
                                Categories & Items
                            </h3>
                            <div className="flex gap-2">
                                <label className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors cursor-pointer text-sm">
                                    <Upload size={16} />
                                    Import Excel
                                    <input
                                        type="file"
                                        accept=".xlsx,.xls,.csv"
                                        onChange={handleImport}
                                        className="hidden"
                                    />
                                </label>
                                <button
                                    onClick={addCategory}
                                    className="flex items-center gap-2 px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm"
                                >
                                    <Plus size={16} />
                                    Add Category
                                </button>
                            </div>
                        </div>

                        {categories.length === 0 ? (
                            <div className="text-center py-8 bg-slate-50 dark:bg-slate-700/50 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-600">
                                <p className="text-slate-500 dark:text-slate-400 mb-3">
                                    No categories yet. Add a category to start building your menu.
                                </p>
                                <button
                                    onClick={addCategory}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                                >
                                    <Plus size={18} />
                                    Add First Category
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {categories.map((cat, catIndex) => (
                                    <div
                                        key={cat.id}
                                        className="bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600 overflow-hidden"
                                    >
                                        {/* Category Header */}
                                        <div className="flex items-center gap-3 p-3 bg-slate-100 dark:bg-slate-700">
                                            <GripVertical size={16} className="text-slate-400 cursor-grab" />
                                            <input
                                                type="text"
                                                value={cat.name}
                                                onChange={(e) => updateCategoryName(cat.id, e.target.value)}
                                                placeholder="Category name..."
                                                className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-600 border border-slate-200 dark:border-slate-500 rounded-lg text-sm font-medium dark:text-white"
                                            />
                                            <span className="text-xs text-slate-500 dark:text-slate-400">
                                                {cat.items.length} items
                                            </span>
                                            <button
                                                onClick={() => toggleCategory(cat.id)}
                                                className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
                                            >
                                                {expandedCategories[cat.id] ? (
                                                    <ChevronUp size={18} className="text-slate-500" />
                                                ) : (
                                                    <ChevronDown size={18} className="text-slate-500" />
                                                )}
                                            </button>
                                            <button
                                                onClick={() => deleteCategory(cat.id)}
                                                className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={16} className="text-red-500" />
                                            </button>
                                        </div>

                                        {/* Category Items */}
                                        {expandedCategories[cat.id] && (
                                            <div className="p-3 space-y-2">
                                                {cat.items.map((item, itemIndex) => (
                                                    <div key={item.id} className="space-y-2">
                                                        <div
                                                            className="flex items-center gap-2 p-2 bg-white dark:bg-slate-600 rounded-lg border border-slate-200 dark:border-slate-500"
                                                        >
                                                            <GripVertical size={14} className="text-slate-300 cursor-grab flex-shrink-0" />
                                                            <input
                                                                type="text"
                                                                value={item.name}
                                                                onChange={(e) => updateItem(cat.id, item.id, 'name', e.target.value)}
                                                                placeholder="Item name"
                                                                className="flex-1 min-w-[120px] px-2 py-1 bg-slate-50 dark:bg-slate-500 border border-slate-200 dark:border-slate-400 rounded text-sm dark:text-white"
                                                            />
                                                            <input
                                                                type="text"
                                                                value={item.description}
                                                                onChange={(e) => updateItem(cat.id, item.id, 'description', e.target.value)}
                                                                placeholder="Description"
                                                                className="flex-1 min-w-[100px] px-2 py-1 bg-slate-50 dark:bg-slate-500 border border-slate-200 dark:border-slate-400 rounded text-sm dark:text-white hidden md:block"
                                                            />
                                                            <div className="flex items-center">
                                                                <span className="text-xs text-slate-500 dark:text-slate-400 mr-1">$</span>
                                                                <input
                                                                    type="number"
                                                                    value={item.price}
                                                                    onChange={(e) => updateItem(cat.id, item.id, 'price', e.target.value)}
                                                                    placeholder="0.00"
                                                                    step="0.01"
                                                                    min="0"
                                                                    className="w-16 px-2 py-1 bg-slate-50 dark:bg-slate-500 border border-slate-200 dark:border-slate-400 rounded text-sm dark:text-white text-right"
                                                                />
                                                            </div>
                                                            <input
                                                                type="checkbox"
                                                                checked={item.is_available}
                                                                onChange={(e) => updateItem(cat.id, item.id, 'is_available', e.target.checked)}
                                                                title="Available"
                                                                className="w-4 h-4 text-emerald-600 rounded"
                                                            />
                                                            <button
                                                                onClick={() => toggleModifiers(item.id)}
                                                                className={`p-1.5 rounded transition-colors flex-shrink-0 ${expandedModifiers[item.id]
                                                                    ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600'
                                                                    : 'hover:bg-slate-100 dark:hover:bg-slate-500 text-slate-400'
                                                                    }`}
                                                                title="Item modifiers (size, extras, etc.)"
                                                            >
                                                                <Settings2 size={14} />
                                                            </button>
                                                            <button
                                                                onClick={() => deleteItem(cat.id, item.id)}
                                                                className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors flex-shrink-0"
                                                            >
                                                                <Trash2 size={14} className="text-red-500" />
                                                            </button>
                                                        </div>
                                                        {/* Item Modifiers Editor */}
                                                        {expandedModifiers[item.id] && (
                                                            <div className="ml-6">
                                                                <ItemModifiersEditor
                                                                    itemId={item.id}
                                                                    modifiers={item.modifiers}
                                                                    onChange={(modifiers) => updateItemModifiers(cat.id, item.id, modifiers)}
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                                <button
                                                    onClick={() => addItem(cat.id)}
                                                    className="w-full py-2 text-sm text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors flex items-center justify-center gap-1"
                                                >
                                                    <Plus size={16} />
                                                    Add Item
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                    <button
                        onClick={onClose}
                        className="px-4 py-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50"
                    >
                        <Save size={18} />
                        {saving ? 'Saving...' : 'Save Menu'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MenuForm;
