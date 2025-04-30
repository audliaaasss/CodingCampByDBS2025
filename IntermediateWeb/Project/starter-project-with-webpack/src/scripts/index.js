// CSS imports
import '../styles/styles.css';

import App from './pages/app';
import { getAccessToken } from './utils/auth';

document.addEventListener('DOMContentLoaded', async () => {
    if (!getAccessToken() && location.hash === '') {
        location.hash = 'login';
    }

    const app = new App({
        content: document.querySelector('#main-content'),
        drawerButton: document.querySelector('#drawer-button'),
        navigationDrawer: document.querySelector('#navigation-drawer'),
    });
    await app.renderPage();

    window.addEventListener('hashchange', async () => {
        await app.renderPage();
    });
});
