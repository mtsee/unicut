import Agree from './agree';
import Privacy from './privacy';
import VipService from './vipService';

const routes = [
  { path: '/user/agreement', meta: { auth: false }, exact: true, component: Agree },
  { path: '/user/privacy', meta: { auth: false }, exact: true, component: Privacy },
  { path: '/user/vipService', meta: { auth: false }, exact: true, component: VipService },
];

export { routes };
