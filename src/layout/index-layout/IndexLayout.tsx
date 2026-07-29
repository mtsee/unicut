// import styles from './index-layout.module.less';

import React, { useEffect, useReducer } from 'react';
import { renderRoutes } from 'react-router-config';
import { checkAuth } from '@utils/checkAuth';
import { userService } from '@server/index';
import PageLoading from '@components/page-loading';
import { inject, observer } from 'mobx-react';
import { Spin } from '@douyinfe/semi-ui';
import { user } from '@stores/user';
import { stores } from '@stores/index';
import FolderGuard from '@components/folder-guard/FolderGuard';
// import Footer from '@components/footer';

function IndexLayout({ route }: any) {
  const { user } = stores;
  const [, forceUpdate] = useReducer(x => x + 1, 0);
  useEffect(() => {
    if (checkAuth() && !user.info) {
      userService.getUserDetail();
      forceUpdate();
      return;
    }
  }, []);

  if (checkAuth() && !user.info) {
    return <Spin />;
  }

  if (!user.info) {
    return <div>没有访问权限</div>;
  }

  return (
    <FolderGuard>
      <PageLoading />
      {renderRoutes(route.routes)}
      {/* <Footer /> */}
    </FolderGuard>
  );
}
export default observer(IndexLayout);
