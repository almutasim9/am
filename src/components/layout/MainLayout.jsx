import React, { useState, useContext, useRef, useEffect } from 'react';
import { Menu, Keyboard } from 'lucide-react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { DataContext } from '../../contexts/DataContext';
import LoadingSpinner from '../common/LoadingSpinner';
import GlobalSearch from '../common/GlobalSearch';
import NotificationBell from '../common/NotificationBell';
import Sidebar from './Sidebar';
import NewTaskDialog from '../modules/Kanban/NewTaskDialog';
import NewVisitDialog from '../modules/Visits/NewVisitDialog';
import FloatingActionButton from '../common/FloatingActionButton';
import KeyboardShortcutsHelp from '../common/KeyboardShortcutsHelp';
import useKeyboardShortcuts from '../../hooks/useKeyboardShortcuts';

const MainLayout = () => {
    const navigate = useNavigate();
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const location = useLocation();
    const isDashboard = location.pathname === '/' || location.pathname === '/dashboard';
    const searchInputRef = useRef(null);

    // Dialog State
    const [showTaskDialog, setShowTaskDialog] = useState(false);
    const [showVisitDialog, setShowVisitDialog] = useState(false);
    const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);
    const [preselectedStoreId, setPreselectedStoreId] = useState(null);

    const { stores, visits, tasks, isLoading } = useContext(DataContext);

    const openTaskDialog = (storeId = null) => {
        setPreselectedStoreId(storeId);
        setShowTaskDialog(true);
    };

    const openVisitDialog = (storeId = null) => {
        setPreselectedStoreId(storeId);
        setShowVisitDialog(true);
    };

    // تفعيل اختصارات لوحة المفاتيح
    const { shortcuts } = useKeyboardShortcuts({
        onSearch: () => {
            // Focus on search input
            const searchInput = document.querySelector('input[placeholder*="البحث"]');
            if (searchInput) {
                searchInput.focus();
            }
        },
        onNewTask: () => {
            openTaskDialog(null);
        },
        onNewVisit: () => {
            openVisitDialog(null);
        },
        onShowHelp: () => {
            setShowShortcutsHelp(true);
        },
        onNavigate: (path) => {
            navigate(path);
        },
        onEscape: () => {
            // إغلاق جميع النوافذ المفتوحة
            setShowTaskDialog(false);
            setShowVisitDialog(false);
            setShowShortcutsHelp(false);
            setIsMobileOpen(false);
        },
        enabled: true
    });

    if (isLoading) return <LoadingSpinner />;

    return (
        <div className="flex min-h-screen transition-colors duration-300">
            <Sidebar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />
            <main className="flex-1 p-4 lg:p-6 ml-0 lg:ml-0 transition-all pb-24">
                {/* Header with Search and Notifications */}
                <div className="hidden lg:flex items-center justify-end gap-4 mb-6">
                    <GlobalSearch stores={stores} tasks={tasks} visits={visits} />
                    <NotificationBell tasks={tasks} visits={visits} stores={stores} />
                    {/* Keyboard Shortcuts Button */}
                    <button
                        onClick={() => setShowShortcutsHelp(true)}
                        className="p-2 bg-slate-100 dark:bg-slate-700 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors group"
                        title="اختصارات لوحة المفاتيح (?)"
                    >
                        <Keyboard size={20} className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300" />
                    </button>
                </div>
                {/* Mobile Header */}
                <div className="lg:hidden flex items-center justify-between mb-6">
                    <button onClick={() => setIsMobileOpen(true)} className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow">
                        <Menu size={24} className="dark:text-white" />
                    </button>
                    <h1 className="text-xl font-bold dark:text-white">AM-CRM</h1>
                    <NotificationBell tasks={tasks} visits={visits} stores={stores} />
                </div>

                {/* Render Routes */}
                <Outlet context={{ openTaskDialog, openVisitDialog }} />
            </main>

            {/* Smart Dialogs */}
            <NewTaskDialog
                isOpen={showTaskDialog}
                onClose={() => setShowTaskDialog(false)}
                preselectedStoreId={preselectedStoreId}
            />

            <NewVisitDialog
                isOpen={showVisitDialog}
                onClose={() => setShowVisitDialog(false)}
                preselectedStoreId={preselectedStoreId}
            />

            {/* Keyboard Shortcuts Help Modal */}
            <KeyboardShortcutsHelp
                isOpen={showShortcutsHelp}
                onClose={() => setShowShortcutsHelp(false)}
                shortcuts={shortcuts}
            />

            {/* Quick Actions FAB - Global */}
            <FloatingActionButton
                onNewVisit={() => openVisitDialog(null)}
                onNewTask={() => openTaskDialog(null)}
            />
        </div>
    );
};

export default MainLayout;
