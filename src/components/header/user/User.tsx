import styles from './user.module.less';
import { Avatar } from '@douyinfe/semi-ui';
import { VipOne, Workbench, Power, People, Theme, International } from '@icon-park/react';
import { observer } from 'mobx-react';
import { user } from '@stores/user';
import classNames from 'classnames';
import { theme, ThemeName } from '@theme';
import { layout } from '@stores/layout';
import { Link } from 'react-router-dom';
import { useReducer } from 'react';
import { language, Intl } from '@language/index';
import { reURL } from '@utils/util';
import { config } from '@config/index';
import { util } from '@utils/index';
import { pubsub } from '@utils/pubsub';

export interface IProps {}

function User(props: IProps) {
  const [, forceUpdate] = useReducer(x => x + 1, 0);
  const info = user.info;
  const isVip = Number(info.vip_level || 0) > 0 && info.vip_expire && new Date(info.vip_expire).getTime() > Date.now();
  const vipExpire = info.vip_expire ? util.formatDate(info.vip_expire, 'YYYY-MM-DD') : '未开通';
  return (
    <div className={styles.user}>
      <div className={styles.photo}>
        <Avatar src={reURL(info.avatar, config.resourcesHost)} size="medium" color="blue">
          {info.name.toUpperCase().split('')[0]}
        </Avatar>
        <span className={styles.right}>
          <h3>{info.name}</h3>
          <p>
            <em>
              <Intl name="user_userid" />:
            </em>
            {info.id}
          </p>
        </span>
      </div>
      <div className={styles.menus}>
        <ul>
          <li
            className={styles.vipMenu}
            onClick={e => {
              e.stopPropagation();
              pubsub.publish('showVipRecharge');
            }}
          >
            <span>
              <VipOne theme="filled" size="16" fill="#ff7a1a" />
              <span>{isVip ? '会员用户' : '开通会员'}</span>
            </span>
            <span className={styles.vipRight}>{isVip ? `有效期至 ${vipExpire}` : '普通用户'}</span>
          </li>
          <li
            onClick={e => {
              e.stopPropagation();
              pubsub.publish('showCreditRecharge');
            }}
          >
            <span>
              <VipOne theme="filled" size="16" fill="var(--theme-icon)" />
              <span>积分充值</span>
            </span>
            <span className={styles.right}>{user.info?.credits || 0}</span>
          </li>
          <Link to="/workspace/draft">
            <li>
              <span>
                <Workbench theme="filled" size="16" fill="var(--theme-icon)" />
                <span>
                  <Intl name="user_workspace" />
                </span>
              </span>
            </li>
          </Link>
          <Link to="/user/account">
            <li>
              <span>
                <People theme="filled" size="16" fill="var(--theme-icon)" />
                <span>
                  <Intl name="user_profile" />
                </span>
              </span>
            </li>
          </Link>
          <li
            onClick={() => {
              if (theme.getTheme() === 'dark') {
                theme.setTheme(ThemeName.LIGHT);
              } else {
                theme.setTheme(ThemeName.DARK);
              }
              layout.themeUpdateKey = theme.getTheme();
            }}
          >
            <span>
              <Theme theme="filled" size="16" fill="var(--theme-icon)" />
              <span>
                <Intl name="user_theme" />
              </span>
            </span>
            <span className={styles.right}>{layout.themeUpdateKey === 'dark' ? 'Black' : 'Light'}</span>
          </li>
          <li
            onClick={() => {
              if (language.getLanguage() === 'en-US') {
                language.setLanguage('zh-CN');
              } else {
                language.setLanguage('en-US');
              }
            }}
          >
            <span>
              <International theme="filled" size="16" fill="var(--theme-icon)" />
              <span>
                <Intl name="user_language" />
              </span>
            </span>
          </li>
          <li>
            <span
              onClick={() => {
                user.logout();
              }}
            >
              <Power theme="filled" size="16" fill="var(--theme-icon)" />
              <span>
                <Intl name="user_logout" />
              </span>
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default observer(User);
