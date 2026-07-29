import React, { useReducer, useEffect, useState } from 'react';
import styles from './header.module.less';
import { NavLink, Link, withRouter } from 'react-router-dom';
import { observer } from 'mobx-react';
import { user } from '@stores/user';
import logoImg from '@images/logo2.png';
import { Button, Popover, Avatar, Space, Toast } from '@douyinfe/semi-ui';
import Login from '@components/login';
import User from './user/User';
import { config } from '@config/index';
import { theme, ThemeName } from '@theme';
import { layout } from '@stores/layout';
import { IconDuration, IconSun } from '@douyinfe/semi-icons';
import { getInitData } from '@config/initData';
import { server } from './server';
import { pubsub } from '@utils/pubsub';
import Intl from '@language/Intl';
import { language } from '@language/language';
import { AllApplication, Box, International } from '@icon-park/react';
import classNames from 'classnames';
import { reURL } from '@utils/util';
import VipRecharge from '@pages/editor/components/header/VipRecharge';
import CreditRecharge from '@pages/editor/components/header/CreditRecharge';

export interface IProps {
  componentName?: string;
  match?: any;
  navs?: any[];
}

const Header = (props: IProps) => {
  // const [, forceUpdate] = useReducer(x => x + 1, 0);
  const [cid = '', cname = ''] = props.match.params.cid?.split('_') || [];
  const [vipRechargeVisible, setVipRechargeVisible] = useState(false);
  const [creditRechargeVisible, setCreditRechargeVisible] = useState(false);

  // 创建视频
  const createVideo = async () => {
    if (!user.info) {
      pubsub.publish('showLoginModal', true);
      return;
    }

    const initData = getInitData();
    if (cid) {
      initData.category_id = cid;
    }
    const [res, err] = await server.createVideo(initData);
    if (err) {
      Toast.error(err);
      return;
    }
    location.href = `${config.editorHost}/${res.id}`;
  };

  useEffect(() => {
    const vipSub = pubsub.subscribe('showVipRecharge', () => {
      setVipRechargeVisible(true);
    });
    const creditSub = pubsub.subscribe('showCreditRecharge', () => {
      setCreditRechargeVisible(true);
    });
    return () => {
      pubsub.unsubscribe('showVipRecharge');
      pubsub.unsubscribe('showCreditRecharge');
    };
  }, []);

  const languageType = language.getLanguage();

  return (
    <div className={styles.header}>
      <div className={styles.logoNav}>
        <Link to="/">
          <div
            className={classNames({
              [styles.logoen]: true,
            })}
          ></div>
        </Link>
        <div className={styles.nav}>
          <NavLink
            to="/"
            className={styles.text}
            activeClassName={styles.active}
            isActive={(match, location) => {
              if (location.pathname === '/') {
                return true;
              }
            }}
          >
            <Intl name="common_home" />
          </NavLink>
          {props.navs?.map((item, index) => (
            <a key={index} href={item.to} className={styles.text}>
              {item.name}
            </a>
          ))}
          {/* <NavLink to="/article/vip" className={styles.text} activeClassName={styles.active}>
            会员中心
          </NavLink> */}
          {/* <NavLink to="/tools" className={styles.text} activeClassName={styles.active}>
            <Intl name="common_tools" />
          </NavLink> */}
          <NavLink to="/article/about" className={styles.text} activeClassName={styles.active}>
            <Intl name="common_about_us" />
          </NavLink>
          <a
            href="https://github.com/mtsee/unicut"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.text}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <svg width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
            </svg>
            GitHub
          </a>
          <a
            href="https://gitee.com/676015863/unicut"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.text}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 90 90" version="1.1">
              <g xmlns="http://www.w3.org/2000/svg" id="Group">
                <circle id="Combined-Shape" fill="#C71D23" cx="44.8544363" cy="44.8544363" r="44.8544363" />
                <path
                  d="M67.558546,39.8714292 L42.0857966,39.8714292 C40.8627004,39.8720094 39.8710953,40.8633548 39.8701949,42.0864508 L39.8687448,47.623783 C39.867826,48.8471055 40.8592652,49.8390642 42.0825879,49.8393845 C42.0827874,49.8393846 42.0829869,49.8393846 42.0831864,49.8387862 L57.5909484,49.838657 C58.8142711,49.8386283 59.8059783,50.830319 59.8059885,52.0536417 C59.8059885,52.0536479 59.8059885,52.053654 59.8059701,52.0536602 L59.8059701,52.6073539 L59.8059701,52.6073539 L59.8059701,53.161115 C59.8059701,56.8310831 56.8308731,59.80618 53.160905,59.80618 L32.1165505,59.80618 C30.8934034,59.806119 29.9018373,58.8145802 29.9017425,57.5914331 L29.9011625,36.5491188 C29.9008781,32.8791508 32.8758931,29.9039718 36.5458611,29.9038706 C36.5459222,29.9038706 36.5459833,29.9038706 36.5460443,29.9040538 L67.5523638,29.9040538 C68.77515,29.9026795 69.7666266,28.9118177 69.7687593,27.6890325 L69.7721938,22.1516997 C69.774326,20.928378 68.7832423,19.9360642 67.5599198,19.9353054 C67.5594619,19.9353051 67.5590039,19.935305 67.558546,19.9366784 L36.5479677,19.9366784 C27.3730474,19.9366784 19.935305,27.3744208 19.935305,36.549341 L19.935305,67.558546 C19.935305,68.7818687 20.927004,69.7735676 22.1503267,69.7735676 L54.8224984,69.7735676 C63.079746,69.7735676 69.7735676,63.079746 69.7735676,54.8224984 L69.7735676,42.0864509 C69.7735676,40.8631282 68.7818687,39.8714292 67.558546,39.8714292 Z"
                  id="G"
                  fill="#FFFFFF"
                />
              </g>
            </svg>
            Gitee
          </a>
          {/* <a
            href={languageType === 'en-US' ? '/docs/en' : '/docs'}
            target="_blank"
            className={styles.text}
          >
            <Intl name="common_tech_docs" />
          </a> */}
        </div>
      </div>
      <Space spacing={20}>
        {/* <a
          className={styles.space}
          onClick={() => {
            if (language.getLanguage() === 'en-US') {
              language.setLanguage('zh-CN');
            } else {
              language.setLanguage('en-US');
            }
          }}
        >
          <Intl name="user_language" />
        </a> */}
        {!!user.info && (
          <>
            <Link to="/workspace/material" className={styles.space}>
              {/* <Intl name="user_workspace" /> */}
              <Box theme="outline" size="20" fill="var(--theme-icon)" />
              素材
            </Link>
            <Link to="/workspace/draft" className={styles.space + ' ' + styles.active2}>
              {/* <Intl name="user_workspace" /> */}
              <AllApplication theme="outline" size="20" fill="var(--theme-icon)" />
              项目
            </Link>
          </>
        )}
        {/* <a className={styles.createVideoBtn} onClick={createVideo}>
          <Button theme="solid" type="primary" className={styles.create}>
            <Intl name="common_create_video" />
          </Button>
        </a> */}
        {user.info ? (
          <Popover content={<User />} position="bottomRight" trigger="hover">
            <Avatar src={reURL(user.info.avatar, config.resourcesHost)} size="small" color="blue" alt="Lisa LeBlanc">
              {user.info.name.toUpperCase().split('')[0]}
            </Avatar>
          </Popover>
        ) : (
          <Login>
            <Button theme="solid" className={styles.loginBtn}>
              <Intl name="header_login" />
            </Button>
          </Login>
        )}
      </Space>
      <VipRecharge visible={vipRechargeVisible} onCancel={() => setVipRechargeVisible(false)} />
      <CreditRecharge visible={creditRechargeVisible} onCancel={() => setCreditRechargeVisible(false)} />
    </div>
  );
};

export default withRouter(observer(Header));
