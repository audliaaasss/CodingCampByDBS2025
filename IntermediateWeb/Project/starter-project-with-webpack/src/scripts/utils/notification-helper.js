import CONFIG from '../config';

const NotificationHelper = {
    async requestPermission() {
        if (!('Notification' in window)) {
            console.error('This browser does not support notifications');
            return false;
        }

        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
            console.error('Failed to get permission for notification');
            return false;
        }

        return true;
    },

    async getSubscription() {
        if (!('serviceWorker' in navigator)) {
            return null;
        }

        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();
            return subscription;
        } catch (error) {
            console.error('Error getting subscription', error);
            return null;
        }
    },

    async subscribe() {
        const hasPermission = await this.requestPermission();
        if (!hasPermission) {
            return { error: true, message: 'Notification permission denied' };
        }

        try {
            if (!('serviceWorker' in navigator)) {
                return { error: true, message: 'Service Worker tidak didukung di browser ini' };
            }

            const registration = await navigator.serviceWorker.ready;
            if (!registration) {
                return { error: true, message: 'Service Worker tidak terdaftar' };
            }

            const existingSubscription = await registration.pushManager.getSubscription();
            if (existingSubscription) {
                return { 
                    error: false, 
                    message: 'Already subscribed', 
                    subscription: existingSubscription 
                };
            }

            console.log('Creating new subscription with key:', CONFIG.VAPID_PUBLIC_KEY);
            
            try {
                const applicationServerKey = this._urlBase64ToUint8Array(CONFIG.VAPID_PUBLIC_KEY);
                console.log('Converted application server key:', applicationServerKey);
                
                const subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: applicationServerKey,
                });
                
                console.log('New subscription created:', subscription);
                return { error: false, message: 'Subscribed successfully', subscription };
            } catch (subscribeError) {
                console.error('Push Manager subscribe error:', subscribeError);
                return { error: true, message: `Subscription error: ${subscribeError.message}` };
            }
        } catch (error) {
            console.error('Error subscribing to push notifications:', error);
            return { error: true, message: `Subscription failed: ${error.message}` };
        }
    },

    async unsubscribe() {
        try {
            const subscription = await this.getSubscription();
            if (!subscription) {
                return { error: false, message: 'Not currently subscribed' };
            }

            await subscription.unsubscribe();
            return { error: false, message: 'Unsubscribed successfully' };
        } catch (error) {
            console.error('Error unsubscribing from push notifications:', error);
            return { error: true, message: `Unsubscribe failed: ${error.message}` };
        }
    },

    _urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
        const base64 = (base64String + padding)
            .replace(/-/g, '+')
            .replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; i++) {
            outputArray[i] = rawData.charCodeAt(i);
        }

        return outputArray;
    },
};

export default NotificationHelper;