import Material from './material/index';
import Draft from './draft';
import Product from './product';

const routes = [
  {
    path: '/workspace/draft',
    meta: { auth: true },
    exact: true,
    component: Draft,
  },
  {
    path: '/workspace/draft/:cid',
    meta: { auth: true },
    exact: true,
    component: Draft,
  },
  {
    path: '/workspace/material',
    meta: { auth: true },
    exact: true,
    component: Material,
  },
  {
    path: '/workspace/material/:cid',
    meta: { auth: true },
    exact: true,
    component: Material,
  },
  {
    path: '/workspace/product',
    meta: { auth: true },
    exact: true,
    component: Product,
  },
];

export { routes };
