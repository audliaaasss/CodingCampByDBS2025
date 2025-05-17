const CACHE_NAME = 'story-app-cache-v1';

self.addEventListener('install', (event) => {
    console.log('Service Worker: Installing...');
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activating...');
    event.waitUntil(clients.claim());
});

self.addEventListener('push', (event) => {
    console.log('Service Worker: Push received');

    let notificationData = {
        title: 'New Story Update',
        options: {
            body: 'A new story has been added!',
            icon: '/icons/icon-192x192.png',
            badge: '/icons/icon-72x72.png',
            vibrate: [100, 50, 100],
            data: {
                dateOfArrival: Date.now(),
                url: '/#/'
            },
        }
    };

    try {
        if (event.data) {
            const payload = event.data.json();
            notificationData.title = payload.title || notificationData.title;
            notificationData.options.body = payload.message || notificationData.options.body;
            
            if (payload.url) {
                notificationData.options.data.url = payload.url;
            }
        }
    } catch (error) {
        console.error('Error parsing push notification data:', error);
    }

    event.waitUntil(
        self.registration.showNotification(
            notificationData.title, 
            notificationData.options
        )
    );
});

self.addEventListener('notificationclick', (event) => {
    console.log('Service Worker: Notification click received');

    event.notification.close();

    const urlToOpen = event.notification.data && event.notification.data.url 
        ? event.notification.data.url 
        : '/#/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                for (const client of clientList) {
                    if (client.url === urlToOpen && 'focus' in client) {
                        return client.focus();
                    }
                }

                if (clients.openWindow) {
                    return clients.openWindow(urlToOpen);
                }
            })
    );
});