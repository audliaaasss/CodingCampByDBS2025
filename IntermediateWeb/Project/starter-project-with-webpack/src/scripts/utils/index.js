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
 
export async function registerServiceWorker() {
    if (!isServiceWorkerAvailable()) {
        console.log('Service Worker API unsupported');
        return;
    }
 
    try {
        const registration = await navigator.serviceWorker.register('/sw.bundle.js');
        console.log('Service worker installed successfully', registration);

        if ('PushManager' in window) {
            console.log('Push API is supported');
        } else {
            console.log('Push API is not supported');
        }
        
        return registration;
    } catch (error) {
        console.log('Failed to install service worker:', error);
        return null;
    }
}