import React, { useState, useContext, useRef, useEffect } from 'react';
import { Store, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import useTranslation from '../../hooks/useTranslation';
import { AuthContext, ToastContext } from '../../contexts/AppContext';
import { signIn } from '../../services/db';

const LoginScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [attempts, setAttempts] = useState(0);
    const [blockEndTime, setBlockEndTime] = useState(null);
    const { login } = useContext(AuthContext);
    const { showToast } = useContext(ToastContext);
    const t = useTranslation();
    const blockTimerRef = useRef(null);

    // Rate limiting - block after 5 failed attempts for 30 seconds
    const isBlocked = blockEndTime && Date.now() < blockEndTime;

    // Clear block timer on unmount
    useEffect(() => {
        return () => {
            if (blockTimerRef.current) {
                clearTimeout(blockTimerRef.current);
            }
        };
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isBlocked) {
            const remainingSeconds = Math.ceil((blockEndTime - Date.now()) / 1000);
            showToast(`Too many attempts. Try again in ${remainingSeconds} seconds.`, 'error');
            return;
        }

        if (!email || !password) {
            showToast('Please enter email and password', 'error');
            return;
        }

        setIsLoading(true);

        try {
            // Use Supabase Auth (or mock for development)
            const { data, error } = await signIn(email, password);

            if (error) {
                const newAttempts = attempts + 1;
                setAttempts(newAttempts);
                if (newAttempts >= 5) {
                    setBlockEndTime(Date.now() + 30000); // Block for 30 seconds
                }
                showToast(error.message || t('loginError'), 'error');
                return;
            }

            if (data?.user) {
                // Create session from Supabase response
                const sessionData = {
                    user: {
                        id: data.user.id,
                        email: data.user.email,
                        username: data.user.user_metadata?.username || data.user.email?.split('@')[0] || 'User'
                    },
                    session: data.session,
                    expiry: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
                };
                login(sessionData);
                setAttempts(0);
                setBlockEndTime(null);
                showToast('Login successful!', 'success');
            } else {
                const newAttempts = attempts + 1;
                setAttempts(newAttempts);
                if (newAttempts >= 5) {
                    setBlockEndTime(Date.now() + 30000);
                }
                showToast(t('loginError'), 'error');
            }
        } catch (error) {
            console.error('Login error:', error);
            showToast('An error occurred. Please try again.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-primary-950 to-slate-900 p-4">
            <div className="w-full max-w-md">
                <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
                    <div className="text-center mb-8">
                        <div className="w-20 h-20 bg-gradient-to-br from-primary-600 to-indigo-700 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                            <Store size={40} className="text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2">AM-CRM</h1>
                        <p className="text-slate-300">Single-Tenant Private CRM</p>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                <Mail size={16} className="inline mr-2" />
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="admin@example.com"
                                disabled={isLoading || isBlocked}
                                autoComplete="email"
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                <Lock size={16} className="inline mr-2" />
                                {t('password')}
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    disabled={isLoading || isBlocked}
                                    autoComplete="current-password"
                                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50 pr-12"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>
                        {isBlocked && (
                            <p className="text-red-400 text-sm text-center">
                                Temporarily blocked due to multiple failed attempts
                            </p>
                        )}
                        {attempts > 0 && attempts < 5 && (
                            <p className="text-amber-400 text-sm text-center">
                                Remaining attempts: {5 - attempts}
                            </p>
                        )}
                        <button
                            type="submit"
                            disabled={isLoading || isBlocked}
                            className="w-full py-3 bg-gradient-to-r from-primary-600 to-indigo-700 hover:from-primary-700 hover:to-indigo-800 text-white font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-primary-500/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                                    <span>Verifying...</span>
                                </>
                            ) : t('login')}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoginScreen;
