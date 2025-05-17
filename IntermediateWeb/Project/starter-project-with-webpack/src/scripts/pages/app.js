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
    }

    async _checkNotificationStatus() {
        const subscription = await NotificationHelper.getSubscription();
        this.#notificationSubscribed = !!subscription;
        this._updateNavigation();
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
        
        if (this.#notificationSubscribed) {
            const result = await NotificationHelper.unsubscribe();
            
            if (!result.error) {
                this.#notificationSubscribed = false;
                this._showToast('Unsubscribed from notifications successfully');
            } else {
                this._showToast(result.message, false);
            }
        } else {
            const result = await NotificationHelper.subscribe();
            
            if (!result.error) {
                this.#notificationSubscribed = true;
                this._showToast('Subscribed to notifications successfully');
                
                try {
                    const StoryAPI = await import('../data/api');
                    
                    const subscriptionJSON = result.subscription.toJSON();
                    
                    await StoryAPI.subscribePushNotification({
                        endpoint: subscriptionJSON.endpoint,
                        keys: {
                            p256dh: subscriptionJSON.keys.p256dh,
                            auth: subscriptionJSON.keys.auth
                        }
                    });
                    
                    if (response.ok) {
                        console.log('Subscription sent to server successfully');
                        
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
                        console.error('Server error when saving subscription:', response);
                        this._showToast('Subscription saved locally but server sync failed', false);
                    }
                } catch (error) {
                    console.error('Failed to send subscription to server:', error);
                    this._showToast('Subscription saved locally but server sync failed', false);
                }
            } else {
                this._showToast(result.message, false);
            }
        }
        
        this._updateNavigation();
    }

    _updateNavigation() {
        const currentPath = getActivePathname();

        const isAuthPage = currentPath === '/login' || currentPath === '/register';

        if (isAuthPage) {
            this.#navList.innerHTML = '';
        } else if (getAccessToken()) {
            this.#navList.innerHTML = `
                <li><a href="#/">Home</a></li>
                <li><a href="#/about">About</a></li>
                <li><a href="#" id="notification-button">${this.#notificationSubscribed ? 'Unsubscribe' : 'Subscribe'}</a></li>
                <li><a href="#" id="logout-button">Logout</a></li>
            `;

            const notificationButton = document.getElementById('notification-button');
            if (notificationButton) {
                notificationButton.addEventListener('click', this._handleNotificationSubscription.bind(this));
            }
        }
    }

    async renderPage() {
        const url = getActiveRoute();
        const page = routes[url];

        if (page) {
            const transitionType = PageTransition.determineTransitionType(
                this.#previousPath,
                this.#currentPath
            );
            
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
        } else {
            if (!getAccessToken()) {
                location.hash = '/login';
            } else {
                location.hash = '/';
            }
        }
    }

    _getPageTitle(url) {
        const pathMap = {
            '': 'Home',
            '/': 'Home',
            '/about': 'About',
            '/login': 'Login',
            '/register': 'Register',
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