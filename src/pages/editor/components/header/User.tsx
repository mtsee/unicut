import styles from './user.module.less';
import { Avatar } from '@douyinfe/semi-ui';
import { VipOne, Workbench, Power, People, Theme, International } from '@icon-park/react';
import { observer } from 'mobx-react';
import classNames from 'classnames';
import { theme, ThemeName } from '@theme';
// import { language } from '@language/language';
import { Intl, language } from '@language/index';
import { pubsub } from '@utils/pubsub';
import { useReducer } from 'react';
import { stores } from '@stores/index';
import { reURL } from '@utils/util';
import { config } from '@config/index';
import { util } from '@utils/index';

export interface IProps {
  onOpenCreditRecharge?: () => void;
  onOpenVipRecharge?: () => void;
}

function User(props: IProps) {
  const { onOpenCreditRecharge, onOpenVipRecharge } = props;
  const { editor, user } = stores;
  const info = editor.userInfo;
  // const vip_status = info.vip_status;
  editor.themeUpdateKey;
  const [, forceUpdate] = useReducer(x => x + 1, 0);
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
            <em>用户ID: </em>
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
              onOpenVipRecharge?.();
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
              onOpenCreditRecharge?.();
            }}
          >
            <span>
              <VipOne theme="filled" size="16" fill="var(--theme-icon)" />
              <span>积分充值</span>
            </span>
            <span className={styles.right}>{user.info?.credits || 0}</span>
          </li>
          <a href={editor.userInfo?.workspaceURL ? editor.userInfo.workspaceURL : '/workspace/draft'} target="_blank">
            <li>
              <span>
                <Workbench theme="filled" size="16" fill="var(--theme-icon)" />
                <span>
                  <Intl name="user_workspace" />
                </span>
              </span>
            </li>
          </a>
          <a href={editor.userInfo?.userCenterURL ? editor.userInfo.userCenterURL : '/user/account'} target="_blank">
            <li>
              <span>
                <People theme="filled" size="16" fill="var(--theme-icon)" />
                <span>
                  <Intl name="user_center" />
                </span>
              </span>
            </li>
          </a>
          {/* <li
            onClick={() => {
              if (language.getLanguage() === 'en-US') {
                language.setLanguage('zh-CN');
                editor.languageUpdateKey = 'zh-CN';
              } else {
                language.setLanguage('en-US');
                editor.languageUpdateKey = 'en-US';
              }
            }}
          >
            <span>
              <International theme="filled" size="16" fill="#333" />
              <span>
                <Intl name="user_language" />
              </span>
            </span>
            <span className={styles.right}>{language.getLanguage() === 'en-US' ? 'English' : '中文'}</span>
          </li> */}
          <li
            onClick={() => {
              if (theme.getTheme() === 'dark') {
                theme.setTheme(ThemeName.LIGHT);
              } else {
                theme.setTheme(ThemeName.DARK);
              }
              forceUpdate();
              // editor.themeUpdateKey = theme.getTheme();
              // location.reload();
            }}
          >
            <span>
              <Theme theme="filled" size="16" fill="var(--theme-icon)" />
              <span>
                <Intl name="user_theme" />
              </span>
            </span>
            <span className={styles.right}>{theme.getTheme() === 'dark' ? 'Black' : 'Light'}</span>
          </li>
          {editor.exConfig?.supportLanguage && (
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
              {/* <span className={styles.right}>{theme.getTheme() === 'dark' ? '黑色主题' : '浅色主题'}</span> */}
            </li>
          )}
          <li>
            <span
              onClick={() => {
                if (editor.userInfo?.logout) {
                  editor.userInfo.logout();
                } else {
                  if (user?.logout) {
                    user.logout();
                    return;
                  }
                  console.error('请给userInfo添加logout方法', user.logout);
                }
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
