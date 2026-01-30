/**
 * NotificationService - إدارة الإشعارات المحلية والتذكيرات
 * يدعم:
 * - طلب إذن الإشعارات
 * - إرسال إشعارات فورية
 * - جدولة تذكيرات للمهام
 * - تنبيهات الزيارات المتأخرة
 */

class NotificationService {
    constructor() {
        this.permission = 'default';
        this.scheduledNotifications = new Map();
        this.checkInterval = null;
    }

    /**
     * تهيئة الخدمة وطلب الإذن
     */
    async init() {
        if (!('Notification' in window)) {
            console.warn('This browser does not support notifications');
            return false;
        }

        this.permission = Notification.permission;

        if (this.permission === 'default') {
            this.permission = await Notification.requestPermission();
        }

        // بدء فحص التذكيرات كل دقيقة
        this.startReminderCheck();

        return this.permission === 'granted';
    }

    /**
     * طلب إذن الإشعارات
     */
    async requestPermission() {
        if (!('Notification' in window)) {
            return 'unsupported';
        }

        this.permission = await Notification.requestPermission();
        return this.permission;
    }

    /**
     * الحصول على حالة الإذن
     */
    getPermissionStatus() {
        if (!('Notification' in window)) {
            return 'unsupported';
        }
        return Notification.permission;
    }

    /**
     * إرسال إشعار فوري
     */
    async send(title, options = {}) {
        // التحقق من الإذن الفعلي من المتصفح مباشرة
        const currentPermission = this.getPermissionStatus();
        if (currentPermission !== 'granted') {
            console.warn('Notification permission not granted. Current status:', currentPermission);
            return null;
        }

        // تحديث القيمة المخزنة
        this.permission = currentPermission;

        const defaultOptions = {
            icon: '/icon-192x192.png',
            badge: '/icon-192x192.png',
            vibrate: [200, 100, 200],
            tag: options.tag || 'am-crm-notification',
            renotify: true,
            requireInteraction: false,
            ...options
        };

        try {
            const notification = new Notification(title, defaultOptions);

            notification.onclick = (event) => {
                event.preventDefault();
                window.focus();
                if (options.onClick) {
                    options.onClick(event);
                }
                notification.close();
            };

            return notification;
        } catch (error) {
            console.error('Error sending notification:', error);
            return null;
        }
    }

    /**
     * إرسال تذكير بمهمة
     */
    sendTaskReminder(task) {
        const dueDate = new Date(task.due_date);
        const formattedDate = dueDate.toLocaleDateString('ar-IQ');

        return this.send(`📋 تذكير: ${task.title}`, {
            body: `موعد التسليم: ${formattedDate}\n${task.description || ''}`,
            tag: `task-${task.id}`,
            data: { type: 'task', id: task.id },
            onClick: () => {
                window.location.href = '/tasks';
            }
        });
    }

    /**
     * إرسال تنبيه زيارة متأخرة
     */
    sendOverdueVisitAlert(visit, store) {
        const visitDate = new Date(visit.date);
        const formattedDate = visitDate.toLocaleDateString('ar-IQ');

        return this.send(`⚠️ زيارة متأخرة: ${store?.name || 'متجر'}`, {
            body: `كانت مجدولة في: ${formattedDate}\nالحالة: ${visit.status}`,
            tag: `visit-${visit.id}`,
            data: { type: 'visit', id: visit.id },
            onClick: () => {
                window.location.href = '/visits';
            }
        });
    }

    /**
     * إرسال تذكير بزيارة قادمة
     */
    sendUpcomingVisitReminder(visit, store) {
        const visitDate = new Date(visit.date);
        const formattedDate = visitDate.toLocaleDateString('ar-IQ');

        return this.send(`📍 زيارة قادمة: ${store?.name || 'متجر'}`, {
            body: `الموعد: ${formattedDate}\nلا تنسَ التحضير للزيارة!`,
            tag: `visit-upcoming-${visit.id}`,
            data: { type: 'visit', id: visit.id },
            onClick: () => {
                window.location.href = '/visits';
            }
        });
    }

    /**
     * فحص المهام والزيارات وإرسال التذكيرات
     */
    checkReminders(tasks = [], visits = [], stores = []) {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // التحقق من المهام المتأخرة أو القادمة
        tasks.forEach(task => {
            if (task.status === 'done') return;

            const dueDate = new Date(task.due_date);
            const dueDateOnly = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());

            // مهمة متأخرة
            if (dueDateOnly < today) {
                const notificationKey = `task-overdue-${task.id}-${today.toISOString().split('T')[0]}`;
                if (!this.scheduledNotifications.has(notificationKey)) {
                    this.send(`🚨 مهمة متأخرة: ${task.title}`, {
                        body: `كان موعدها: ${dueDate.toLocaleDateString('ar-IQ')}`,
                        tag: notificationKey,
                        onClick: () => window.location.href = '/tasks'
                    });
                    this.scheduledNotifications.set(notificationKey, true);
                }
            }

            // مهمة موعدها اليوم
            if (dueDateOnly.getTime() === today.getTime()) {
                const notificationKey = `task-today-${task.id}-${today.toISOString().split('T')[0]}`;
                if (!this.scheduledNotifications.has(notificationKey)) {
                    this.send(`📋 مهمة اليوم: ${task.title}`, {
                        body: task.description || 'لا تنسَ إكمالها!',
                        tag: notificationKey,
                        onClick: () => window.location.href = '/tasks'
                    });
                    this.scheduledNotifications.set(notificationKey, true);
                }
            }

            // مهمة موعدها غداً
            if (dueDateOnly.getTime() === tomorrow.getTime()) {
                const notificationKey = `task-tomorrow-${task.id}-${today.toISOString().split('T')[0]}`;
                if (!this.scheduledNotifications.has(notificationKey)) {
                    this.send(`⏰ مهمة غداً: ${task.title}`, {
                        body: 'تذكير مبكر للتحضير',
                        tag: notificationKey,
                        onClick: () => window.location.href = '/tasks'
                    });
                    this.scheduledNotifications.set(notificationKey, true);
                }
            }
        });

        // التحقق من الزيارات المتأخرة أو القادمة
        visits.forEach(visit => {
            if (visit.status === 'completed') return;

            const visitDate = new Date(visit.date);
            const visitDateOnly = new Date(visitDate.getFullYear(), visitDate.getMonth(), visitDate.getDate());
            const store = stores.find(s => s.id === visit.store_id);

            // زيارة متأخرة
            if (visitDateOnly < today && visit.status !== 'completed') {
                const notificationKey = `visit-overdue-${visit.id}-${today.toISOString().split('T')[0]}`;
                if (!this.scheduledNotifications.has(notificationKey)) {
                    this.sendOverdueVisitAlert(visit, store);
                    this.scheduledNotifications.set(notificationKey, true);
                }
            }

            // زيارة اليوم
            if (visitDateOnly.getTime() === today.getTime()) {
                const notificationKey = `visit-today-${visit.id}-${today.toISOString().split('T')[0]}`;
                if (!this.scheduledNotifications.has(notificationKey)) {
                    this.send(`📍 زيارة اليوم: ${store?.name || 'متجر'}`, {
                        body: 'لديك زيارة مجدولة لهذا المتجر اليوم',
                        tag: notificationKey,
                        onClick: () => window.location.href = '/visits'
                    });
                    this.scheduledNotifications.set(notificationKey, true);
                }
            }
        });
    }

    /**
     * بدء فحص التذكيرات الدوري
     */
    startReminderCheck() {
        // تنظيف الفترة السابقة إن وجدت
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
        }

        // فحص كل 5 دقائق
        this.checkInterval = setInterval(() => {
            // سيتم استدعاء checkReminders من DataContext
            window.dispatchEvent(new CustomEvent('check-reminders'));
        }, 5 * 60 * 1000);
    }

    /**
     * إيقاف فحص التذكيرات
     */
    stopReminderCheck() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
        }
    }

    /**
     * مسح الإشعارات المجدولة (لليوم التالي)
     */
    clearScheduledNotifications() {
        this.scheduledNotifications.clear();
    }
}

// إنشاء instance واحد للخدمة
export const notificationService = new NotificationService();

export default notificationService;
