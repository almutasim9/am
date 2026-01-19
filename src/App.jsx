import React, { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthContext, LangContext, ThemeContext, ToastContext } from './contexts/AppContext';
import { DataProvider } from './contexts/DataContext';
import { signOut } from './services/db';
import Toast from './components/common/Toast';
import LoginScreen from './components/auth/LoginScreen';
import MainLayout from './components/layout/MainLayout';
import LoadingSpinner from './components/common/LoadingSpinner';

// Lazy-loaded Pages for Code Splitting
const Dashboard = lazy(() => import('./components/modules/Dashboard/Dashboard'));
const TasksBoard = lazy(() => import('./components/modules/Kanban/TasksBoard'));
const VisitsList = lazy(() => import('./components/modules/Visits/VisitsList'));
const ArchiveView = lazy(() => import('./components/modules/Archive/ArchiveView'));
const StoresManagement = lazy(() => import('./components/modules/Stores/StoresManagement'));
const StoresMap = lazy(() => import('./components/modules/Map/StoresMap'));
const SettingsPanel = lazy(() => import('./components/modules/Settings/SettingsPanel'));
const Analytics = lazy(() => import('./components/modules/Analytics/Analytics'));
const MenuBuilder = lazy(() => import('./components/modules/MenuBuilder/MenuBuilder'));


// React Query client with default options
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (garbage collection)
      retry: 2,
      refetchOnWindowFocus: true, // Refetch when user returns to tab
    },
  },
});

// Page wrapper with Suspense
const PageWrapper = ({ children }) => (
  <Suspense fallback={<LoadingSpinner />}>
    {children}
  </Suspense>
);

function App() {
  const [user, setUser] = useState(() => {
    // Load user from localStorage on initial load
    const saved = localStorage.getItem('crm_user');
    if (saved) {
      try {
        const session = JSON.parse(saved);
        // Check if session has expiry and if it's expired
        if (session.expiry && Date.now() > session.expiry) {
          localStorage.removeItem('crm_user');
          return null;
        }
        // Return user object (support both old and new format)
        return session.user || session;
      } catch {
        localStorage.removeItem('crm_user');
        return null;
      }
    }
    return null;
  });
  const [lang, setLang] = useState(() => localStorage.getItem('crm_lang') || 'en');
  const [dark, setDark] = useState(() => localStorage.getItem('crm_dark') !== 'false');
  const [toast, setToast] = useState(null);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('crm_user', JSON.stringify(userData));
  };

  const handleLogout = async () => {
    // Call Supabase signOut to properly close session
    await signOut();
    setUser(null);
    localStorage.removeItem('crm_user');
  };

  const handleSetLang = (newLang) => {
    setLang(newLang);
    localStorage.setItem('crm_lang', newLang);
  };

  const handleSetDark = (newDark) => {
    setDark(newDark);
    localStorage.setItem('crm_dark', String(newDark));
  };

  const showToast = (message, type = 'info') => setToast({ message, type });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [dark, lang]);

  return (
    <AuthContext.Provider value={{ user, login: handleLogin, logout: handleLogout }}>
      <LangContext.Provider value={{ lang, setLang: handleSetLang }}>
        <ThemeContext.Provider value={{ dark, setDark: handleSetDark }}>
          <ToastContext.Provider value={{ showToast }}>
            <QueryClientProvider client={queryClient}>
              <DataProvider>
                <BrowserRouter>
                  <Routes>
                    <Route path="/login" element={!user ? <LoginScreen /> : <Navigate to="/" />} />

                    <Route path="/" element={user ? <MainLayout /> : <Navigate to="/login" />}>
                      <Route index element={<PageWrapper><Dashboard /></PageWrapper>} />
                      <Route path="dashboard" element={<Navigate to="/" replace />} />
                      <Route path="tasks" element={<PageWrapper><TasksBoard /></PageWrapper>} />
                      <Route path="visits" element={<PageWrapper><VisitsList /></PageWrapper>} />
                      <Route path="archive" element={<PageWrapper><ArchiveView /></PageWrapper>} />
                      <Route path="stores" element={<PageWrapper><StoresManagement /></PageWrapper>} />
                      <Route path="map" element={<PageWrapper><StoresMap /></PageWrapper>} />
                      <Route path="analytics" element={<PageWrapper><Analytics /></PageWrapper>} />
                      <Route path="menu-builder" element={<PageWrapper><MenuBuilder /></PageWrapper>} />

                      <Route path="settings" element={<PageWrapper><SettingsPanel /></PageWrapper>} />
                    </Route>
                  </Routes>
                </BrowserRouter>
              </DataProvider>
            </QueryClientProvider>
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
          </ToastContext.Provider>
        </ThemeContext.Provider>
      </LangContext.Provider>
    </AuthContext.Provider>
  );
}

export default App;
