import '../styles/styles.css';

import App from './pages/app';
import { registerServiceWorker } from './utils';
import { getAccessToken } from './utils/auth';

const checkOnlineStatus = () => {
    const offlineMessage = document.getElementById('offline-message');
    
    if (!navigator.onLine) {
        offlineMessage.classList.remove('hidden');
    } else {
        offlineMessage.classList.add('hidden');
    }
};

let deferredPrompt;

window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    
    deferredPrompt = event;
    
    console.log('App can be installed on homescreen');
});

document.addEventListener('DOMContentLoaded', async () => {
    checkOnlineStatus();
    
    window.addEventListener('online', checkOnlineStatus);
    window.addEventListener('offline', checkOnlineStatus);

    if (!getAccessToken() && location.hash === '') {
        location.hash = 'login';
    }

    const app = new App({
        content: document.querySelector('#main-content'),
        drawerButton: document.querySelector('#drawer-button'),
        navigationDrawer: document.querySelector('#navigation-drawer'),
    });
    await app.renderPage();

    await registerServiceWorker();

    window.addEventListener('hashchange', async () => {
        await app.renderPage();
    });
});