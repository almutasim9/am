import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Store, Bell, BellOff, BellRing } from 'lucide-react';
import { formatDate } from '../../utils/helpers';
import notificationService from '../../services/NotificationService';

const NotificationBell = ({ tasks, visits, stores = [] }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [notificationPermission, setNotificationPermission] = useState('default');
    const [isRequesting, setIsRequesting] = useState(false);

    // التحقق من حالة الإذن عند التحميل
    useEffect(() => {
        setNotificationPermission(notificationService.getPermissionStatus());
    }, []);

    // فحص التذكيرات عند تغير البيانات
    useEffect(() => {
        if (notificationPermission === 'granted') {
            notificationService.checkReminders(tasks, visits, stores);
        }
    }, [tasks, visits, stores, notificationPermission]);

    // الاستماع لأحداث فحص التذكيرات
    useEffect(() => {
        const handleReminderCheck = () => {
            if (notificationPermission === 'granted') {
                notificationService.checkReminders(tasks, visits, stores);
            }
        };

        window.addEventListener('check-reminders', handleReminderCheck);
        return () => window.removeEventListener('check-reminders', handleReminderCheck);
    }, [tasks, visits, stores, notificationPermission]);

    const overdueTasks = tasks.filter(t => {
        if (t.status === 'done') return false;
        if (!t.due_date) return false;
        return new Date(t.due_date) < new Date();
    });

    const overdueVisits = visits.filter(v => {
        if (v.status !== 'scheduled') return false;
        if (!v.date) return false;
        return new Date(v.date) < new Date();
    });

    const todayTasks = tasks.filter(t => {
        if (t.status === 'done') return false;
        if (!t.due_date) return false;
        const today = new Date();
        const dueDate = new Date(t.due_date);
        return dueDate.toDateString() === today.toDateString();
    });

    const todayVisits = visits.filter(v => {
        if (v.status === 'completed') return false;
        if (!v.date) return false;
        const today = new Date();
        const visitDate = new Date(v.date);
        return visitDate.toDateString() === today.toDateString();
    });

    const totalOverdue = overdueTasks.length + overdueVisits.length;
    const totalToday = todayTasks.length + todayVisits.length;

    const findStoreName = (id) => {
        const store = stores.find(s => s.id === id);
        return store ? store.name : 'متجر غير معروف';
    };

    const handleEnableNotifications = async () => {
        setIsRequesting(true);
        try {
            const permission = await notificationService.requestPermission();
            setNotificationPermission(permission);

            if (permission === 'granted') {
                // إرسال إشعار ترحيبي
                notificationService.send('🎉 تم تفعيل الإشعارات!', {
                    body: 'ستتلقى الآن تذكيرات بالمهام والزيارات القادمة',
                    tag: 'welcome'
                });
            }
        } finally {
            setIsRequesting(false);
        }
    };

    const getNotificationIcon = () => {
        if (totalOverdue > 0) {
            return <BellRing size={20} className="text-red-500 animate-pulse" />;
        }
        if (notificationPermission === 'granted') {
            return <Bell size={20} className="text-emerald-500" />;
        }
        return <BellOff size={20} className="text-slate-400" />;
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 bg-slate-100 dark:bg-slate-700 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            >
                {getNotificationIcon()}
                {(totalOverdue > 0 || totalToday > 0) && (
                    <span className={`absolute -top-1 -right-1 min-w-5 h-5 px-1 text-white text-xs rounded-full flex items-center justify-center ${totalOverdue > 0 ? 'bg-red-500 animate-pulse' : 'bg-blue-500'}`}>
                        {totalOverdue + totalToday}
                    </span>
                )}
            </button>

            {isOpen && (
                <>
                    <div className="absolute top-full mt-2 right-0 w-80 max-w-[calc(100vw-2rem)] bg-white dark:bg-slate-800 rounded-xl shadow-xl border dark:border-slate-700 z-50 max-h-[28rem] overflow-hidden">
                        {/* Header */}
                        <div className="p-3 border-b dark:border-slate-700 flex items-center justify-between">
                            <h3 className="font-bold dark:text-white flex items-center gap-2">
                                <Bell size={16} /> التنبيهات
                            </h3>
                            {notificationPermission !== 'granted' && (
                                <button
                                    onClick={handleEnableNotifications}
                                    disabled={isRequesting || notificationPermission === 'denied'}
                                    className="text-xs px-2 py-1 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-400 text-white rounded-lg transition-colors flex items-center gap-1"
                                >
                                    {isRequesting ? (
                                        <span className="animate-spin">⏳</span>
                                    ) : notificationPermission === 'denied' ? (
                                        'محظور'
                                    ) : (
                                        <>
                                            <Bell size={12} /> تفعيل
                                        </>
                                    )}
                                </button>
                            )}
                        </div>

                        <div className="overflow-y-auto max-h-80">
                            {/* Permission Banner */}
                            {notificationPermission === 'default' && (
                                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-100 dark:border-blue-800">
                                    <p className="text-xs text-blue-700 dark:text-blue-300">
                                        💡 فعّل الإشعارات لتلقي تذكيرات بالمهام والزيارات
                                    </p>
                                </div>
                            )}

                            {notificationPermission === 'denied' && (
                                <div className="p-3 bg-red-50 dark:bg-red-900/20 border-b border-red-100 dark:border-red-800">
                                    <p className="text-xs text-red-700 dark:text-red-300">
                                        ⚠️ الإشعارات محظورة. يرجى تفعيلها من إعدادات المتصفح
                                    </p>
                                </div>
                            )}

                            {/* Overdue Section */}
                            {totalOverdue > 0 && (
                                <div className="p-2 border-b dark:border-slate-700">
                                    <p className="text-xs font-semibold text-red-600 dark:text-red-400 mb-2 px-1">
                                        🚨 متأخرة ({totalOverdue})
                                    </p>
                                    <div className="space-y-2">
                                        {overdueTasks.map(t => (
                                            <div key={t.id} className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                                                <p className="text-sm font-medium text-red-700 dark:text-red-400">📌 {t.title || t.sub}</p>
                                                <p className="text-xs text-red-600 dark:text-red-500 flex items-center gap-1 mt-1">
                                                    <Store size={10} /> {findStoreName(t.store_id)}
                                                </p>
                                                <p className="text-xs text-red-500/80 mt-1">متأخرة منذ {formatDate(t.due_date)}</p>
                                            </div>
                                        ))}
                                        {overdueVisits.map(v => (
                                            <div key={v.id} className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                                                <p className="text-sm font-medium text-amber-700 dark:text-amber-400">📅 زيارة فائتة</p>
                                                <p className="text-xs text-amber-600 dark:text-amber-500 flex items-center gap-1 mt-1">
                                                    <Store size={10} /> {findStoreName(v.store_id)}
                                                </p>
                                                <p className="text-xs text-amber-500/80 mt-1">{v.type} - {formatDate(v.date)}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Today Section */}
                            {totalToday > 0 && (
                                <div className="p-2 border-b dark:border-slate-700">
                                    <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-2 px-1">
                                        📆 اليوم ({totalToday})
                                    </p>
                                    <div className="space-y-2">
                                        {todayTasks.map(t => (
                                            <div key={t.id} className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                                <p className="text-sm font-medium text-blue-700 dark:text-blue-400">📋 {t.title || t.sub}</p>
                                                <p className="text-xs text-blue-600 dark:text-blue-500 flex items-center gap-1 mt-1">
                                                    <Store size={10} /> {findStoreName(t.store_id)}
                                                </p>
                                            </div>
                                        ))}
                                        {todayVisits.map(v => (
                                            <div key={v.id} className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                                                <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">📍 زيارة اليوم</p>
                                                <p className="text-xs text-emerald-600 dark:text-emerald-500 flex items-center gap-1 mt-1">
                                                    <Store size={10} /> {findStoreName(v.store_id)}
                                                </p>
                                                <p className="text-xs text-emerald-500/80 mt-1">{v.type}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Empty State */}
                            {totalOverdue === 0 && totalToday === 0 && (
                                <div className="p-6 text-center">
                                    <CheckCircle size={32} className="mx-auto text-emerald-500 mb-2" />
                                    <p className="text-sm text-slate-500 dark:text-slate-400">لا توجد تنبيهات</p>
                                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">أنت على المسار الصحيح! 🎯</p>
                                </div>
                            )}
                        </div>

                        {/* Footer with notification status */}
                        <div className="p-2 border-t dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                            <p className="text-xs text-center text-slate-400 flex items-center justify-center gap-1">
                                {notificationPermission === 'granted' ? (
                                    <><Bell size={10} className="text-emerald-500" /> الإشعارات مفعّلة</>
                                ) : (
                                    <><BellOff size={10} /> الإشعارات غير مفعّلة</>
                                )}
                            </p>
                        </div>
                    </div>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                </>
            )}
        </div>
    );
};

export default NotificationBell;
