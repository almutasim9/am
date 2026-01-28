import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, CheckSquare, Calendar, Archive, Store, Settings, Sun, Moon, LogOut, BarChart3, FileBarChart, Map, UtensilsCrossed, Percent } from 'lucide-react';
import useTranslation from '../../hooks/useTranslation';
import { AuthContext, ThemeContext } from '../../contexts/AppContext';

const Sidebar = ({ isMobileOpen, setIsMobileOpen }) => {
    const t = useTranslation();
    const { logout } = useContext(AuthContext);
    const { dark, setDark } = useContext(ThemeContext);

    const menuItems = [
        { path: '/', icon: Home, label: t('dashboard') },
        { path: '/tasks', icon: CheckSquare, label: t('tasks') },
        { path: '/visits', icon: Calendar, label: t('visits') },
        { path: '/stores', icon: Store, label: t('stores') },
        { path: '/map', icon: Map, label: t('map') || 'Map' },
        { path: '/offers', icon: Percent, label: t('activeOffers') || 'Active Offers' },
        { path: '/analytics', icon: BarChart3, label: t('analytics') || 'Analytics' },
        { path: '/archive', icon: Archive, label: t('archive') },
        { path: '/settings', icon: Settings, label: t('settings') },
    ];

    const sidebarContent = (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-6">
                <div className="flex items-center gap-3 px-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20">
                        <Store size={20} className="text-white" aria-hidden="true" />
                    </div>
                    <div>
                        <h2 className="font-bold text-lg dark:text-white font-sans tracking-tight">AM-CRM</h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">v2.0 PRO</p>
                    </div>
                </div>
            </div>
            <nav className="flex-1 px-4 space-y-2 overflow-y-auto py-2" role="navigation" aria-label="Main navigation">
                {menuItems.map(item => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={() => setIsMobileOpen(false)}
                        aria-label={`Navigate to ${item.label}`}
                        className={({ isActive }) => `w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 relative overflow-hidden group outline-none ${isActive
                            ? 'bg-primary-600/10 text-primary-700 dark:text-primary-300 font-bold'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
                            }`}
                    >
                        {({ isActive }) => (
                            <>
                                <div className={`absolute inset-0 bg-gradient-to-r from-primary-500/10 to-transparent opacity-0 transition-opacity duration-300 ${isActive ? 'opacity-100' : 'group-hover:opacity-50'}`} />
                                {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary-600 rounded-r-full" />}
                                <item.icon size={20} className={`relative z-10 transition-colors ${isActive ? 'text-primary-600 dark:text-primary-400' : 'group-hover:text-primary-500'}`} aria-hidden="true" />
                                <span className="relative z-10">{item.label}</span>
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>
            <div className="p-4 border-t dark:border-slate-700 space-y-2">
                <button
                    onClick={() => setDark(!dark)}
                    aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
                    className="w-full flex items-center justify-center gap-2 px-3 py-3 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors dark:text-white min-h-[48px] active:bg-slate-300 dark:active:bg-slate-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                    {dark ? <Sun size={16} aria-hidden="true" /> : <Moon size={16} aria-hidden="true" />}
                    <span className="text-sm">{dark ? 'Light Mode' : 'Dark Mode'}</span>
                </button>
                <button
                    onClick={logout}
                    aria-label="Logout from application"
                    className="w-full flex items-center justify-center gap-2 px-3 py-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors min-h-[48px] active:bg-red-300 dark:active:bg-red-900/70 focus:ring-2 focus:ring-red-500 focus:outline-none"
                >
                    <LogOut size={16} aria-hidden="true" />
                    <span className="text-sm">{t('logout')}</span>
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black/50 lg:hidden"
                    onClick={() => setIsMobileOpen(false)}
                    aria-hidden="true"
                />
            )}
            {/* Mobile Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-40 w-72 bg-white dark:bg-slate-800 shadow-2xl transform transition-transform duration-300 lg:hidden ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
                aria-label="Mobile navigation sidebar"
            >
                {sidebarContent}
            </aside>
            {/* Desktop Sidebar */}
            <aside
                className="hidden lg:block w-72 bg-white dark:bg-slate-800 shadow-xl h-screen sticky top-0"
                aria-label="Desktop navigation sidebar"
            >
                {sidebarContent}
            </aside>
        </>
    );
};

export default Sidebar;

