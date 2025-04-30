import routes from '../routes/routes';
import { getActiveRoute, getActivePathname } from '../routes/url-parser';
import { getAccessToken, getLogout } from '../utils/auth';

class App {
    #content = null;
    #drawerButton = null;
    #navigationDrawer = null;
    #navList = null;

    constructor({ navigationDrawer, drawerButton, content }) {
        this.#content = content;
        this.#drawerButton = drawerButton;
        this.#navigationDrawer = navigationDrawer;
        this.#navList = document.querySelector('#nav-list');

        this._setupDrawer();
        this._setupLogout();
        this._updateNavigation();
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

    _setupLogout() {
        document.body.addEventListener('click', (event) => {
            if (event.target.id === 'logout-button') {
                event.preventDefault();
                getLogout();
            }
        });
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
                <li><a href="#" id="logout-button">Logout</a></li>
            `;
        }
    }

    async renderPage() {
        const url = getActiveRoute();
        const page = routes[url];

        if (page) {
            this.#content.innerHTML = await page.render();
            await page.afterRender();
            this._updateNavigation();
        } else {
            if (!getAccessToken()) {
                location.hash = '/login';
            } else {
                location.hash = '/';
            }
        }
    }
}

export default App;