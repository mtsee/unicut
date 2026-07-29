import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';

import styles from './sidebar.module.less';
import { Box, AllApplication, VipOne } from '@icon-park/react';
import { layout } from '@stores/layout';
import { Avatar } from '@douyinfe/semi-ui';
import { observer } from 'mobx-react';
import { user } from '@stores/user';
import CropUpload from './cropUpload';
import { language } from '@language/language';

const Sidebar = props => {
  let pathname = location.pathname.split('');
  const userNavList = [
    {
      name: language.val('user_set'),
      path: `/user/account`,
      icon: <Box theme="outline" size="20" fill="var(--theme-icon)" />,
    },
    {
      name: language.val('user_message'),
      path: `/user/message`,
      icon: <AllApplication theme="outline" size="20" fill="var(--theme-icon)" />,
    },
    {
      name: '我的积分',
      path: `/user/credit`,
      icon: <VipOne theme="outline" size="20" fill="var(--theme-icon)" />,
    },
    // {
    //   name: '订单记录',
    //   path: `/user/order`,
    //   icon: <VipOne theme="outline" size="20" fill="var(--theme-icon)" />,
    // },
  ];

  useEffect(() => {
    layout.cancelSelected();
  }, [pathname]);

  return (
    <div className={styles.sidebar}>
      <div className={styles.avatar}>
        <div>
          <VipOne
            className={styles.vip}
            theme="multi-color"
            size="40"
            fill={['#8b572a', '#f5a623', '#FFF', '#f39c0c']}
          />
          <CropUpload />
          {/* <Avatar size="extra-large" /> */}
        </div>
        <span className={styles.nickName}>{user.info.name}</span>
        <span className={styles.uid}>ID: {user.info.id}</span>
      </div>
      <div className={styles.workspace}>
        {/* <h3 className={styles.title}>个人中心</h3> */}
        <div className={styles.navList}>
          {userNavList.map((d, index) => {
            return (
              <NavLink activeClassName={styles.active} to={d.path} key={d.name}>
                <div className={styles.navItem}>
                  {d.icon}
                  <span className={styles.text}>{d.name}</span>
                </div>
              </NavLink>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default observer(Sidebar);
