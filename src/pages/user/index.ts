import Account from './account';
import Message from './message';
import Credit from './credit';

const routes = [
  { path: '/user/account', meta: { auth: true }, exact: true, component: Account },
  { path: '/user/credit', meta: { auth: true }, exact: true, component: Credit },
  { path: '/user/message', meta: { auth: true }, exact: true, component: Message },
];

export { routes };
