import HomePage from '../pages/home/home-page';
import AboutPage from '../pages/about/about-page';
import LoginPage from '../pages/auth/login/login-page';
import RegisterPage from '../pages/auth/register/register-page';
import DetailPage from '../pages/detail/detail-page';
import { checkAuthenticatedRoute, checkUnauthenticatedRouteOnly } from '../utils/auth';

const routes = {
    '/login': checkUnauthenticatedRouteOnly(new LoginPage()),
    '/register': checkUnauthenticatedRouteOnly(new RegisterPage()),

    '/': checkAuthenticatedRoute(new HomePage()),
    '/about': checkAuthenticatedRoute(new AboutPage()),
    '/stories/:id': checkAuthenticatedRoute(new DetailPage()),
};

export default routes;