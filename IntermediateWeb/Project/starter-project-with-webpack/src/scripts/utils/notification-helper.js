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

    async sendSubscriptionToServer(subscription, action = 'subscribe') {
        if (!CONFIG.API_BASE_URL && !CONFIG.ENABLE_SERVER_PUSH) {
            console.log('Server push disabled, skipping server registration');
            return { success: true, data: { message: 'Server registration skipped' } };
        }

        try {
            const endpoint = `${CONFIG.API_BASE_URL || '/api'}/push-subscription`;
            
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`,
                },
                body: JSON.stringify({
                    action: action, 
                    subscription: subscription,
                    userAgent: navigator.userAgent,
                    timestamp: Date.now()
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('Subscription sent to server successfully:', result);
            return { success: true, data: result };
        } catch (error) {
            console.error('Error sending subscription to server:', error);

            console.warn('Continuing with local subscription despite server error');
            return { success: false, error: error.message, skipError: true };
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
                const serverResult = await this.sendSubscriptionToServer(existingSubscription, 'subscribe');
                if (!serverResult.success && !serverResult.skipError) {
                    console.warn('Failed to register existing subscription with server:', serverResult.error);
                }
                
                if (navigator.serviceWorker.controller) {
                    navigator.serviceWorker.controller.postMessage({
                        type: 'SUBSCRIPTION_STATUS',
                        isSubscribed: true,
                        timestamp: Date.now()
                    });
                }
                
                localStorage.setItem('pushNotificationStatus', 'subscribed');
                
                return { 
                    error: false, 
                    message: 'Already subscribed', 
                    subscription: existingSubscription,
                    serverRegistered: serverResult.success
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
                
                const serverResult = await this.sendSubscriptionToServer(subscription, 'subscribe');
                if (!serverResult.success && !serverResult.skipError) {
                    console.error('Failed to register subscription with server:', serverResult.error);

                    if (!serverResult.error.includes('404')) {
                        await subscription.unsubscribe();
                        return { error: true, message: `Server registration failed: ${serverResult.error}` };
                    }
                }
                
                try {
                    const { getAllStories } = await import('../data/api');
                    const response = await getAllStories();
                    if (response.ok && response.listStory.length > 0) {
                        const newestStory = [...response.listStory].sort((a, b) => 
                            new Date(b.createdAt) - new Date(a.createdAt)
                        )[0];
                        
                        localStorage.setItem('lastKnownStoryTime', 
                            new Date(newestStory.createdAt).getTime().toString());
                    }
                } catch (error) {
                    console.error('Error updating last known story time after subscription:', error);
                }

                localStorage.setItem('pushNotificationStatus', 'subscribed');
                
                if (navigator.serviceWorker.controller) {
                    navigator.serviceWorker.controller.postMessage({
                        type: 'SUBSCRIPTION_STATUS',
                        isSubscribed: true,
                        timestamp: Date.now()
                    });
                }
                
                return { 
                    error: false, 
                    message: 'Subscribed successfully', 
                    subscription,
                    serverRegistered: serverResult.success || serverResult.skipError
                };
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

            const serverResult = await this.sendSubscriptionToServer(subscription, 'unsubscribe');
            if (!serverResult.success) {
                console.warn('Failed to unregister subscription from server:', serverResult.error);
            }

            await subscription.unsubscribe();
            
            localStorage.setItem('pushNotificationStatus', 'unsubscribed');
            
            if (navigator.serviceWorker.controller) {
                navigator.serviceWorker.controller.postMessage({
                    type: 'UNSUBSCRIBE_PUSH',
                    timestamp: Date.now()
                });
            }

            return { 
                error: false, 
                message: 'Unsubscribed successfully',
                serverUnregistered: serverResult.success
            };
        } catch (error) {
            console.error('Error unsubscribing from push notifications:', error);
            return { error: true, message: `Unsubscribe failed: ${error.message}` };
        }
    },

    async checkSubscriptionStatus() {
        try {
            const subscription = await this.getSubscription();
            const isSubscribed = !!subscription;
            
            if (navigator.serviceWorker.controller) {
                navigator.serviceWorker.controller.postMessage({
                    type: 'SUBSCRIPTION_STATUS',
                    isSubscribed: isSubscribed,
                    timestamp: Date.now()
                });
            }
            
            localStorage.setItem('pushNotificationStatus', isSubscribed ? 'subscribed' : 'unsubscribed');
            
            return {
                isSubscribed,
                subscription,
                permission: Notification.permission
            };
        } catch (error) {
            console.error('Error checking subscription status:', error);
            return {
                isSubscribed: false,
                subscription: null,
                permission: Notification.permission,
                error: error.message
            };
        }
    },

    async testNotification(title = 'Test Notification', message = 'This is a test notification') {
        try {
            const status = await this.checkSubscriptionStatus();
            if (!status.isSubscribed) {
                return { error: true, message: 'Not subscribed to push notifications' };
            }

            if (navigator.serviceWorker.controller) {
                navigator.serviceWorker.controller.postMessage({
                    type: 'SIMULATE_PUSH',
                    title: title,
                    message: message,
                    url: window.location.href,
                    timestamp: Date.now()
                });
                
                return { error: false, message: 'Test notification sent' };
            } else {
                return { error: true, message: 'Service worker not available' };
            }
        } catch (error) {
            console.error('Error sending test notification:', error);
            return { error: true, message: `Test notification failed: ${error.message}` };
        }
    },

    setupMessageListener() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.addEventListener('message', (event) => {
                console.log('Received message from service worker:', event.data);
                
                if (event.data && event.data.type === 'SUBSCRIPTION_STATUS_RESPONSE') {
                    const { isSubscribed, subscription } = event.data;
                    localStorage.setItem('pushNotificationStatus', isSubscribed ? 'subscribed' : 'unsubscribed');
                    
                    window.dispatchEvent(new CustomEvent('subscriptionStatusChanged', {
                        detail: { isSubscribed, subscription }
                    }));
                }
            });
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

NotificationHelper.setupMessageListener();

export default NotificationHelper;