import { routes as homeRoutes } from '@pages/home';
import { routes as aboutusRoutes } from '@pages/aboutus';
import { routes as userRouter } from './pages/user';
import { routes as workspaceRouter } from './pages/workspace';
import { routes as agreementRouter } from './pages/agreement';
import { routes as editorRouter } from './pages/editor';


// 管理页面
import NotFound from '@components/not-found';
import IndexLayout from '@layout/index-layout';
import HomeLayout from '@layout/home-layout';
import UserLayout from '@layout/user-layout';
import WorkspaceLayout from '@layout/workspace-layout';
import AgreementLayout from '@layout/agreement-layout';

const routes = [
  {
    path: '/user/agreement',
    exact: false,
    meta: { auth: false },
    component: AgreementLayout,
    routes: [agreementRouter[0]],
  },
  {
    path: '/user/privacy',
    exact: false,
    meta: { auth: false },
    component: AgreementLayout,
    routes: [agreementRouter[1]],
  },
  {
    path: '/user/vipService',
    exact: false,
    meta: { auth: false },
    component: AgreementLayout,
    routes: [agreementRouter[2]],
  },
  {
    path: '/user',
    exact: false,
    meta: { auth: true },
    component: UserLayout,
    routes: [...userRouter],
  },
  {
    path: '/workspace',
    exact: false,
    meta: { auth: true },
    component: WorkspaceLayout,
    routes: [...workspaceRouter],
  },
  {
    path: '/editor/:appId',
    exact: false,
    meta: { auth: true },
    component: IndexLayout,
    routes: [...editorRouter],
  },
  {
    path: '/article',
    exact: false,
    component: IndexLayout,
    routes: [...aboutusRoutes],
  },
  {
    path: '/',
    exact: false,
    component: HomeLayout,
    meta: { auth: false },
    routes: [...homeRoutes, { path: '*', exact: false, component: NotFound }],
  },
];

export { routes };
