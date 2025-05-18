export function showFormattedDate(date, locale = 'en-US', options = {}) {
    return new Date(date).toLocaleDateString(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        ...options,
    });
}

export function sleep(time = 1000) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

export function transitionHelper({ SkipTransition = false, updateDOM }) {
    if (SkipTransition || !document.startViewTransition) {
        const updateCallbackDone = Promise.resolve(updateDOM()).then(() => {});

        return {
            ready: Promise.reject(Error('View transitions unsupported')),
            updateCallbackDone,
            finished: updateCallbackDone,
        };
    }

    return document.startViewTransition(updateDOM);
}

export function isServiceWorkerAvailable() {
    return 'serviceWorker' in navigator;
}
 
/**
 * Register service worker for PWA
 * @returns {Promise<ServiceWorkerRegistration|null>}
 */
export async function registerServiceWorker() {
    if (!isServiceWorkerAvailable()) {
        console.log('Service Worker API unsupported');
        return null;
    }
 
    try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service worker registered with scope:', registration.scope);
        
        if (registration.waiting) {
            console.log('New service worker waiting to activate');
        }
        
        registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            console.log('Service Worker update found!');
            
            newWorker.addEventListener('statechange', () => {
                console.log('Service Worker state changed:', newWorker.state);
            });
        });

        if ('PushManager' in window) {
            console.log('Push API is supported');
        } else {
            console.log('Push API is not supported');
        }
        
        return registration;
    } catch (error) {
        console.error('Failed to install service worker:', error);
        return null;
    }
}

/**
 * Check if the app is online
 * @returns {boolean} True if online, false otherwise
 */
export const isOnline = () => {
    return navigator.onLine;
};

/**
 * Request notification permission
 * @returns {Promise<string>} Permission state
 */
export const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
        console.log('This browser does not support notifications');
        return 'denied';
    }
    
    try {
        const permission = await Notification.requestPermission();
        return permission;
    } catch (error) {
        console.error('Error requesting notification permission:', error);
        return 'denied';
    }
};

/**
 * Send a simulated push notification via service worker
 * @param {Object} data Notification data
 * @returns {Promise<void>}
 */
export const sendSimulatedPushNotification = async (data = {}) => {
    if (isServiceWorkerAvailable()) {
        const registration = await navigator.serviceWorker.ready;
        
        if (registration.active) {
            registration.active.postMessage({
                type: 'SIMULATE_PUSH',
                title: data.title || undefined,
                message: data.message || undefined,
                url: data.url || undefined,
                storyId: data.storyId || undefined
            });
        }
    }
};