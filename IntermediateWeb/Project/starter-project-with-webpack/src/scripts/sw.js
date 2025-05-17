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
                url: '#'
            },
            actions: [
                {
                    action: 'view-stories',
                    title: 'View Stories'
                }
            ],
            requireInteraction: true
        }
    };

    try {
        if (event.data) {
            const payload = event.data.text();
            console.log('Push notification payload:', payload);
            
            try {
                const jsonData = JSON.parse(payload);
                
                if (jsonData.title) notificationData.title = jsonData.title;
                if (jsonData.message) notificationData.options.body = jsonData.message;
                if (jsonData.url) notificationData.options.data.url = jsonData.url;
            } catch (jsonError) {
                console.error('Error parsing JSON:', jsonError);
                notificationData.options.body = payload;
            }
        }
    } catch (error) {
        console.error('Error parsing push notification data:', error);
    }

    console.log('Showing notification with data:', notificationData);

    event.waitUntil(
        self.registration.showNotification(
            notificationData.title, 
            notificationData.options
        )
    );
});

self.addEventListener('message', (event) => {
    console.log('Service Worker: Message received', event.data);
    
    if (event.data && event.data.type === 'SIMULATE_PUSH') {
        console.log('Service Worker: Simulating push message');
        
        const notificationData = {
            title: event.data.title || 'New Story Update',
            options: {
                body: event.data.message || 'A new story has been added to Story App!',
                icon: '/icons/icon-192x192.png',
                badge: '/icons/icon-72x72.png',
                vibrate: [100, 50, 100],
                data: {
                    dateOfArrival: Date.now(),
                    url: event.data.url || '#'
                },
                actions: [
                    {
                        action: 'view-stories',
                        title: 'View Stories'
                    }
                ],
                requireInteraction: true
            }
        };

        console.log('Showing simulated notification:', notificationData);
        
        self.registration.showNotification(
            notificationData.title, 
            notificationData.options
        );
    }
});

self.addEventListener('notificationclick', (event) => {
    console.log('Service Worker: Notification click received');

    event.notification.close();

    const urlToOpen = event.notification.data && event.notification.data.url 
        ? event.notification.data.url 
        : '#';

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