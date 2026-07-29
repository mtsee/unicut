import { useCallback, useEffect, useState } from 'react';
import styles from './editor.module.less';
import { useResizeDetector } from 'react-resize-detector';
// import { Link } from 'react-router-dom';
import $ from 'jquery';
import Canvas from './components/canvas';
import Header from './components/header';
import Options from './components/options';
import Sidebar from './components/sidebar';
import Sources from './components/sources';
// import Timeline2 from './components/timeline';
import Timeline2 from './components/timeline2';
import ColorBg from './ColorBg';
import { Left, Right } from '@icon-park/react';
import { observer } from 'mobx-react';

// Mock数据
import { Editor } from '@stores/editor';
import { pubsub } from '@utils/pubsub';
import { Toast } from '@douyinfe/semi-ui';
import { server } from './server';
import DragItem from './common/dragitem';
import type { IWatermark, MovieData, PluginConfig } from 'video-core-sdk';
import { loadFFmpeg, utils } from 'video-core-sdk';
import { config } from '@config/index';
import ReplaceTpl from './components/replace-tpl';
import { util } from '@utils/index';
import PreviewSource from './PreviewSource';
import type { APIServer, SideItem, UserInfo } from '@config/sdk.d';
import WinLoading from './common/loading';
import { tdata } from './tdata';
import AIChat from './components/ai-chat/AIChat';
import { createLocalUploadBase64 } from '@services/localStorageService';
// import { tdata } from './tdata2';
// import { tdata } from '@video/core/src/example/mock/tdata4';
// import qrcodeConfig from '@plugins/qrcode';
import { plugins } from '@plugins/index';
import axios from 'axios';
import ContextMenus from './components/canvas/ContextMenus';
import zh_CN from '@douyinfe/semi-ui/lib/es/locale/source/zh_CN';
import en_US from '@douyinfe/semi-ui/lib/es/locale/source/en_US';
import { LocaleProvider } from '@douyinfe/semi-ui';
import { language } from '@language/language';
import { stores } from '@stores/index';
// import { sides } from './Sides';

// 延迟加载ffmpeg，避免页面阻塞
setTimeout(() => {
  loadFFmpeg();
}, 1000);

interface IProps {
  match?: { params: { appid: string } };
  appid?: string;
  movieData?: MovieData;
  token?: string;
  userInfo?: UserInfo;
  workerPath?: string;
  apiServer?: APIServer;
  plugins?: PluginConfig[];
  resourcesHost?: string;
  useLocalStorage?: boolean; // 是否使用本地存储
  onLoginSuccess?: (userInfo: any) => void;
  saveAppCallback?: (res: any) => void; // 保存的回调
  // 水印配置
  watermark?: IWatermark;
  sides?: SideItem[]; // 侧边栏配置
  exConfig?: {
    // 支持多语言
    supportLanguage: boolean;
    // 显示项目按钮
    showProjectButton: boolean;
    logoLink?: string;
    // 自定义logo链接
    logoOnClick?: () => void;
    // 自定义logo
    logo: (themeType: 'light' | 'dark') => string;
  };
  loginButtonConfig?: {
    id: string; // 容器的ID
    className: string; // 容器的类名
    Component?: React.FC; // 登录组件
  };
  exportButtonConfig?: {
    id: string; // 容器的ID
    className: string; // 容器的类名
    Component?: React.FC; // 导出组件
  };
  callback?: (params: { editor: Editor }) => void;
}

// 导入插件
function EditorPage(props: IProps) {
  const { editor } = stores;

  const appid = props.appid ? props.appid : props.match?.params?.appid;

  if (props.resourcesHost !== undefined) {
    config.resourcesHost = props.resourcesHost;
  }
  if (props.workerPath !== undefined) {
    config.workerPath = props.workerPath;
  }
  if (props.exConfig) {
    Object.assign(editor.exConfig, props.exConfig);
  }
  editor.saveAppCallback = props.saveAppCallback;
  editor.watermark = props.watermark;
  if (!editor.watermark) {
    editor.watermark = {
      src: '',
      // src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAABQCAMAAABrs8qCAAAC5VBMVEVMaXEyMjLw8PD///8AAAAAAAAAAAD///////8AAAANDQ0AAAAAAAAAAAAAAACqqqrLy8v///8AAAAAAAAbGxv8/Pzm5uYAAADb29sAAACUlJSDg4MAAACYmJgAAAAnJycAAADKysoAAAD4+PgAAAAAAAAAAAAyMjIAAAAAAABnZ2cBAQH4+PgLCwsAAAAAAAD9/f0AAAAAAAAEBAQAAAAAAAD+/v4AAAAAAAAfHx8AAADx8fEAAAAPDw/5+fkAAAD8/PwzMzPa2toAAADY2NgAAAAAAAAAAAAAAAAWFhbz8/MAAACxsbH8/Py3t7cTExPo6OgAAAAAAAAICAjMzMwAAADIyMgAAAAAAAAAAADHx8cAAACsrKwAAAD4+PiAgIAAAADw8PAjIyMqKioAAADu7u5BQUFdXV0AAACampqWlpa0tLQAAAAxMTEDAwOZmZkAAADk5OSCgoIRERHe3t7k5OQAAAAzMzP+/v6MjIwAAACCgoIeHh4AAACpqanj4+NPT09paWnq6uotLS2FhYXs7Ozs7Oyrq6tzc3MAAADNzc0AAAAAAAD6+vqkpKRfX1++vr7y8vIAAACNjY2oqKiTk5NKSkp5eXkAAAAlJSUuLi6Xl5e7u7tiYmLPz88AAAAAAAD29vasrKyrq6v6+vpiYmIAAAD29va8vLwAAAC1tbXT09Px8fG7u7tKSkqZmZnd3d0YGBiOjo6Dg4Ofn5/y8vLHx8fFxcXr6+tmZmZkZGQHBwfu7u65ubng4ODo6Oh5eXnm5uaVlZWmpqZ9fX1sbGzDw8OJiYlGRkacnJxYWFgxMTHf39/W1tYAAADQ0NB2dna0tLShoaEAAAA8PDyhoaE3NzcKCgr19fUcHBzBwcEaGhqdnZ1XV1fX19fR0dGurq6wsLADAwPh4eFmZmZRUVHMzMyAgIAoKCj7+/v+/v6ysrJ0dHTn5+dvb2////+GhobKysqQkJCRkZFSUlLQ0NCHh4fPHMpUAAAA93RSTlMAR3l/QT8BgIFAQTkHJyBgZoIDPUN9cy1tPllTFFoCRTtmBXsdPBpGMw5NQHtBBAZ+ITpACQp/NgtEEXkYQXwmfkdsDWsQKRwxQnk0YX1jQnM4EkFnGWUwNyRlImEMfFMId0RFKnZITBNaWWEVRkBZMnFSQm5yLEZ/VB5TQy9gcEpOdEZUdXZgUCNoFxt8XU1jeRZWXlhKUh9FRVljTGklLnpdXn1NK3tiNWJpeGFJWm1DVlRbeGZldFBNQHdicHRRclhbU09kVUlbTEdvayhoUWBbD0dcRkB6Q2NBWUptaWBfP3BOS2hSRH6AXlB0T4NUZ1dWS2lVk2hv4QAAAAlwSFlzAAALEwAACxMBAJqcGAAADFdJREFUeNrtmnlwVEUexxPozsyPhEBmMgkvxxCSmRCcmhyT+77MTRmSAAmEHFw5JATYICkRsiCIIPd9KeASCZcgIqIcBgEPENRdb1d3VfDedVd317+339n95gy1Vbu1VfP9a7qn33v9ed2/o7ufj49XXnnllVdeeeWVV1555ZVXavnFB8hK0El1xgSlLtrP42WulWCUWuuyTEmBHpRkqk1Qbs/0wI3imc7pTOX+stKX5AhPLi5NV+ri8jOccaQ00stcK720WOxWoBmQR4G+vEPqGdsDNyo36ZQXa+IQKEL69XwnFzJVgOoDHDniQxHbxqVQXCrfPMuM8BAEyLZNfE0Lh3R3QJxJHsCmKmR9y1dU4dhkdCg1IMGEIbhQrgsGLich3n5+ZZnhjK9HFWZaQHiSCfDLM0Z50gf/tKBjAvh6pgdutKoOlcfz7UtK020YPnxl6zBB2YvaANv8/fVgPVopVc1cjcHMDqGoKRhvPznMkyqPWlE+/w6SEJ4RpPUkzeBmwFP42wcifKPS4+2zH1oF/vx0ea+BH0Cc+7NWI0ib9jwWRgzvG5SrTp7CwhDuUY9JLMadGqUDiux6FjR5BBrpJ3ZslNIszWBIpJeQUppy+ZZkNM1HAv9bkEdlF4og01D3XjKAqzbJd9IeeF+YZqu298s1Y9pIzaoRKF1tKNs4vLtoDK+ixc20V3mLxUpZ1+rQQR87EO2BlpbzwzVM6RulMFoCJ1Px+uTRnjT5aCakE0enW4LOfMMP4NM/yHcqyBYHLUbpWj+pyX60HaKKVSAZ/sgaLKji5jk6IPfvOxPMqscCsQ4gj3PcAgrClhQQ4hwujvAsqwWVEjerC0WfPMePkGo2BNnV8MXmlRA1QR1FkjjRYwION9AROUzmodqj1qc4gIzCOJKCsCUFxJikR0MRxPHv11iKeq6NHudE0tAp5ddPgc0umsTnjAwlqgHLcWojG9/F3PJQRqVlAocdCIdPMyBMSQHx0XWtG+lZ+SaxVxswVO8b76hZH1n5ccv9rlcs9y6zoPJoh9Cu0+kC6mHZYgVEu2Y+pKfqGMmBXQUyLzNzEwVhSxSEv/8QJDWdEAWf3wpx1AniBYkqPpXKg2FYdCYOyrDBikpqIgd60Byjs3Yqr1UZEnKSzka2pAK5BxGQ+5qdOfRXVo0t9H2rd4xkK0GjMAp0eoccjH9hXOkLGEw+HkGI2bEemyn9JyCyf0obDAm5JLvhgSt/2jqs8vD9WsUgnYP45aPkLbRTMa+B+T3PIHOLil6iIGyJghh1Q5SfPUj2ruDgzR/LIL95SKvRPnDbNUhA7ZTY2NiyYzBrEX2fIbPB38TXM9qWah8QtRN7qv9AbYQtySDRG0pDh6Yl02qNapDm4zt2HG8eKkhElV7M8nD703SSjLOCQx7I1Sw13qv71R3EaMgyl6lBNGyu4QkkoApJXeYWpNFkYyfnLKHVd9wrCMlIRwQPTWfqUFy0GsRANFSQWj2s2H86kug0db4aw5YHI+3V+dNF1HivkZ0kKG88N2ZIOrECbE0qkIGrLS1XB4YIMkV4i8N5aVgNd5BG7JoK5MWnnrpMQdiSBEJTRq1j0qGWmHOojT0zc1f20EHCDIIY36tJNBSoSsL/04VEXuW1CmJi+mk7tkRHJGxQiGBz6cTNm+Qk4oXc+hyimhzc72DaEEHIJG4LPxseHt7yBNPzoy37B2jp2Rbyf/jq9mT+Umk9oho+uxUAXyGl/Vl6qB7LK3On8mq0/xq/d6yj9lrRsQQ7Y2cCkyeQ6HLJ2HOfoF2pXMH1DqMGE85Jxm6ulVaIffMuMb1uPt836otBhuTSvL4Z1y+ideT28joa/57O2k7sfLGrN/mpQApuFRXdkvkHvvUQEEvqo/R6PcD8NTSKLF6GfVkQDKSJ3lxVRtxvSRRgLvdaHuUYWJBLMO8+RknyruVyZDXaJexsLI+LizOzedzABcxVpathcE3cwjnb7OJI9psVFW/KNhKzci+fohS5DojREyI6kjj87kb6RudZ7ED0ezoiIkoS+ICYmo4g+EtqGdpzD1tJvg94JUPSfzgXUHmCuNcUHV9ig11blQsWjYWqlCSwVFDP2w2HWqON9pF9mC/GvQrIfSTUcX8scp+iBAI+TDkMj2CwA4mQW7aGAnzyJHUF2sd2JwP39rQopCLJW/AR6APl3YH1HH5e8SXa1y+ifOPbKPdHxfO+8z74ZzjmWgTk5QfyKAi+2TdxrsYdCFmXVdymM+tSG7gC0ZUiwkEdnHbSXTLv9uh8csiM232OkgwQEq5MyuMOou4nlb8Sf8FkWyIJwUTFGxe8gXGOA4h2mC83I0jDgJC9BY1bkJQaaJtJ29yucAlC4mfmljQaEO7cJBwmMin8cszQHX6ORormz6x8pBYm70I2j6sUAl+EHu/uZ3cq8v0YEDFwnfTl+uSAJoDsT6RRrc8ZSBeHH7Fb5boACUSW16b/PHrc1Om8pl5+kwPU0CptD0L3lfNTRb04bvKzH4ItVe4czeOIJ0H18T6tDTBemYq82UjQKf6w75cwUb9WcDcflH6Hbd+H8amdcims8yZw6x1A1iHLPGb/5C+uQWLBwq84l+2cKOiLvh27wJwl/NUUBb3fPixq+5VPrCPq5BHZQN5lGuNJeL9sPIIYhz9wAcwl4rp7ObK+K/c2MlLh4AuR++XfO3+qwFDjsAFMLmZXuS/NB5cgKfWCh5q/Rl6oxTwj78p06HFLjKFfUOKdvSQumEUb8RuJrOO0jCfhusRtos7h7DpuqWiES1BwkZMEyU4bj/fAsQQnq9xTW6n9PpHrGsQnJXbaIYzX5jELF+m9k1l/1qBUjwVbY624Vk44BrNDtIwnqUkR59tmJXvQnqhGS3SS3xFB0pzlfUzwuutk5ZfD4e3qVa5rEKKlgDcx1OhtPxkknAWJk/c4SszwWgzjSVBodHxAcU4N4wG0l96HmlR5+HZ3RkbeeEj+7/st++UE/MHXFb9vOKvulKN31AzcdQ9inIOq/6w0/wCD5GRdgpBJ9ILKk1QdKa+J0mPovqzcpp9MuG3SW+V3+7lTcqKhXTSbLu2YpUq4IwjvHe9QE3l1Ntg4NyAB6Uw6k7dWtnWXIAS854By+7y1/MYfn5Tgr6xXaZR8wCLt7uiS/DmAZCU1SyMTRF7ZYfcgxax35AMvHLKBkxSlNkWY8yShpSayphAaAtyDpDYw4NpB4kUvVszqvbD6xvF3JtE97zuzYKF4gTF1JOAVc+UBebQNzIH87sGURj24ByHb8VfZVS7mAmvASdKor0nS2ZsImfFLdG5BMg4Bk8dpn7uyfdOntxfNjDGQJJ3J/Z9uV7Zyib3TAdF82S09IeMIdj8ivHm9SO/48ddgi/BXg8hpPJdjbyITQYmvzkHIZi5wTB7Xn5eoEVy3xjBw6Q4dkrROZSMtQg9tioXMXAH6LgFvDvIwtRKqGO+o0b6SCfVNKhBpYXX2pxH85qPKRAx/F4OCa5CABlh2epKW3RYhBL89cfnG6mcKM9fGsO7viFE6CrTsUACfrEP10VKM+O6pzza6ASHecSU9exCsrlUFIi91f7uXn8asiWi2ngL/VLcg0XHCa+IJhlOCWdXJZIQBz35VQXxsPDSkyAPyqFz98TMYx8rx9nrlxh/cgJQB/oBmgYm/Ej+YQECy7c/Xgv4qdI6YyA6lih++eAqyukDdVpq45xMH5t55Z15nuELApwf6KDNcPK885fvrmIsQL7Acls/Lgn7ORVWt9Pa0TwWOcWQdSv4HPVL69EPyjqPTIfOo/THT5B+D0fJ4vvlu+TB0Rksd3RInI7trh/TH42HVfFvRlcDXj7TPz+z5ihI0lM9p3BDRRE5qNz+unJ9Kh44kR6n4nfzsqRfk1IW/fft02pvp7XJ2xuyjWOpUJ0dHdMRCLVZnh0pkX6tLzx5PI32XYmtxCNjdvEbJ+5IVpUiAZYLigHjBGpr81VfYBLe1R8hLlUemp8qmjJKZPlmTUZVdrtW6HDucHBXHOfsoABam8gGL+WAAzEn0jLi2CjMfDISmyMvDdD0hqC9tjFUIZH9Z5s88GtuWCn9msM+GqA2KCZgdN1jtSHKmOZwcZZjyHQ6VDpal2n3CkWTKYs+6U9bTTziy6GlSa0dHk5pAIWnKoZ99xE6QmjDPzt9TolxnrA1k+pQfWOv0jg4nRz6uD5X+C9/UuHjk/6QzXnnllVdeeeWVV1555ZVXXv0f6d9OjocY8mJEnAAAAABJRU5ErkJggg==',
      width: 200,
      height: 80,
      hide: false,
      setPosition: (movieWidth: number, movieHeight: number, scale: number) => {
        return {
          x: movieWidth - 200 * scale,
          y: movieHeight - 80 * scale,
        };
      },
    };
  }
  // 配置登录成功回调
  if (props.onLoginSuccess) {
    editor.onLoginSuccess = props.onLoginSuccess;
  }
  // 配置用户信息
  if (props.token) {
    editor.token = props.token;
  } else {
    editor.token = stores.user.token;
  }
  if (props.userInfo) {
    editor.userInfo = props.userInfo;
  } else {
    editor.userInfo = stores.user.info;
  }

  editor.sides = props.sides;
  // 配置资源host
  editor.resourcesHost = config.resourcesHost;
  // 配置插件
  editor.pluginsConfig = props.plugins || plugins;
  // login按钮容器配置
  editor.loginButtonConfig = props.loginButtonConfig;
  // export按钮容器配置
  editor.exportButtonConfig = props.exportButtonConfig;
  //@ts-ignore
  editor.apiServer = props.apiServer ? props.apiServer : server;
  // SDK回调函数
  editor.callback = props.callback;
  // 本地存储模式
  editor.useLocalStorage = props.useLocalStorage || false;

  // 本地存储模式：重写 uploadBase64，所有编辑操作中生成的文件直接存本地
  if (editor.useLocalStorage) {
    editor.apiServer.uploadBase64 = (params: any) => {
      const localUpload = createLocalUploadBase64(`materials/${editor.appid}`);
      return localUpload(params);
    };
  }

  const { width = window.innerWidth, height = window.innerHeight, ref } = useResizeDetector();
  const HEADER_HEIGHT = 60;
  const SIDEBAR_WIDTH = 60;
  const [layout, setLayout] = useState({
    sourcesWidth: 310,
    optionsWidth: 300,
    timelineHeight: 350,
  });
  const minAiChatWidth = 340;
  const [show, setShow] = useState({ sources: true, options: true });
  const [showAIChat, setShowAIChat] = useState(true);
  const [aiChatWidth, setAIChatWidth] = useState(minAiChatWidth);
  const [loading, setLoading] = useState(true);

  // 拖动过程中center不要动画
  const [noAnimate, setNoAnimate] = useState(false);

  // sourcesBar 移动
  const sourcesBarDrag = useCallback((e: any) => {
    setNoAnimate(true);
    const { sourcesWidth, optionsWidth } = layout;
    // canvas最小600px
    const interval = [310, window.innerWidth - optionsWidth - 600];
    $(document)
      .on('mousemove.ievent.sourcesBar', (em: any) => {
        const ex = em.pageX - e.pageX;
        let sw = sourcesWidth + ex;
        if (sw < interval[0]) {
          sw = interval[0];
        } else if (sw > interval[1]) {
          sw = interval[1];
        }
        layout.sourcesWidth = sw;
        setLayout({ ...layout });
      })
      .on('mouseup.ievent.sourcesBar', () => {
        $(document).off('mousemove.ievent.sourcesBar');
        $(document).off('mousedown.ievent.sourcesBar');
        setNoAnimate(false);
      });
  }, []);

  // 设置区域拖动
  const optionsBarDrag = useCallback((e: any) => {
    setNoAnimate(true);
    const { sourcesWidth, optionsWidth } = layout;
    const interval = [300, window.innerWidth - sourcesWidth - 600];
    $(document)
      .on('mousemove.ievent.optionsBar', (em: any) => {
        const ex = em.pageX - e.pageX;
        let sw = optionsWidth - ex;
        if (sw < interval[0]) {
          sw = interval[0];
        } else if (sw > interval[1]) {
          sw = interval[1];
        }
        layout.optionsWidth = sw;
        setLayout({ ...layout });
      })
      .on('mouseup.ievent.optionsBar', () => {
        $(document).off('mousemove.ievent.optionsBar');
        $(document).off('mousedown.ievent.optionsBar');
        setNoAnimate(false);
      });
  }, []);

  // AI Chat区域拖动
  const aiChatBarDrag = useCallback((e: any) => {
    setNoAnimate(true);
    const interval = [minAiChatWidth, window.innerWidth - 400];
    $(document)
      .on('mousemove.ievent.aiChatBar', (em: any) => {
        const ex = em.pageX - e.pageX;
        let sw = aiChatWidth - ex;
        if (sw < interval[0]) {
          sw = interval[0];
        } else if (sw > interval[1]) {
          sw = interval[1];
        }
        setAIChatWidth(sw);
      })
      .on('mouseup.ievent.aiChatBar', () => {
        $(document).off('mousemove.ievent.aiChatBar');
        $(document).off('mousedown.ievent.aiChatBar');
        setNoAnimate(false);
      });
  }, [aiChatWidth]);

  // 时间轴拖动
  const timelineBarDrag = useCallback((e: any) => {
    setNoAnimate(true);
    const { timelineHeight } = layout;
    // canvas最小高度200
    const interval = [100, window.innerHeight - HEADER_HEIGHT - 200];
    $(document)
      .on('mousemove.ievent.optionsBar', (em: any) => {
        const ey = em.pageY - e.pageY;
        let sh = timelineHeight - ey;
        if (sh < interval[0]) {
          sh = interval[0];
        } else if (sh > interval[1]) {
          sh = interval[1];
        }
        layout.timelineHeight = sh;
        setLayout({ ...layout });
      })
      .on('mouseup.ievent.optionsBar', () => {
        $(document).off('mousemove.ievent.optionsBar');
        $(document).off('mousedown.ievent.optionsBar');
        setNoAnimate(false);
      });
  }, []);

  const showPanel = (type: 'options' | 'sources', v: boolean) => {
    setShow({ ...show, [type]: v });
  };

  useEffect(() => {
    pubsub.subscribe('showLayoutPanel', (_msg, params: { type: 'options' | 'sources'; visible: boolean }) => {
      setShow({ ...show, [params.type]: params.visible });
    });
    return () => {
      pubsub.unsubscribe('showLayoutPanel');
    };
  }, [show]);

  const initAppData = useCallback(async () => {
    if (appid) {
      editor.appid = appid;

      if (appid === 'test') {
        // https://cdn.h5ds.com/video/669770283775954944/apps/837523312766513152.json
        const jdata = (await $.get(
          'https://cdn.h5ds.com/video-mix/u/9715/apps/960593364739022848.json?t=' + +new Date(),
          // 'https://video.h5ds.com/video/u/728621315758907392/apps/857880744023654400.json?t=' + +new Date(),
        )) as string;
        editor.data = util.reJSON(jdata) as MovieData;
      } else if (appid === 'template') {
        const templateId: any = util.getUrlQuery('templateId');
        const adminToken = util.getUrlQuery('adminToken');
        // 通过templateId 获取json
        //@ts-ignore
        const { data: res } = await axios({
          withCredentials: true,
          method: 'get',
          url: `/api/v1/admin/templates/info?id=${templateId}`,
          headers: {
            'Content-Type': 'application/json;charset=utf-8',
            Accept: 'application/json',
            Authorization: adminToken,
          },
        });
        console.log('res', res);
        const jdata = (await $.get(`https://cdn.h5ds.com/${res.data.url}?t=` + +new Date())) as string;
        editor.data = util.reJSON(jdata) as MovieData;
      } else {
        if (!props.movieData) {
          const [res, err] = await editor.apiServer.getAppData(appid);
          editor.cacheAppDetailRes = res;
          if (err) {
            Toast.error(err);
          } else if (res.data) {
            editor.data = res.data as MovieData;
          }
        } else {
          editor.data = props.movieData;
        }
      }
    }
    if (!editor.data) {
      editor.data = tdata;
    }

    // 老数据兼容新数据结构
    console.log('editor.data', editor.data);

    // 清晰数据
    await util.clearData(editor.data);

    editor.lastUpdateAppData = JSON.stringify(editor.data);

    // 如果resouces的类型是image,且url 和 thumb 一样，需要重新设置thumb
    const imageResources = editor.data.resouces?.filter(r => r.type === 'image' && r.url && r.thumb === r.url);
    if (imageResources?.length) {
      console.log('imageResources', imageResources);
      for (const resource of imageResources) {
        try {
          const url = utils.reURL(resource.url, config.resourcesHost);
          const thumbBase64 = await util.resizeBase64Image(url, 120);
          const [thumbRes] = await editor.apiServer.uploadBase64({
            content: thumbBase64,
            name: `${resource.name || 'image'}_thumb.png`,
            file_type: 'image',
          });
          if (thumbRes) {
            resource.thumb = thumbRes.storage_path;
          }
        } catch (err) {
          console.warn('缩略图生成失败', resource.name, err);
        }
      }
    }

    setLoading(false);
  }, []);

  // useEffect(() => {
  //   if (loading === false && props.callback) {
  //     props.callback({ editor, user });
  //   }
  // }, [loading]);

  useEffect(() => {
    if (config.env === 'dev' && (window as any).Stats) {
      //初始化统计对象
      const stats: any = new (window as any).Stats();
      //设置统计模式
      stats.setMode(0); // 0: fps, 1: ms
      //统计信息显示在左上角
      stats.domElement.style.position = 'absolute';
      stats.domElement.style.left = '0px';
      stats.domElement.style.top = '0px';
      stats.domElement.style.zIndex = 99999;
      //将统计对象添加到对应的<div>元素中
      document.body.appendChild(stats.domElement);
      (window as any).win_stats = stats;
    }

    initAppData();

    pubsub.subscribe('timelineLoading', (_msg, v) => {
      editor.globalLoading = v;
    });
    return () => {
      editor.destroy();
      pubsub.unsubscribe('timelineLoading');
    };
  }, []);

  useEffect(() => {
    if (loading === false) {
      $('#h5dsVideoEditor').on('wheel', e => {
        if (e.ctrlKey) {
          e.preventDefault();
        }
      });
      return () => {
        $('#h5dsVideoEditor').off('wheel');
      };
    }
  }, [loading]);

  if (loading) {
    return <div>loading...</div>;
  }

  // 控制options区域显示&隐藏
  let showOption = show.options;
  if (editor.editMode === 'template') {
    showOption = false;
  }

  const locale = {
    'zh-CN': zh_CN,
    'en-US': en_US,
  }[language.getLanguage()];

  return (
    <LocaleProvider locale={locale}>
      <div
        id="h5dsVideoEditor"
        key={editor.languageUpdateKey + '_' + editor.themeUpdateKey}
        ref={ref}
        className={styles.editor}
      >
        {editor.movieCreateSuccess && <ContextMenus />}
        <div
          id="testDiv"
          style={{
            position: 'absolute',
            zIndex: 9999,
            top: 0,
            left: 0,
            transform: 'scale(0.5)',
            transformOrigin: '0 0',
          }}
        ></div>
        <div
          className={styles.sidebar}
          style={{ width: SIDEBAR_WIDTH, height: window.innerHeight - layout.timelineHeight }}
        >
          {editor.movieCreateSuccess && <Sidebar />}
        </div>
        <div
          className={styles.sources}
          style={{
            left: SIDEBAR_WIDTH,
            height: window.innerHeight - layout.timelineHeight,
            width: layout.sourcesWidth,
            transform: show.sources ? 'translateX(0px)' : `translateX(${-layout.sourcesWidth}px)`,
          }}
        >
          <a onMouseDown={sourcesBarDrag} className={styles.sourcesBar}></a>
          <a
            onClick={() => {
              showPanel('sources', !show.sources);
            }}
            className={styles.flodButton}
          >
            <Left
              style={{ transform: `rotate(${show.sources ? 0 : 180}deg)` }}
              theme="outline"
              size="24"
              fill="var(--theme-text)"
            />
          </a>
          {editor.movieCreateSuccess && <Sources />}
          {editor.movieCreateSuccess && <PreviewSource />}
        </div>
        <div
          className={styles.layoutTop}
          style={{
            height: window.innerHeight - layout.timelineHeight,
            width: width - SIDEBAR_WIDTH - (showAIChat ? aiChatWidth : 0),
          }}
        >
          <div
            className={styles.center}
            style={{
              width:
                width -
                SIDEBAR_WIDTH -
                layout.optionsWidth -
                layout.sourcesWidth -
                (showAIChat ? aiChatWidth : 0) +
                (show.sources ? 0 : layout.sourcesWidth) +
                (showOption ? 0 : layout.optionsWidth),
              left: show.sources ? layout.sourcesWidth : 0,
              transition: noAnimate ? 'none' : '0.5s',
            }}
          >
            <div className={styles.header} style={{ height: HEADER_HEIGHT }}>
              {editor.movieCreateSuccess && <Header />}
            </div>
            <div className={styles.canvas} style={{ height: `calc(100% - ${HEADER_HEIGHT}px)` }}>
              <Canvas key={editor.movieDataUpdateKey} />
            </div>
          </div>
          <div
            className={styles.options}
            style={{
              width: layout.optionsWidth,
              transform: showOption ? 'translateX(0px)' : `translateX(${layout.optionsWidth}px)`,
            }}
          >
            {editor.editMode === 'auto' ? (
              <>
                <a onMouseDown={optionsBarDrag} className={styles.optionsBar}></a>
                <a
                  onClick={() => {
                    showPanel('options', !show.options);
                  }}
                  className={styles.flodButton}
                >
                  <Right
                    style={{ transform: `rotate(${show.options ? 0 : 180}deg)` }}
                    theme="outline"
                    size="24"
                    fill="var(--theme-text)"
                  />
                </a>
              </>
            ) : null}
            {editor.movieCreateSuccess && <Options />}
          </div>
        </div>
        <div
          className={styles.aiChat}
          style={{
            width: aiChatWidth,
            transform: showAIChat ? 'translateX(0px)' : `translateX(${aiChatWidth}px)`,
          }}
        >
          <a onMouseDown={aiChatBarDrag} className={styles.aiChatBar}></a>
          <a
            onClick={() => {
              setShowAIChat(!showAIChat);
            }}
            className={styles.flodButton}
          >
            <Left
              style={{ transform: `rotate(${showAIChat ? 180 : 0}deg)` }}
              theme="outline"
              size="24"
              fill="var(--theme-text)"
            />
          </a>
          {editor.movieCreateSuccess && <AIChat />}
        </div>
        <div
          className={styles.layoutBottom}
          style={{
            width: width - (showAIChat ? aiChatWidth : 0),
            left: 0,
            height: layout.timelineHeight,
            top: window.innerHeight - layout.timelineHeight,
          }}
        >
          <div className={styles.timeline} style={{ height: '100%' }}>
            <a onMouseDown={timelineBarDrag} className={styles.timelineBar}></a>
            {editor.movieCreateSuccess && (editor.editMode === 'auto' ? <Timeline2 /> : <ReplaceTpl />)}
          </div>
        </div>
        <ColorBg style={{ bottom: 400, left: 300 }} />
        <ColorBg style={{ top: 100, right: 400 }} />
        {editor.movieCreateSuccess && <DragItem />}
        <WinLoading />
      </div>
    </LocaleProvider>
  );
}

export default observer(EditorPage);
