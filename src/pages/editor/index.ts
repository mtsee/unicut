import Editor from './EditorPage';

const routes = [
  {
    path: '/editor/:appid',
    ssr: false,
    exact: true,
    meta: {
      auth: true,
    },
    component: Editor,
  },
  {
    path: '/editor',
    ssr: false,
    exact: true,
    meta: {
      auth: true,
    },
    component: Editor,
  },
];

export { routes };
