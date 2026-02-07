import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

// Route label mapping
const routeLabels = {
    '': { label: 'Dashboard', icon: '🏠' },
    'dashboard': { label: 'Dashboard', icon: '🏠' },
    'stores': { label: 'Stores', icon: '🏪' },
    'visits': { label: 'Visits', icon: '📅' },
    'tasks': { label: 'Tasks', icon: '📋' },
    'map': { label: 'Map', icon: '🗺️' },
    'analytics': { label: 'Analytics', icon: '📊' },
    'settings': { label: 'Settings', icon: '⚙️' },
    'archive': { label: 'Archive', icon: '📦' },
    'menu-builder': { label: 'Menu Builder', icon: '🍽️' },
};

const Breadcrumbs = ({ customItems = [] }) => {
    const location = useLocation();
    const pathnames = location.pathname.split('/').filter(x => x);

    // Don't show breadcrumbs on home
    if (pathnames.length === 0) return null;

    const items = customItems.length > 0 ? customItems : pathnames.map((path, index) => {
        const to = `/${pathnames.slice(0, index + 1).join('/')}`;
        const config = routeLabels[path] || { label: path, icon: '📁' };
        return { to, ...config };
    });

    return (
        <nav aria-label="Breadcrumb" className="mb-4">
            <ol className="flex items-center gap-1 text-sm">
                {/* Home */}
                <li>
                    <Link
                        to="/"
                        className="flex items-center gap-1.5 px-2 py-1 text-slate-500 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        <Home size={14} />
                        <span className="hidden sm:inline">Home</span>
                    </Link>
                </li>

                {items.map((item, index) => (
                    <React.Fragment key={item.to || index}>
                        {/* Separator */}
                        <li className="text-slate-300 dark:text-slate-600">
                            <ChevronRight size={14} />
                        </li>

                        {/* Breadcrumb Item */}
                        <li>
                            {index === items.length - 1 ? (
                                // Current page (not a link)
                                <span className="flex items-center gap-1.5 px-2 py-1 font-medium text-slate-800 dark:text-slate-200">
                                    <span className="text-base">{item.icon}</span>
                                    {item.label}
                                </span>
                            ) : (
                                // Link to previous page
                                <Link
                                    to={item.to}
                                    className="flex items-center gap-1.5 px-2 py-1 text-slate-500 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                >
                                    <span className="text-base">{item.icon}</span>
                                    {item.label}
                                </Link>
                            )}
                        </li>
                    </React.Fragment>
                ))}
            </ol>
        </nav>
    );
};

export default Breadcrumbs;
