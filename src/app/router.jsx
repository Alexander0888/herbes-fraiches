import { createHashRouter } from 'react-router';
import App from '../App.jsx';
import HomePage from '../pages/HomePage.jsx';
import HerbsPage from '../features/herbs/HerbsPage.jsx';
import { NotFoundPage, RouteErrorPage } from '../pages/NotFoundPage.jsx';

// Hash paths work on static hosting without server rewrite rules.
export const router = createHashRouter([
  {
    path: '/',
    Component: App,
    ErrorBoundary: RouteErrorPage,
    children: [
      { index: true, Component: HomePage },
      { path: 'herbs', Component: HerbsPage },
      { path: '*', Component: NotFoundPage },
    ],
  },
]);
