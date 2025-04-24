import { getActivePathname, getActiveRoute, getRoute } from './routes/url-parser.js';
import routes from './routes/routes.js';

export default class App {
  #content;
  #currentPath;

  constructor({ content }) {
    this.#content = content;
    this.#currentPath = getActivePathname();
  }

  async renderPage() {
    const routeName = getActiveRoute();
    const route = routes[routeName];

    // Get page instance
    const page = route();

    // Alternatif update DOM bagi browser yang tidak mendukung transition
    if (!document.startViewTransition) {
      this.#content.innerHTML = await page.render();
      await page.afterRender();

      return;
    }

    const navigationType = this.#getNavigationType();

    if (navigationType === 'list-to-detail') {
      //TODO: Implementation
      console.log('Pengguna melakukan navigasi dari daftar ke detail.');
    }

    // Update DOM dengan transition
    const transition = document.startViewTransition(async () => {
      this.#content.innerHTML = await page.render();
      page.afterRender();

      if (navigationType === 'detail-to-list') {
        //TODO: Implementation
        console.log('Pengguna melakukan navigasi dari detail ke daftar.');
      }
    });

    transition.updateCallbackDone.then(() => {
      console.log('callback function telah dieksekusi.');
    });
    transition.ready.then(() => {
      console.log('View transition siap dijalankan.');
    });
    transition.finished.then(() => {
      console.log('View transition telah selesai.');
      this.#currentPath = getActivePathname();
    });
  }

  #getNavigationType() {
    const fromRoute = getRoute(this.#currentPath);
    const toRoute = getActiveRoute();
 
    const catListPath = ['/'];
    const catDetailPath = ['/cat/:id'];
 
    if (catListPath.includes(fromRoute) && catDetailPath.includes(toRoute)) {
      return 'list-to-detail';
    }
 
    if (catDetailPath.includes(fromRoute) && catListPath.includes(toRoute)) {
      return 'detail-to-list';
    }
 
    return null;
  }
}
