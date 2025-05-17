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
                url: '#',
                storyId: null
            },
            actions: [
                {
                    action: 'view-story',
                    title: 'View Story'
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
                if (jsonData.storyId) notificationData.options.data.storyId = jsonData.storyId;
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
                    url: event.data.url || '#',
                    storyId: event.data.storyId || null
                },
                actions: [
                    {
                        action: 'view-story',
                        title: 'View Story'
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

    const storyId = event.notification.data && event.notification.data.storyId;
    let urlToOpen = '#';
    
    if (storyId) {
        urlToOpen = `#/stories/${storyId}`;
    } else if (event.notification.data && event.notification.data.url) {
        urlToOpen = event.notification.data.url;
    }
    
    if (event.action === 'view-story') {
        if (storyId) {
            urlToOpen = `#/stories/${storyId}`;
        }
    }


    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                for (const client of clientList) {
                    if ('focus' in client) {
                        client.focus();
                        if (client.url.includes('#')) {
                            return client.navigate(urlToOpen);
                        }
                        return client;
                    }
                }

                if (clients.openWindow) {
                    return clients.openWindow(urlToOpen);
                }
            })
    );
});