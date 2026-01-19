import React, { useState, useContext, useMemo } from 'react';
import { Plus, Search, Filter, Download, Upload, Store, UtensilsCrossed, Edit2, Trash2, Copy, Eye, MoreVertical, ChevronDown } from 'lucide-react';
import { DataContext } from '../../../contexts/DataContext';
import { ToastContext } from '../../../contexts/AppContext';
import { db } from '../../../services/db';
import useTranslation from '../../../hooks/useTranslation';
import MenuForm from './MenuForm';
import * as XLSX from 'xlsx';

const MenuBuilder = () => {
    const t = useTranslation();
    const { stores, menus, menuCategories, menuItems, setMenus, setMenuCategories, setMenuItems, queryClient } = useContext(DataContext);
    const { showToast } = useContext(ToastContext);

    const [searchTerm, setSearchTerm] = useState('');
    const [filterStore, setFilterStore] = useState('all');
    const [showForm, setShowForm] = useState(false);
    const [editingMenu, setEditingMenu] = useState(null);
    const [activeDropdown, setActiveDropdown] = useState(null);

    // Get menus with their store names and item counts
    const enrichedMenus = useMemo(() => {
        return menus.map(menu => {
            const store = stores.find(s => s.id === menu.store_id);
            const categories = menuCategories.filter(c => c.menu_id === menu.id);
            const itemCount = categories.reduce((acc, cat) => {
                return acc + menuItems.filter(item => item.category_id === cat.id).length;
            }, 0);
            return {
                ...menu,
                storeName: store?.name || 'Unlinked',
                categoryCount: categories.length,
                itemCount
            };
        });
    }, [menus, stores, menuCategories, menuItems]);

    // Filter menus
    const filteredMenus = useMemo(() => {
        return enrichedMenus.filter(menu => {
            const matchesSearch = menu.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                menu.storeName.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStore = filterStore === 'all' || menu.store_id === filterStore;
            return matchesSearch && matchesStore;
        });
    }, [enrichedMenus, searchTerm, filterStore]);

    // Handle create new menu
    const handleCreateMenu = () => {
        setEditingMenu(null);
        setShowForm(true);
    };

    // Handle edit menu
    const handleEditMenu = (menu) => {
        setEditingMenu(menu);
        setShowForm(true);
        setActiveDropdown(null);
    };

    // Handle delete menu
    const handleDeleteMenu = async (menu) => {
        if (!confirm(`Are you sure you want to delete "${menu.name}"? This will also delete all categories and items.`)) return;

        try {
            const table = await db.from('menus');
            await table.delete(menu.id);
            setMenus(prev => prev.filter(m => m.id !== menu.id));
            // Categories and items will be cascade deleted
            setMenuCategories(prev => prev.filter(c => c.menu_id !== menu.id));
            const catIds = menuCategories.filter(c => c.menu_id === menu.id).map(c => c.id);
            setMenuItems(prev => prev.filter(item => !catIds.includes(item.category_id)));
            showToast('Menu deleted successfully', 'success');
        } catch (error) {
            showToast('Failed to delete menu', 'error');
        }
        setActiveDropdown(null);
    };

    // Handle duplicate menu
    const handleDuplicateMenu = async (menu) => {
        try {
            // Create new menu
            const newMenuData = {
                name: `${menu.name} (Copy)`,
                description: menu.description,
                store_id: menu.store_id,
                is_active: true
            };
            const menuTable = await db.from('menus');
            const { data: newMenu } = await menuTable.insert(newMenuData);

            // Copy categories
            const categories = menuCategories.filter(c => c.menu_id === menu.id);
            const categoryTable = await db.from('menu_categories');
            const itemTable = await db.from('menu_items');

            for (const cat of categories) {
                const { data: newCat } = await categoryTable.insert({
                    menu_id: newMenu.id,
                    name: cat.name,
                    sort_order: cat.sort_order
                });

                // Copy items in this category
                const items = menuItems.filter(item => item.category_id === cat.id);
                for (const item of items) {
                    const itemData = {
                        category_id: newCat.id,
                        name: item.name,
                        description: item.description,
                        price: item.price,
                        is_available: item.is_available,
                        sort_order: item.sort_order
                    };
                    // Only include modifiers if they have data
                    if (item.modifiers && Object.values(item.modifiers).some(arr => arr?.length > 0)) {
                        itemData.modifiers = item.modifiers;
                    }
                    await itemTable.insert(itemData);
                }
            }

            // Refresh data
            queryClient.invalidateQueries(['menus']);
            queryClient.invalidateQueries(['menu_categories']);
            queryClient.invalidateQueries(['menu_items']);

            showToast('Menu duplicated successfully', 'success');
        } catch (error) {
            showToast('Failed to duplicate menu', 'error');
        }
        setActiveDropdown(null);
    };

    // Export menu to Excel (Detailed: one row per option)
    const handleExportMenu = (menu) => {
        const categories = menuCategories.filter(c => c.menu_id === menu.id);
        const exportData = [];

        categories.forEach(cat => {
            const items = menuItems.filter(item => item.category_id === cat.id);
            items.forEach(item => {
                const modifiers = item.modifiers || { variants: [], addons: [], choiceGroups: [], removables: [] };

                // First row: Main item info
                exportData.push({
                    'Category': cat.name,
                    'Item': item.name,
                    'Description': item.description || '',
                    'Type': 'Base Price',
                    'Option': '-',
                    'Price': item.price,
                    'Required': '-',
                    'Default': '-',
                    'Available': item.is_available ? 'Yes' : 'No'
                });

                // Variant rows (Size/Weight/Skewer)
                modifiers.variants?.forEach(variant => {
                    variant.options?.forEach(opt => {
                        exportData.push({
                            'Category': '',
                            'Item': '',
                            'Description': '',
                            'Type': `📏 ${variant.name}`,
                            'Option': opt.name,
                            'Price': opt.price,
                            'Required': variant.is_required ? 'Yes' : 'No',
                            'Default': opt.is_default ? '✓' : '',
                            'Available': ''
                        });
                    });
                });

                // Addon rows
                modifiers.addons?.forEach(addon => {
                    exportData.push({
                        'Category': '',
                        'Item': '',
                        'Description': '',
                        'Type': '➕ Add-on',
                        'Option': addon.name,
                        'Price': `+${addon.price}`,
                        'Required': 'No',
                        'Default': '',
                        'Available': addon.is_available ? 'Yes' : 'No'
                    });
                });

                // Choice group rows
                modifiers.choiceGroups?.forEach(cg => {
                    cg.options?.forEach(opt => {
                        exportData.push({
                            'Category': '',
                            'Item': '',
                            'Description': '',
                            'Type': `🔘 ${cg.name}`,
                            'Option': opt.name,
                            'Price': 'Free',
                            'Required': cg.is_required ? 'Yes' : 'No',
                            'Default': opt.is_default ? '✓' : '',
                            'Available': ''
                        });
                    });
                });

                // Removable rows
                modifiers.removables?.forEach(rem => {
                    exportData.push({
                        'Category': '',
                        'Item': '',
                        'Description': '',
                        'Type': '➖ Removable',
                        'Option': rem.name,
                        'Price': '-',
                        'Required': 'No',
                        'Default': '',
                        'Available': ''
                    });
                });
            });
        });

        if (exportData.length === 0) {
            showToast('Menu has no items to export', 'warning');
            return;
        }

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Menu');

        // Set column widths
        ws['!cols'] = [
            { wch: 18 }, // Category
            { wch: 25 }, // Item
            { wch: 30 }, // Description
            { wch: 18 }, // Type
            { wch: 20 }, // Option
            { wch: 10 }, // Price
            { wch: 10 }, // Required
            { wch: 8 },  // Default
            { wch: 10 }  // Available
        ];

        XLSX.writeFile(wb, `${menu.name.replace(/[^a-z0-9]/gi, '_')}_menu.xlsx`);
        showToast('Menu exported successfully', 'success');
        setActiveDropdown(null);
    };

    // Export all menus
    const handleExportAll = () => {
        if (filteredMenus.length === 0) {
            showToast('No menus to export', 'warning');
            return;
        }

        const exportData = [];
        filteredMenus.forEach(menu => {
            const categories = menuCategories.filter(c => c.menu_id === menu.id);
            categories.forEach(cat => {
                const items = menuItems.filter(item => item.category_id === cat.id);
                items.forEach(item => {
                    exportData.push({
                        'Menu': menu.name,
                        'Store': menu.storeName,
                        'Category': cat.name,
                        'Item Name': item.name,
                        'Description': item.description || '',
                        'Price': item.price,
                        'Available': item.is_available ? 'Yes' : 'No'
                    });
                });
            });
        });

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'All Menus');

        ws['!cols'] = [
            { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 30 }, { wch: 40 }, { wch: 12 }, { wch: 10 }
        ];

        XLSX.writeFile(wb, `all_menus_${new Date().toISOString().split('T')[0]}.xlsx`);
        showToast(`Exported ${filteredMenus.length} menus successfully`, 'success');
    };

    // Download template
    const handleDownloadTemplate = () => {
        const template = [
            { 'Category': 'Appetizers', 'Item Name': 'Spring Rolls', 'Description': 'Crispy vegetable rolls', 'Price': 5.99, 'Available': 'Yes' },
            { 'Category': 'Appetizers', 'Item Name': 'Soup of the Day', 'Description': 'Ask your server', 'Price': 4.50, 'Available': 'Yes' },
            { 'Category': 'Main Courses', 'Item Name': 'Grilled Chicken', 'Description': 'With seasonal vegetables', 'Price': 15.99, 'Available': 'Yes' },
        ];

        const ws = XLSX.utils.json_to_sheet(template);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Template');
        ws['!cols'] = [{ wch: 20 }, { wch: 30 }, { wch: 40 }, { wch: 12 }, { wch: 10 }];
        XLSX.writeFile(wb, 'menu_template.xlsx');
        showToast('Template downloaded', 'success');
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold dark:text-white flex items-center gap-2">
                        <UtensilsCrossed className="text-primary-600" />
                        Menu Builder
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Create and manage restaurant menus
                    </p>
                </div>
                <button
                    onClick={handleCreateMenu}
                    className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/20"
                >
                    <Plus size={20} />
                    Create Menu
                </button>
            </div>

            {/* Filters & Actions Bar */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="flex flex-col lg:flex-row gap-4">
                    {/* Search */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search menus..."
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:text-white"
                        />
                    </div>

                    {/* Store Filter */}
                    <div className="relative">
                        <Store className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <select
                            value={filterStore}
                            onChange={(e) => setFilterStore(e.target.value)}
                            className="pl-10 pr-8 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 appearance-none dark:text-white min-w-[180px]"
                        >
                            <option value="all">All Stores</option>
                            {stores.map(store => (
                                <option key={store.id} value={store.id}>{store.name}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                        <button
                            onClick={handleExportAll}
                            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors"
                        >
                            <Download size={18} />
                            Export All
                        </button>
                        <button
                            onClick={handleDownloadTemplate}
                            className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                        >
                            <Upload size={18} />
                            Template
                        </button>
                    </div>
                </div>
            </div>

            {/* Menu Cards Grid */}
            {filteredMenus.length === 0 ? (
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-700">
                    <UtensilsCrossed size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                    <h3 className="text-lg font-semibold dark:text-white mb-2">No Menus Found</h3>
                    <p className="text-slate-500 dark:text-slate-400 mb-4">
                        {searchTerm || filterStore !== 'all' ? 'Try adjusting your filters' : 'Create your first menu to get started'}
                    </p>
                    {!searchTerm && filterStore === 'all' && (
                        <button
                            onClick={handleCreateMenu}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                        >
                            <Plus size={18} />
                            Create Menu
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredMenus.map(menu => (
                        <div
                            key={menu.id}
                            className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all group"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex-1">
                                    <h3 className="font-bold text-lg dark:text-white group-hover:text-primary-600 transition-colors">
                                        {menu.name}
                                    </h3>
                                    <div className="flex items-center gap-2 mt-1 text-sm text-slate-500 dark:text-slate-400">
                                        <Store size={14} />
                                        {menu.storeName}
                                    </div>
                                </div>
                                <div className="relative">
                                    <button
                                        onClick={() => setActiveDropdown(activeDropdown === menu.id ? null : menu.id)}
                                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                    >
                                        <MoreVertical size={18} className="text-slate-500" />
                                    </button>
                                    {activeDropdown === menu.id && (
                                        <div className="absolute right-0 top-10 z-20 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-1 min-w-[160px]">
                                            <button
                                                onClick={() => handleEditMenu(menu)}
                                                className="w-full flex items-center gap-2 px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 text-left text-sm dark:text-white"
                                            >
                                                <Edit2 size={16} /> Edit
                                            </button>
                                            <button
                                                onClick={() => handleDuplicateMenu(menu)}
                                                className="w-full flex items-center gap-2 px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 text-left text-sm dark:text-white"
                                            >
                                                <Copy size={16} /> Duplicate
                                            </button>
                                            <button
                                                onClick={() => handleExportMenu(menu)}
                                                className="w-full flex items-center gap-2 px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 text-left text-sm dark:text-white"
                                            >
                                                <Download size={16} /> Export Excel
                                            </button>
                                            <hr className="my-1 border-slate-200 dark:border-slate-700" />
                                            <button
                                                onClick={() => handleDeleteMenu(menu)}
                                                className="w-full flex items-center gap-2 px-4 py-2 hover:bg-red-50 dark:hover:bg-red-900/30 text-left text-sm text-red-600"
                                            >
                                                <Trash2 size={16} /> Delete
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {menu.description && (
                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">
                                    {menu.description}
                                </p>
                            )}

                            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700">
                                <div className="flex gap-4 text-sm">
                                    <span className="text-slate-500 dark:text-slate-400">
                                        <span className="font-semibold text-slate-700 dark:text-slate-200">{menu.categoryCount}</span> Categories
                                    </span>
                                    <span className="text-slate-500 dark:text-slate-400">
                                        <span className="font-semibold text-slate-700 dark:text-slate-200">{menu.itemCount}</span> Items
                                    </span>
                                </div>
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${menu.is_active
                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                    : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                                    }`}>
                                    {menu.is_active ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Menu Form Modal */}
            {showForm && (
                <MenuForm
                    menu={editingMenu}
                    onClose={() => {
                        setShowForm(false);
                        setEditingMenu(null);
                    }}
                />
            )}

            {/* Click outside to close dropdown */}
            {activeDropdown && (
                <div
                    className="fixed inset-0 z-10"
                    onClick={() => setActiveDropdown(null)}
                />
            )}
        </div>
    );
};

export default MenuBuilder;
