import styles from './workspaceLayout.module.less';

import React, { useEffect } from 'react';
import { renderRoutes } from 'react-router-config';
import { checkAuth } from '@utils/checkAuth';
import { userService } from '@server/index';
import PageLoading from '@components/page-loading';
import { inject, observer } from 'mobx-react';
import { Spin } from '@douyinfe/semi-ui';
import { user } from '@stores/user';
import Sidebar from './sidebar';
import ColorBg from './ColorBg';
import Header from '@components/header';
import FolderGuard from '@components/folder-guard/FolderGuard';

function WorkspaceLayout({ route }: any) {
  useEffect(() => {
    if (checkAuth() && !user.info) {
      userService.getUserDetail();
    }
  }, []);

  if (checkAuth() && !user.info) {
    return <Spin />;
  }

  return (
    <FolderGuard>
      <Header />
      <PageLoading />
      <div className={styles.workspaceLayout}>
        {/* <Sidebar /> */}
        <div className={styles.content}>{renderRoutes(route.routes)}</div>
        {/* <ColorBg style={{ top: 0, left: 200 }} /> */}
      </div>
    </FolderGuard>
  );
}
export default inject('user')(observer(WorkspaceLayout));
