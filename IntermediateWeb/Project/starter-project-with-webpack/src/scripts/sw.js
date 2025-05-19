import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate, CacheFirst, NetworkFirst } from 'workbox-strategies';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';

precacheAndRoute(self.__WB_MANIFEST || []);

let isSubscribed = false;

registerRoute(
    ({ url }) => url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com',
    new StaleWhileRevalidate({
        cacheName: 'google-fonts-cache',
        plugins: [
            new CacheableResponsePlugin({
                statuses: [0, 200],
            }),
        ],
    }),
);

registerRoute(
    ({ url }) => url.origin === 'https://unpkg.com' && url.pathname.includes('leaflet'),
    new CacheFirst({
        cacheName: 'leaflet-cache',
        plugins: [
            new CacheableResponsePlugin({
                statuses: [0, 200],
            }),
        ],
    }),
);

registerRoute(
    ({ url }) => url.pathname.includes('stories'),
    new StaleWhileRevalidate({
        cacheName: 'stories-cache',
        plugins: [
            new CacheableResponsePlugin({
                statuses: [0, 200],
            }),
        ],
    }),
);

registerRoute(
    ({ url }) => url.pathname.includes('api'),
    new NetworkFirst({
        cacheName: 'api-cache',
        plugins: [
            new CacheableResponsePlugin({
                statuses: [0, 200],
            }),
        ],
    }),
);

registerRoute(
    ({ request }) => 
        request.destination === 'image' || 
        request.destination === 'script' || 
        request.destination === 'style',
    new StaleWhileRevalidate({
        cacheName: 'static-resources',
    }),
);

registerRoute(
    ({ request }) => request.mode === 'navigate',
    new NetworkFirst({
        cacheName: 'pages-cache',
        plugins: [
            new CacheableResponsePlugin({
                statuses: [0, 200],
            }),
        ],
    }),
);

self.addEventListener('activate', (event) => {
    event.waitUntil(
        clients.matchAll().then(clientList => {
            clientList.forEach(client => {
                client.postMessage({
                    type: 'CHECK_SUBSCRIPTION_STATUS'
                });
            });
        })
    );
});

self.addEventListener('push', (event) => {
    console.log('Service Worker: Push received');

    if (!isSubscribed) {
        console.log('User has unsubscribed, ignoring push notification');
        return;
    }

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
    
    if (event.data && event.data.type === 'UNSUBSCRIBE_PUSH') {
        console.log('Service Worker: User unsubscribed from push notifications');
        isSubscribed = false;
    } else if (event.data && event.data.type === 'SUBSCRIPTION_STATUS') {
        console.log('Service Worker: Setting subscription status', event.data.isSubscribed);
        isSubscribed = event.data.isSubscribed;
    } else if (event.data && event.data.type === 'CHECK_SUBSCRIPTION_STATUS') {
        event.source.postMessage({
            type: 'GET_SUBSCRIPTION_STATUS'
        });
    } else if (event.data && event.data.type === 'SIMULATE_PUSH') {
        console.log('Service Worker: Simulating push message');
        
        if (!isSubscribed) {
            console.log('User has unsubscribed, ignoring simulated push notification');
            return;
        }
        
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
    let urlToOpen = '/';
    
    if (storyId) {
        urlToOpen = `/#/stories/${storyId}`;
    } else if (event.notification.data && event.notification.data.url) {
        const url = event.notification.data.url;
        if (url.startsWith('#')) {
            urlToOpen = `/${url}`;
        } else {
            urlToOpen = url;
        }
    }
    
    if (event.action === 'view-story' && storyId) {
        urlToOpen = `/#/stories/${storyId}`;
    }

    console.log('Navigation URL:', urlToOpen);

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                for (const client of clientList) {
                    console.log('Found client:', client.url);

                    if ('focus' in client) {
                        try {
                            client.focus();

                            const baseUrl = new URL(client.url).origin;

                            const fullUrl = baseUrl + urlToOpen;
                            console.log('Navigation to:', fullUrl);

                            return client.navigate(fullUrl).then((newClient) => {
                                try {
                                    if (newClient) setTimeout(() => newClient.focus(), 500);
                                } catch (e) {
                                    console.log('Unable to focus window:', e);
                                }

                                return newClient;
                            });
                        } catch (e) {
                            console.log('Unable to focus window:', e);
                            return client.navigate(baseUrl + urlToOpen);
                        }
                    }
                }

                console.log('No active clients found, opening new window with URL:', urlToOpen);
                const baseUrl = self.registration.scope;
                
                try {
                    const fullUrl = new URL(urlToOpen, baseUrl).href;
                    return clients.openWindow(fullUrl).catch(err => {
                        console.error('Error opening window:', err);
                    });
                } catch (e) {
                    console.error('Error creating URL or opening window:', e);
                }
            })
    );
});