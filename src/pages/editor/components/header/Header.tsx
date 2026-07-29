import styles from './header.module.less';
import { Popover, Button, Avatar, Toast, RadioGroup, Radio } from '@douyinfe/semi-ui';
import { observer } from 'mobx-react';
import { LinkCloudSucess } from '@icon-park/react';
import Export from './Export';
import User from './User';
import CreditRecharge from './CreditRecharge';
import VipRecharge from './VipRecharge';
import Login from '@components/login';
import { useEffect, useReducer, useState, useCallback } from 'react';
// import RecordTest from './RecordTest';
import { pubsub } from '@utils/pubsub';
// import { util } from '@utils/index';
import IconSpin from '@douyinfe/semi-icons/lib/es/icons/IconSpin';
import { helper, utils } from 'video-core-sdk';
import { config } from '@config/index';
import { util } from '@utils/index';
import axios from 'axios';
import Project from './Project';
import { language, Intl } from '@language/index';
import KeyboardModal from './KeyboardModal';
import { stores } from '@stores/index';
import { saveProject } from '@services/localStorageService';
import { reURL } from '@utils/util';

export interface IProps {}

function Header(props: IProps) {
  const { editor } = stores;
  const [, forceUpdate] = useReducer(x => x + 1, 0);
  editor.layoutKeys.header;
  const [saveLoading, setSaveLoading] = useState(false);
  const [rechargeVisible, setRechargeVisible] = useState(false);
  const [vipRechargeVisible, setVipRechargeVisible] = useState(false);

  const openCreditRecharge = useCallback(() => {
    setTimeout(() => setRechargeVisible(true), 0);
  }, []);
  const openVipRecharge = useCallback(() => {
    setTimeout(() => setVipRechargeVisible(true), 0);
  }, []);

  const saveApp = async (callback?: (res?: any) => void) => {
    console.log('保存应用', editor.data, callback);

    if (!editor.movie) return;
    if (!editor.userInfo) {
      // pubsub.publish('showLoginModal');
      Toast.error(language.val('common_toast_login_error'));
      return;
    }

    if (callback) {
      // 截取封面
      const base64 = await editor.movie.capture();
      let ires = null;
      if (base64) {
        // 缩放图片
        const resizedBase64 = (await util.resizeBase64Image(base64, 300)) as string;
        [ires] = await editor.apiServer.uploadBase64({
          content: resizedBase64,
          name: util.randomID() + '.png',
        });
      }
      editor.data.poster = ires.storage_path;
      // 更新pages列表
      editor.updatePagesListKey = util.randomID();
    }

    // 重新计算hideLock 和 zIndex 参数
    const ndata = editor.movie.sortZIndexNewData();
    // 去掉重复的resource
    editor.movie.clearUnUsedResource(ndata);

    // // 截取封面
    // const base64 = editor.movie.capture();
    // let ires = null;
    // if (base64) {
    //   [ires] = await editor.apiServer.uploadBase64({
    //     content: base64,
    //     name: utils.createID() + '.png',
    //   });
    // }
    // ndata.poster = ires ? ires.storage_path : '';
    // editor.data.poster = ndata.poster;

    // console.log('xxx', ires);
    console.log('ndata', ndata);

    let serverRes;
    // 如果保存的时候没有appid先创建
    if (!editor.appid) {
      const [res, err] = await editor.apiServer.createApp({
        source_id: '', //来源Id
        category_id: 0, //分类Id
        name: ndata.title || 'Untitled', //名称
        description: ndata.title || 'Untitled', //描述
        duration: editor.movie.getTotalTime(), //时长（毫秒）
        width: ndata.width, //宽度
        height: ndata.height, //高度
        thumb: ndata.poster, //封面图url
        data: ndata,
      });
      if (err) {
        Toast.error(err);
        return;
      }
      editor.appid = res.id;
      // 设置url
      window.history.pushState(null, null, '/editor/' + res.id);
      serverRes = res;
    } else if (editor.appid === 'template') {
      // 模版保存需要单独处理
      const templateId = util.getUrlQuery('templateId');
      const adminToken = util.getUrlQuery('adminToken');
      //@ts-ignore
      const { data: res } = await axios({
        withCredentials: true,
        method: 'post',
        url: '/api/v1/admin/templates/update',
        data: {
          id: templateId,
          data: ndata,
          thumb: ndata.poster, //封面图url
          name: ndata.title,
          width: ndata.width,
          height: ndata.height,
          duration: editor.movie.getTotalTime(),
        },
        headers: {
          'Content-Type': 'application/json;charset=utf-8',
          Accept: 'application/json',
          Authorization: adminToken,
        },
      });
      if (res.error) {
        Toast.error(res.error);
        return;
      } else {
        Toast.success(language.val('common_save_success'));
        serverRes = res;
      }
    } else {
      const ndataStr = JSON.stringify(ndata);
      if (editor.lastUpdateAppData === ndataStr) {
        console.warn('数据没有更新');
        return editor.cacheAppDetailRes;
      }
      editor.lastUpdateAppData = ndataStr;
      setSaveLoading(true);
      const [res, err] = await editor.apiServer.updateApp({
        thumb: ndata.poster, //封面图url
        id: editor.appid,
        name: ndata.title,
        data: ndata,
        width: ndata.width,
        height: ndata.height,
        duration: editor.movie.getTotalTime(),
      });
      setSaveLoading(false);
      editor.cacheAppDetailRes = res;
      if (err) {
        Toast.error(err);
        return;
      } else {
        serverRes = res;
      }
    }

    if (callback) {
      callback(serverRes);
    }

    if (editor.saveAppCallback) {
      editor.saveAppCallback(serverRes);
    }

    // 本地存储模式：同时保存到 IndexedDB
    if (editor.useLocalStorage && editor.appid) {
      try {
        await saveProject(editor.appid, ndata);
      } catch (e) {
        console.warn('本地存储保存失败:', e);
      }
    }

    return serverRes;
  };

  useEffect(() => {
    editor.saveApp = saveApp;

    pubsub.subscribe('keyboardSaveApp', (_msg, callback) => {
      saveApp(callback || (() => {}));
    });

    // 每隔30秒自动保存
    let timer = setInterval(() => {
      saveApp();
    }, 1000 * 10);

    return () => {
      clearInterval(timer);
      timer = null;
      pubsub.unsubscribe('keyboardSaveApp');
    };
  }, []);

  return (
    <>
      <div className={styles.header}>
        <section className={styles.left}>
          <KeyboardModal />
          <a style={{ pointerEvents: saveLoading ? 'none' : 'initial' }} onClick={() => saveApp(() => {})}>
            {saveLoading ? (
              <IconSpin spin style={{ color: 'var(--theme-icon)!important' }} />
            ) : (
              <LinkCloudSucess theme="outline" size="20" fill="var(--theme-icon)" />
            )}
          </a>
          <input
            id="projectName"
            placeholder={language.val('header_project_no_name')}
            className={styles.title}
            type="text"
            value={editor.data.title}
            onChange={e => {
              editor.data.title = e.target.value;
              forceUpdate();
            }}
          />
        </section>
        {/* <section className={styles.center}></section> */}
        <section className={styles.right}>
          {/* <a>
          <Protect theme="filled" size="20" fill="#2CB25A" />
        </a> */}
          {/* <Button
            className={styles.openVipButton}
            theme="solid"
            type="tertiary"
            icon={<VipOne theme="filled" size="20" fill="#FF9431" />}
          >
            开通VIP
          </Button> */}
          {editor.exConfig?.supportLanguage ? (
            <a
              className={styles.languagebtn}
              onClick={() => {
                if (language.getLanguage() === 'en-US') {
                  language.setLanguage('zh-CN');
                } else {
                  language.setLanguage('en-US');
                }
              }}
            >
              <Intl name="user_language" />
            </a>
          ) : null}
          {/* <RadioGroup
            type="button"
            buttonSize="middle"
            value={editor.editMode}
            aria-label="编辑模式切换"
            style={{ marginRight: 10 }}
            onChange={e => {
              editor.selectedElementIds = [];
              editor.editMode = e.target.value;
              editor.setContorlAndSelectedElemenent([]);
            }}
          >
            <Radio value={'auto'}>
              <Intl name="header_pro" />
            </Radio>
            <Radio value={'template'}>
              <Intl name="header_simple" />
            </Radio>
          </RadioGroup> */}
          {editor.exConfig?.showProjectButton ? <Project /> : null}
          {editor.exportButtonConfig ? (
            <span className={editor.exportButtonConfig.className} id={editor.exportButtonConfig.id}>
              {/** @ts-ignore */}
              {editor.exportButtonConfig.Component ? <editor.exportButtonConfig.Component editor={editor} /> : null}
            </span>
          ) : (
            <Export />
          )}
          {editor.loginButtonConfig ? (
            <span className={editor.loginButtonConfig.className} id={editor.loginButtonConfig.id}>
              {/** @ts-ignore */}
              {editor.loginButtonConfig.Component ? <editor.loginButtonConfig.Component editor={editor} /> : null}
            </span>
          ) : (
            <>
              {editor.userInfo ? (
                <Popover
                  content={<User onOpenCreditRecharge={openCreditRecharge} onOpenVipRecharge={openVipRecharge} />}
                  position="bottomRight"
                  trigger="click"
                >
                  <Avatar src={reURL(editor.userInfo.avatar, config.resourcesHost)} size="small" color="blue" alt="Lisa LeBlanc">
                    {editor.userInfo.name.toUpperCase().split('')[0]}
                  </Avatar>
                </Popover>
              ) : (
                <Login>
                  <Button theme="solid" className={styles.login}>
                    <Intl name="header_login" />
                  </Button>
                </Login>
              )}
            </>
          )}
        </section>
      </div>
      {/* {config.env === 'dev' && <RecordTest />} */}
      <CreditRecharge visible={rechargeVisible} onCancel={() => setRechargeVisible(false)} />
      <VipRecharge visible={vipRechargeVisible} onCancel={() => setVipRechargeVisible(false)} />
    </>
  );
}

export default observer(Header);
