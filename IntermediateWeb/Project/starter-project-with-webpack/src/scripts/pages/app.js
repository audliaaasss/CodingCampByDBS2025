import routes from '../routes/routes';
import { getActiveRoute, getActivePathname } from '../routes/url-parser';
import { getAccessToken, getLogout } from '../utils/auth';
import PageTransition from './transition';
import { transitionHelper } from '../utils';
import NotificationHelper from '../utils/notification-helper';

class App {
    #content = null;
    #drawerButton = null;
    #navigationDrawer = null;
    #navList = null;
    #pageTransition = null;
    #currentPath = null;
    #previousPath = null;
    #notificationSubscribed = false;
    #loadingTimeout = null;

    constructor({ navigationDrawer, drawerButton, content }) {
        this.#content = content;
        this.#drawerButton = drawerButton;
        this.#navigationDrawer = navigationDrawer;
        this.#navList = document.querySelector('#nav-list');
        this.#pageTransition = PageTransition.for(this.#content);

        this.#content.classList.add('content-container');

        this._setupDrawer();
        this._setupLogout();
        this._setupSkipToContent();
        this._updateNavigation();
        this._setupNavigationTracking();

        this._setupViewTransition();
        this._checkNotificationStatus();
        this._setupServiceWorkerCommunication();
        
        this._syncNotificationStatus();
    }
    
    async _syncNotificationStatus() {
        if (!('serviceWorker' in navigator)) return;
        
        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();
            
            const storedStatus = localStorage.getItem('pushNotificationStatus');
            
            if (!subscription && storedStatus === 'subscribed') {
                localStorage.setItem('pushNotificationStatus', 'unsubscribed');
                this.#notificationSubscribed = false;
            } 

            else if (subscription && storedStatus === 'unsubscribed') {
                await subscription.unsubscribe();
                this.#notificationSubscribed = false;
            }

            else if (subscription && !storedStatus) {
                localStorage.setItem('pushNotificationStatus', 'subscribed');
                this.#notificationSubscribed = true;
            }

            else if (!subscription && !storedStatus) {
                localStorage.setItem('pushNotificationStatus', 'unsubscribed');
                this.#notificationSubscribed = false;
            }

            else {
                this.#notificationSubscribed = storedStatus === 'subscribed';
            }
            
            this._updateServiceWorkerSubscriptionStatus();
            this._updateNavigation();
        } catch (error) {
            console.error('Error syncing notification status:', error);
            this.#notificationSubscribed = false;
            this._updateNavigation();
        }
    }
    
    _setupServiceWorkerCommunication() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.addEventListener('message', (event) => {
                if (event.data && event.data.type === 'GET_SUBSCRIPTION_STATUS') {
                    this._updateServiceWorkerSubscriptionStatus();
                }
            });
        }
    }
    
    _updateServiceWorkerSubscriptionStatus() {
        if (navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
                type: 'SUBSCRIPTION_STATUS',
                isSubscribed: this.#notificationSubscribed
            });
        }
    }

    async _checkNotificationStatus() {
        try {
            const subscription = await NotificationHelper.getSubscription();
            this.#notificationSubscribed = !!subscription;
            
            localStorage.setItem('pushNotificationStatus', 
                this.#notificationSubscribed ? 'subscribed' : 'unsubscribed');
                
            this._updateServiceWorkerSubscriptionStatus();
            this._updateNavigation();
        } catch (error) {
            console.error('Error checking notification status:', error);
            this.#notificationSubscribed = false;
            localStorage.setItem('pushNotificationStatus', 'unsubscribed');
            this._updateServiceWorkerSubscriptionStatus();
            this._updateNavigation();
        }
    }

    _setupViewTransition() {
        if (!document.querySelector('#view-transitions-style')) {
            const style = document.createElement('style');
            style.id = 'view-transitions-style';
            style.textContent = `
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                @keyframes fade-out {
                    from { opacity: 1; }
                    to { opacity: 0; }
                }
                
                ::view-transition-old(root) {
                    animation: fade-out 0.3s ease-out both;
                }
                
                ::view-transition-new(root) {
                    animation: fade-in 0.5s ease-out both;
                }
                
                .view-transition-group {
                    view-transition-name: page-transition;
                }
                
                ::view-transition-old(page-transition),
                ::view-transition-new(page-transition) {
                    animation-duration: 0.5s;
                }
            `;
            document.head.appendChild(style);
        }

        this.#content.classList.add('view-transition-group');
    }

    _setupDrawer() {
        this.#drawerButton.addEventListener('click', () => {
            this.#navigationDrawer.classList.toggle('open');
        });

        document.body.addEventListener('click', (event) => {
            if (!this.#navigationDrawer.contains(event.target) && !this.#drawerButton.contains(event.target)) {
                this.#navigationDrawer.classList.remove('open');
            }

            this.#navigationDrawer.querySelectorAll('a').forEach((link) => {
                if (link.contains(event.target)) {
                    this.#navigationDrawer.classList.remove('open');
                }
            })
        });
    }

    _setupSkipToContent() {
        window.addEventListener('hashchange', () => {
            if (window.location.hash && window.location.hash.includes('#main-content')) {
                history.pushState('', document.title, window.location.pathname + window.location.search);

                this.#content.focus();

                this._announceToScreenReader('Main content');
            }
        });
    }

    _announceToScreenReader(message) {
        let liveRegion = document.getElementById('screen-reader-announcer');
        if (!liveRegion) {
            liveRegion = document.createElement('div');
            liveRegion.id = 'screen-reader-announcer';
            liveRegion.setAttribute('aria-live', 'polite');
            liveRegion.setAttribute('aria-atomic', 'true');
            liveRegion.className = 'sr-only';
            document.body.appendChild(liveRegion);
        }

        liveRegion.textContent = message;
    }

    _setupLogout() {
        document.body.addEventListener('click', (event) => {
            if (event.target.id === 'logout-button') {
                event.preventDefault();
                getLogout();
            }
        });
    }

    _setupNavigationTracking() {
        window.addEventListener('hashchange', (event) => {
            const oldURL = new URL(event.oldURL).hash.substring(1);
            const newURL = new URL(event.newURL).hash.substring(1);
            
            this.#previousPath = oldURL;
            this.#currentPath = newURL;
        });
    }

    _showToast(message, isSuccess = true) {
        const toast = document.createElement('div');
        toast.className = isSuccess ? 'success-message animate-scale-up' : 'error-message animate-scale-up';
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    async _handleNotificationSubscription(event) {
        event.preventDefault();
        
        try {
            if (this.#notificationSubscribed) {
                try {
                    const subscription = await NotificationHelper.getSubscription();
                    if (subscription) {
                        const result = await NotificationHelper.unsubscribe();
                        
                        if (!result.error) {
                            this.#notificationSubscribed = false;
                            localStorage.setItem('pushNotificationStatus', 'unsubscribed');
                            
                            if (navigator.serviceWorker.controller) {
                                navigator.serviceWorker.controller.postMessage({
                                    type: 'UNSUBSCRIBE_PUSH',
                                    timestamp: Date.now()
                                });
                            }
                            
                            this._showToast('Unsubscribed from notifications successfully');
                        } else {
                            this._showToast(result.message || 'Failed to unsubscribe from notifications', false);
                        }
                    } else {
                        this.#notificationSubscribed = false;
                        localStorage.setItem('pushNotificationStatus', 'unsubscribed');
                        this._updateServiceWorkerSubscriptionStatus();
                        this._showToast('You are already unsubscribed from notifications');
                    }
                } catch (error) {
                    console.error('Error unsubscribing:', error);
                    this._showToast('Failed to unsubscribe from notifications', false);
                }
            } else {
                try {
                    const result = await NotificationHelper.subscribe();
                    
                    if (!result.error) {
                        this.#notificationSubscribed = true;
                        localStorage.setItem('pushNotificationStatus', 'subscribed');
                        this._updateServiceWorkerSubscriptionStatus();
                        this._showToast('Subscribed to notifications successfully');
                        
                        const registration = await navigator.serviceWorker.ready;
                        if (registration.active) {
                            registration.active.postMessage({
                                type: 'SIMULATE_PUSH',
                                title: 'Notifications Enabled!',
                                message: 'You will now receive notifications for new stories.',
                                url: '#'
                            });
                        }
                    } else {
                        this._showToast(result.message || 'Failed to subscribe to notifications', false);
                    }
                } catch (error) {
                    console.error('Error subscribing:', error);
                    this._showToast('Failed to subscribe to notifications', false);
                }
            }
        } catch (error) {
            console.error('Notification error:', error);
            this._showToast('Notification service error', false);
        } finally {
            this._updateNavigation();
        }
    }

    _updateNavigation() {
        const currentPath = getActivePathname();

        const isAuthPage = currentPath === '/login' || currentPath === '/register';
        const isNotFoundPage = currentPath === '/not-found';

        if (isAuthPage || isNotFoundPage) {
            this.#navList.innerHTML = '';
        } else if (getAccessToken()) {
            this.#navList.innerHTML = `
                <li><a href="#/">Home</a></li>
                <li><a href="#/bookmark">Bookmark</a></li>
                <li><a href="#" id="notification-button">${this.#notificationSubscribed ? 'Unsubscribe' : 'Subscribe'}</a></li>
                <li><a href="#" id="logout-button">Logout</a></li>
            `;

            const notificationButton = document.getElementById('notification-button');
            if (notificationButton) {
                notificationButton.removeEventListener('click', this._handleNotificationSubscription.bind(this));
                notificationButton.addEventListener('click', this._handleNotificationSubscription.bind(this));
            }
        }
    }

    async renderPage() {
        if (this.#loadingTimeout) {
            clearTimeout(this.#loadingTimeout);
        }
        
        this.#loadingTimeout = setTimeout(() => {
            const loadingElement = document.getElementById('stories-list-loading-container');
            if (loadingElement && loadingElement.innerHTML !== '') {
                loadingElement.innerHTML = '';
            }
        }, 10000);

        const url = getActiveRoute();
        const page = routes[url];

        if (page) {
            const transitionType = PageTransition.determineTransitionType(
                this.#previousPath,
                this.#currentPath
            );
            
            try {
                const transition = transitionHelper({
                    skipTransition: !document.startViewTransition,
                    updateDOM: async () => {
                        this.#content.innerHTML = await page.render();
                        await page.afterRender();
                        this._updateNavigation();
                        this._announceToScreenReader(`Page changed to ${this._getPageTitle(url)}`);
                    }
                });

                transition.ready.catch(error => {
                    console.log('View transitions not supported, falling back to traditional transition');
                    this.#pageTransition.transition(transitionType, async () => {
                        this.#content.innerHTML = await page.render();
                        await page.afterRender();
                        this._updateNavigation();
                        this._announceToScreenReader(`Page changed to ${this._getPageTitle(url)}`);
                    });
                });

                transition.updateCallbackDone.then(() => {
                    window.scrollTo({ top: 0, behavior: 'instant' });
                });
            } catch (error) {
                console.error('Error during page transition:', error);
                this.#content.innerHTML = await page.render();
                await page.afterRender();
                this._updateNavigation();
                this._announceToScreenReader(`Page changed to ${this._getPageTitle(url)}`);
                window.scrollTo({ top: 0, behavior: 'instant' });
            }
        } else {
            location.hash = '/not-found';
        }
    }

    _getPageTitle(url) {
        const pathMap = {
            '': 'Home',
            '/': 'Home',
            '/bookmark': 'Bookmark',
            '/login': 'Login',
            '/register': 'Register',
            '/not-found': 'Not Found',
        };

        if (pathMap[url]) {
            return pathMap[url];
        }

        if (url.includes('/stories/')) {
            return 'Story Detail';
        }

        return 'Page';
    }
}

export default App;