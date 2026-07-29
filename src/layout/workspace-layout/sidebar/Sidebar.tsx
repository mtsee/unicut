import React, { useState, useEffect, useReducer } from 'react';
import { NavLink, Link, useHistory } from 'react-router-dom';
import styles from './sidebar.module.less';
// import avatarImg from "@images/user/avatar.png";
import {
  Box,
  AllApplication,
  Help,
  FolderSuccessOne,
  User,
  Logout,
  Agreement,
  Remind,
  Theme,
  Home,
} from '@icon-park/react';
import { layout } from '@stores/layout';
import { observer } from 'mobx-react';
import { user } from '@stores/user';
// import { language } from "@language/language";
import { Avatar, Dropdown, Popover, Space } from '@douyinfe/semi-ui';
import { language } from '@language/language';
import { theme, ThemeName } from '@theme';
import classNames from 'classnames';

const Sidebar = props => {
  const history = useHistory();
  const [, forceUpdate] = useReducer(x => x + 1, 0);

  const userNavList = [
    {
      name: '首页', // 素材
      path: `/home`,
      icon: <Home theme="outline" size="20" fill="var(--theme-icon)" />,
    },
    {
      name: language.val('project'), // 项目
      path: `/workspace/draft`,
      icon: <AllApplication theme="outline" size="20" fill="var(--theme-icon)" />,
    },
    {
      name: language.val('material'), // 素材
      path: `/workspace/material`,
      icon: <Box theme="outline" size="20" fill="var(--theme-icon)" />,
    },
    // {
    //   name: 'Ai Words', // 人工智能
    //   path: `/workspace/aiword`,
    //   icon: <AllApplication theme="outline" size="20" fill="var(--theme-icon)" />,
    // },
    // {
    //   name: "成品",
    //   path: `/workspace/product`,
    //   icon: (
    //     <FolderSuccessOne theme="outline" size="20" fill="var(--theme-icon)" />
    //   ),
    // },
    // {
    //   name: '帮助',
    //   href: `/workspace/help`,
    //   icon: <Help theme="outline" size="20" fill="var(--theme-icon)" />,
    // },
  ];

  let pathname = location.pathname.split('');

  useEffect(() => {
    layout.cancelSelected();
  }, [pathname]);

  const info = user.info;

  console.log('pathname>>>>>>>>>>>>', history);

  return (
    <div className={styles.sidebar + ' scroll'}>
      <div className={styles.navContainer}>
        <div className={styles.navList}>
          {userNavList.map((d: any, index) => {
            if (d.href) {
              return (
                <a href={d.href} key={d.name} target="_blank">
                  <Popover showArrow position="right" content={<span className={styles.popoverContent}>{d.name}</span>}>
                    <div className={styles.navItem}>
                      {d.icon}
                      {/* <span className={styles.text}>{d.name}</span> */}
                    </div>
                  </Popover>
                </a>
              );
            }
            return (
              <NavLink
                activeClassName={styles.active}
                to={d.path}
                key={d.name}
              >
                <Popover showArrow position="right" content={<span className={styles.popoverContent}>{d.name}</span>}>
                  <div className={styles.navItem}>
                    {d.icon}
                    {/* <span className={styles.text}>{d.name}</span> */}
                  </div>
                </Popover>
              </NavLink>
            );
          })}
        </div>
        {/* <Dropdown
          position="bottomLeft"
          render={
            <Dropdown.Menu style={{ width: 240 }}>
              <Dropdown.Item
                style={{ padding: '10px 20px' }}
                icon={
                  <User theme="outline" size="20" style={{ height: 20 }} fill="var(--theme-icon)" strokeWidth={3} />
                }
                onClick={() => history.push('/user/account')}
              >
                {language.val('userAccount')}
              </Dropdown.Item>
              <Dropdown.Item
                style={{ padding: '10px 20px' }}
                icon={
                  <Remind theme="outline" size="20" style={{ height: 20 }} fill="var(--theme-icon)" strokeWidth={3} />
                }
                onClick={() => history.push('/user/message')}
              >
                {language.val('messageCenter')}
              </Dropdown.Item>
              <Dropdown.Item
                style={{ padding: '10px 20px' }}
                icon={
                  <Agreement
                    theme="outline"
                    size="20"
                    style={{ height: 20 }}
                    fill="var(--theme-icon)"
                    strokeWidth={3}
                  />
                }
                onClick={() => history.push('/user/agreement')}
              >
                {language.val('agreement')}
              </Dropdown.Item>
              <Dropdown.Item
                style={{ padding: '10px 20px' }}
                icon={
                  <Logout theme="outline" size="20" style={{ height: 20 }} fill="var(--theme-icon)" strokeWidth={3} />
                }
                onClick={() => history.push('/user/logout')}
              >
                {language.val('logout')}
              </Dropdown.Item>
            </Dropdown.Menu>
          }
        >
          <div className={styles.user}>
            <div className={styles.avatar}>
              <Avatar src={info.avatar} size="small" color="blue">
                {info.name.toUpperCase().split('')[0]}
              </Avatar>
            </div>
          </div>
        </Dropdown> */}
      </div>
    </div>
  );
};

export default observer(Sidebar);
