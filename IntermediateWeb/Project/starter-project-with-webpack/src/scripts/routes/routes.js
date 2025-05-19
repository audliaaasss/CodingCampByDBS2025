import HomePage from '../pages/home/home-page';
import BookmarkPage from '../pages/bookmark/bookmark-page';
import LoginPage from '../pages/auth/login/login-page';
import RegisterPage from '../pages/auth/register/register-page';
import DetailPage from '../pages/detail/detail-page';
import AddPage from '../pages/add-story/add-page';
import NotFoundPage from '../pages/not-found';
import { checkAuthenticatedRoute, checkUnauthenticatedRouteOnly } from '../utils/auth';

const routes = {
    '/login': checkUnauthenticatedRouteOnly(new LoginPage()),
    '/register': checkUnauthenticatedRouteOnly(new RegisterPage()),

    '/': checkAuthenticatedRoute(new HomePage()),
    '/bookmark': checkAuthenticatedRoute(new BookmarkPage()),
    '/stories/:id': checkAuthenticatedRoute(new DetailPage()),
    '/add': checkAuthenticatedRoute(new AddPage()),

    '/not-found': new NotFoundPage(),
};

export default routes;