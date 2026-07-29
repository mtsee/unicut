import Home from './Home';

const routes = [
  {
    path: '/',
    ssr: true,
    exact: true,
    component: Home,
  },
  {
    path: '/home',
    ssr: true,
    exact: true,
    component: Home,
  },
];

export { routes };
