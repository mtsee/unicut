import Account from './account';
import Message from './message';

const routes = [
  { path: '/user/account', meta: { auth: true }, exact: true, component: Account },
  { path: '/user/message', meta: { auth: true }, exact: true, component: Message },
];

export { routes };
