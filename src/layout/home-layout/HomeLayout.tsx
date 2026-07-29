// import styles from './index-layout.module.less';

import React, { useEffect } from 'react';
import { renderRoutes } from 'react-router-config';
import { checkAuth } from '@utils/checkAuth';
import { userService } from '@server/index';
import PageLoading from '@components/page-loading';
import { inject, observer } from 'mobx-react';
import { Spin } from '@douyinfe/semi-ui';
import { user } from '@stores/user';
import Sidebar from '@layout/workspace-layout/sidebar';

function HomeLayout({ route }: any) {
  useEffect(() => {
    if (user.token && !user.info) {
      userService.getUserDetail();
    }
  }, []);

  if (checkAuth() && !user.info) {
    return <Spin />;
  }

  return (
    <>
      {/* <Sidebar /> */}
      <PageLoading />
      {renderRoutes(route.routes)}
    </>
  );
}
export default observer(HomeLayout);
