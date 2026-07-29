import { action, observable, transaction } from 'mobx';
import { util, storage, pubsub } from '../utils';
import type * as ctypes from '@config/types';
import { helper, speedHelper, Store, utils } from 'video-core-sdk';
import type * as types from 'video-core-sdk';
import { remove } from 'lodash';
import { Toast } from '@douyinfe/semi-ui';
import type { SourceItem } from '@pages/editor/types';
import { theme, ThemeName } from '@theme';
import { language } from '@language/language';
import type { APIServer, SideItem } from '@config/sdk.d';
import { sleep } from '@utils/util';
import { config as timelineConfig } from '../pages/editor/components/timeline2/config';
import { exportMovie } from '@utils/export';
import logo1 from '@images/logo1.png';
import logo2 from '@images/logo2.png';
import $ from 'jquery';

// 素材类型
export type MaterialTypes =
  | 'text'
  | 'image'
  | 'audio'
  | 'video'
  | 'sticker'
  | 'effect'
  | 'filter'
  | 'transition'
  | 'font'
  | 'face'
  | 'role'
  | 'scene'
  | 'special'
  | 'goods'
  | string;

// 预览模块
export interface PreviewSourceParams {
  url: string;
  name: string;
  type: string; // types.ElementType | 'template'
  attrs?: any;
}

export class Editor {
  constructor() {
    $(document).on('mousedown.ievent.audioBlank', e => {
      if (!$(e.target).closest('.audioSourceItem')[0]) {
        this.audioStop();
      }
    });
  }

  scale: number = 1;

  // 开启后，拖动控制器时，会同时拖动所有帧
  frameControlSync: {
    xy: boolean;
    rotation: boolean;
    width_height: boolean;
  } = {
    xy: false,
    rotation: false,
    width_height: false,
  };
  frameControlSyncStart: Record<string, number> = {}; // 开启时，记录所有帧的初始位置

  // 选中要播放的音乐
  @observable audioSelectedId: string = '';
  @observable audioProgress: number = 0;

  public onLoginSuccess?: (userInfo: any) => void;

  private audio_duration: number = 0;

  public audio: HTMLAudioElement = null;

  // 画布是否可拖动
  @observable canvasDragEnable: boolean = false;

  clipVideo: HTMLVideoElement = null;

  // 要播放的音乐
  set audioURL(url: string) {
    if (url) {
      this.audio = document.createElement('audio');
      this.audio.src = url;
      this.audio.addEventListener('timeupdate', this.audioTimeupdateFun);
      this.audio.addEventListener('ended', this.audioEndFun);
    } else {
      this.audio?.remove();
    }
  }

  set duration(d: number) {
    this.audio_duration = d;
  }

  get duration() {
    return this.audio_duration;
  }

  @observable updatePagesListKey: string = '1';

  @action
  audioEndFun = () => {
    this.audioStop();
  };

  // 监听播放进度
  @action
  audioTimeupdateFun = () => {
    this.audioProgress = this.audio.currentTime / this.audio_duration;
  };

  // 设置进度
  @action
  setAudioProgress = (p: number) => {
    this.audioProgress = p;
    if (this.audio) {
      this.audio.currentTime = p * this.audio_duration;
    }
  };

  // 播放
  @action
  audioPlay = () => {
    this.audio?.play();
  };

  // 暂停
  @action
  audioPause = () => {
    this.audio?.pause();
  };

  @action
  audioStop = () => {
    this.audioPause();
    transaction(() => {
      this.audioProgress = 0;
      this.audioSelectedId = '';
      this.audioURL = '';
    });
  };

  ////////////////////////////////////////////////////////

  // 外部传入的配置参数
  public exConfig: Record<string, any> = {
    // 最大媒体轨道数量
    maxMediaTrackNum: 30,
    // 支持多语言
    supportLanguage: false,
    // 显示项目按钮
    showProjectButton: true,
    // 自定义logo
    logo: (themeType: 'light' | 'dark') => {
      return themeType === 'dark' ? logo1 : logo2;
    },
  };

  // 外部传入的apiServer
  public apiServer?: APIServer;

  // 是否使用本地存储模式
  public useLocalStorage: boolean = false;

  // 登录注册按钮预留的位置参数
  public loginButtonConfig?: {
    id: string; // 容器的ID
    className: string; // 容器的类名
    Component?: React.FC; // 登录组件
  };

  public exportButtonConfig?: {
    id: string; // 容器的ID
    className: string; // 容器的类名
    Component?: React.FC; // 导出组件
  };

  // 修改主题
  public setTheme = (themeName: ThemeName) => {
    theme.setTheme(themeName);
  };

  // 修改语言
  public setLanguage = (lang: 'zh-CN' | 'en-US') => {
    language.setLanguage(lang);
  };

  // 侧边栏配置
  public sides?: SideItem[] = null;

  public movie!: Store;

  public pluginsConfig: types.PluginConfig[] = null;

  public data!: types.MovieData;

  public callback?: (params: { editor: Editor }) => void;

  // 缓存复制的数据
  public copyTempData: any;

  public exportMovie = exportMovie;

  /**
   * 缓存最新一次保存的数据`JSON.stringify(movieData)`，
   * 主要用于判断数据是否发生变化，如果发生了变化要自动保存
   */
  public lastUpdateAppData: any = '';
  public cacheAppDetailRes: any = null;

  // 缓存复制的帧
  public copyTempFrameData: any;
  public copyTempFrameDataType: string = '';

  // 水印配置
  public watermark?: types.IWatermark;

  // 拖动转场的时候，显示可插入位置
  @observable transitionCanInsertTemp = [];

  // 预览资源
  @observable previewSource: PreviewSourceParams = null;

  // 强制更新TrackBodys组件
  @observable trackBodysKey: string = '1';

  // 资源切换后，缓存list数据
  public activeItems: Record<ctypes.SourceType, SourceItem[]> = {};
  // 设置缓存数据
  setActiveItems = (items: SourceItem[], type: ctypes.SourceType) => {
    this.activeItems[type] = items;

    // 测试用
    if (!(window as any).activeItems) {
      (window as any).activeItems = {};
    }
    (window as any).activeItems[type] = items;
  };

  // 从缓存数据中读取数据
  getFromActiveItems = (id: string, type: ctypes.SourceType) => {
    const items = this.activeItems[type] || [];
    return items.find(d => d.id === id);
  };

  // 编辑器模式分：模版替换模式 和 自由编辑模式
  @observable editMode: 'template' | 'auto' = 'auto';

  // option面板自定义
  @observable optionPanelCustom: 'background' | '' = '';

  // 记录APPID
  @observable appid: string = '';
  // 记录当前操作的actionId
  @observable actionId: string = '';

  // 主题更新
  @observable themeUpdateKey: 'dark' | 'light' = theme.getTheme();

  // 多语言
  @observable languageUpdateKey: 'zh-CN' | 'en-US' = language.getLanguage();

  // 历史记录测试用
  @observable recordUpdateTestKey: number = 1;

  // 自定义路径动画设置蒙层
  @observable showCustomAnimation: boolean = false;

  // movie创建成功
  @observable movieCreateSuccess: boolean = false;

  // 游标时间
  @observable currentTime: number = 0;

  // 游标缩放比例
  @observable rulerScale: number = 50;

  // 播放状态
  @observable playing: boolean = false;

  // 触发设置区域变化
  @observable updateKey: string = '1';

  // 视频数据替换的时候出发
  @observable movieDataUpdateKey: string = '1';

  // 时间轴更新
  @observable timelineUpdateKey: string = '1';
  @observable timelineUpdateElementKey: string = '1';

  @observable timelineToolsUpdateKey: string = '1';

  // totalTime更新
  @observable totalTimeKey: string = '1';

  @observable timelineTrackScrollLeft: number = 0;
  @observable timelineTrackScrollTop: number = 0;

  // 自定义动画开启
  @observable customAnimationId: string = '';
  // 触发更新
  @observable customAnimationPathUpdateKey: number = 0;

  // 帧模式
  @observable frameSelectedId: string = '';

  // 时间轴排版
  timeLineTrackMaxHeight: number = 0;
  timeLineTrackHeightTop: Record<
    string,
    {
      height: number;
      top: number;
      trackIndex: number;
      elementType: string;
    }
  > = {};

  // 重置时间轴元素的trackHeightTop
  resetTimeLineElementTrackHeightTop = () => {
    let upHeight = timelineConfig.marginTop * 3 + timelineConfig.textTrack + timelineConfig.cameraTrack;
    const groups = helper.groupByTrackIndex(this.data.elements);
    groups.forEach((track, index) => {
      const elem0Type = track[0]?.type;
      const height = timelineConfig[`${elem0Type}Track`] || 24;
      track.forEach(elem => {
        elem._elementTimeLineTrackTop = upHeight;
        elem._elementTimeLineTrackHeight = height;
      });
      this.timeLineTrackHeightTop[index] = {
        height,
        top: upHeight,
        elementType: elem0Type,
        trackIndex: index + 1,
      };
      upHeight += height + timelineConfig.marginTop;
    });
    this.timeLineTrackMaxHeight = upHeight;
  };

  // 获取默认插入轨道的trackIndex
  @action
  getAutoTrackIndex = () => {
    let trackIndex = 1;
    const element0 = this.data.elements.sort((a, b) => {
      return a.trackIndex - b.trackIndex;
    })[0];
    if (element0) {
      trackIndex = utils.inserValAB(0, element0.trackIndex);
    }
    return trackIndex;
  };

  // 资源host
  resourcesHost: string = '';

  // 更新时间轴工具栏模块
  @action
  updateTimelineTools() {
    this.timelineToolsUpdateKey = utils.createID();
  }

  // 暂时废弃了自定义动画
  @action
  setCustomAnimationId(id: string) {
    this.customAnimationId = id;
  }

  // 更新设置区域视图
  @action
  updateOption = () => {
    this.updateKey = util.randomID();
  };

  // 更新时间轴区域
  @action
  updateTimeline = () => {
    if (!this.movie) {
      return;
    }
    // this.movie.clearUnUsedResource();
    // 重新计算全部的trackIndex
    utils.updateTrackIndex(this.data);
    transaction(() => {
      this.timelineUpdateKey = util.randomID();
      this.timelineUpdateElementKey = util.randomID();
    });
  };

  // 自动判断时间轴元素是否碰撞，如果碰撞了需要重新设置trackIndex
  @action
  checkTimelineCrashAndResetTrackIndex = params => {
    const groups = helper.groupByTrackIndex(this.data.elements);
    const { element, canInTrackIndex } = params;
    const checkCrash = (elementId: string, tIndex: number) => {
      const truncateTwoDecimals = num => {
        return parseFloat(num.toFixed(3).slice(0, -1));
      };

      const elements = groups.find(arr => {
        return arr[0].trackIndex === tIndex;
      });
      if (!elements) {
        console.error('数据异常，出现了空轨道');
        return;
      }
      // console.log('elements', elements);
      const speed = speedHelper.videoAvgSpeed(element as any);
      const rect1 = {
        x: truncateTwoDecimals(element.startTime),
        y: 0,
        height: 1,
        width: truncateTwoDecimals(element.duration / speed),
      };
      for (let i = 0; i < elements.length; i++) {
        const el = elements[i];
        if (el.id !== elementId) {
          const speedEl = speedHelper.videoAvgSpeed(el as any);
          const rect2 = {
            x: truncateTwoDecimals(el.startTime || 0),
            y: 0,
            height: 1,
            width: truncateTwoDecimals(el.duration / speedEl),
          };
          if (utils.hitRect(rect1, rect2) || utils.hitRect(rect1, { x: 0, y: 0, width: 0, height: 1 })) {
            return true;
          }
        }
      }
      return false;
    };
    // 判断是否支持插入
    const crash = checkCrash(element.id, canInTrackIndex);
    if (!crash) {
      element.trackIndex = canInTrackIndex;
    } else {
      // 插入到新的trackIndex
      element.trackIndex = canInTrackIndex + 0.5;
    }
  };

  // 只更新时间轴中的元素
  @action
  updateTimelineElement = () => {
    this.timelineUpdateElementKey = util.randomID();
  };

  // 更新画布区域
  @action
  updateMovie = (t?: number) => {
    if (t === undefined) {
      t = this.currentTime;
    }
    this.currentTime = t;
    this.movie?.step(t);
  };

  // 记录用户的操作记录，redo,undo
  @action
  record = (params: types.RecordItem<types.RecordType>) => {
    // 历史记录
    params.selecteds = [...this.selectedElementIds];
    this.movie.record.add(params);
    this.recordUpdateTestKey = +new Date();
  };

  /**
   * 选中的元素
   */
  @observable selectedElementIds: string[] = [];
  @action
  setSelectedElementIds(ids: string[]) {
    if (ids.length === 1 && this.selectedElementIds.length === 1 && ids[0] === this.selectedElementIds[0]) {
      console.log('二次选中元素，不做处理', ids, [...this.selectedElementIds]);
      return;
    }

    if (ids.length) {
      pubsub.publish('showLayoutPanel', { type: 'options', visible: true });
    }

    // 帧动画
    // let frameSelectedId = '';
    // if (ids.length && ids.length === 1) {
    //   const [elem] = this.movie?.getElementDataByIds(ids);
    //   if (elem.frames && elem.frames.length > 0) {
    //     frameSelectedId = elem.frames[0].id;
    //   }
    // }

    transaction(() => {
      // this.elementOptionType = 'basic';
      this.elementOptionType = 'basic';
      this.selectedElementIds = [...ids];
      this.optionPanelCustom = '';
      // this.frameSelectedId = frameSelectedId;
      this.frameSelectedId = '';
    });
  }

  /**
   * 设置控制器
   * @param element
   */
  setContorlAndSelectedElemenent = async (ids: string[]) => {
    // if (ids.length === 1 && this.selectedElementIds.length === 1 && ids[0] === this.selectedElementIds[0]) {
    //   console.log('二次选中元素，不做处理1111', ids, [...this.selectedElementIds]);
    //   return;
    // }

    if (!this.movie) {
      return;
    }
    // updateControl 会触发Movie的 onSelectElements 事件
    this.setSelectedElementIds([...ids]);

    await util.sleep(100);
    if (this.movie) {
      this.movie.updateControl('trigger', [...ids]);
    }
  };

  /**
   * 更新布局的标识
   */
  @observable layoutKeys: Record<ctypes.LayoutName, string> = {
    sources: '1', // 资源面板
    timeline: '1', // 时间轴
    options: '1', // 设置面板
    canvas: '1', //
    header: '1',
  };
  @action
  updateComponent = (...keyName: ctypes.LayoutName[]) => {
    transaction(() => {
      for (let i = 0; i < keyName.length; i++) {
        this.layoutKeys[keyName[i]] = util.randomID();
      }
      this.updateOption();
    });
  };

  /**
   * 资源面板切换
   */
  @observable sourceType: ctypes.SourceType = 'my';
  @action
  setSourceType = (t: ctypes.SourceType) => {
    this.sourceType = t;
    pubsub.publish('showLayoutPanel', { type: 'sources', visible: true });
  };

  /**
   * 设置面板切换
   */
  @observable elementOptionType: ctypes.ElementOptionType = 'basic';
  @action
  setElementOptionType = (t: ctypes.ElementOptionType) => {
    this.elementOptionType = t;
  };

  /**
   * 获取单个选中的元素数据
   * @returns
   */
  @action
  getElementData = (): types.BaseElement | types.CaptionElement => {
    const elements = this.movie.getElementDataByIds([...this.selectedElementIds]) || [];
    return elements[0];
  };

  /**
   * 获取同轨道的元素
   */
  @action
  getSameTrackElementData = (id): types.BaseElement[] => {
    if (this.data.captions.find(d => d.id === id)) {
      return this.data.captions;
    }
    const [elem] = this.movie.getElementDataByIds([id]);
    return this.data.elements.filter(d => d.trackIndex === elem.trackIndex).sort((a, b) => a.startTime - b.startTime);
  };

  /**
   * 获取同轨道中和id相邻的2个元素
   */
  @action
  getAdjacentElementData = (id): [types.BaseElement | null, types.BaseElement | null] => {
    const res: [types.BaseElement | null, types.BaseElement | null] = [null, null];
    this.data.captions.forEach((el, i) => {
      if (el.id === id) {
        res[0] = this.data.captions[i - 1] || null;
        res[1] = this.data.captions[i + 1] || null;
      }
    });
    if (res[0] || res[1]) {
      return res;
    }
    const [elem] = this.movie.getElementDataByIds([id]);
    const elems = this.data.elements
      .filter(d => d.trackIndex === elem.trackIndex)
      .sort((a, b) => a.startTime - b.startTime);
    elems.forEach((el, i) => {
      if (el.id === id) {
        res[0] = elems[i - 1] || null;
        res[1] = elems[i + 1] || null;
      }
    });
    return res;
  };

  /**
   * 获取选中的组的元素数据
   * @returns
   */
  @action
  getGroupElementData = (): types.BaseElement[] => {
    const elements = this.movie.getElementDataByIds([...this.selectedElementIds]) || [];
    return elements.filter(d => d);
  };

  // 合并字幕
  @action
  mergeCaption = (id: string) => {
    // 和下一个元素进行合并
    const texts = this.data.captions;
    const index = texts.findIndex(d => d.id === id);
    if (index !== texts.length - 1) {
      const _self = texts[index];
      const next = texts[index + 1];
      // 移除多余的元素
      let item = null;
      remove(texts, d => {
        const willRemove = d.id === next.id;
        if (willRemove) {
          item = d;
        }
        return willRemove;
      }) as any;
      _self.text += item.text;
      _self.duration += item.duration + (item.startTime - _self.duration - _self.startTime);
      _self._dirty = utils.createID();
      this.currentTime = _self.startTime;
      this.record({
        type: 'update',
        desc: '合并字幕',
      });
      this.updateMovie();
      this.updateTimeline();
      this.setContorlAndSelectedElemenent([_self.id]);
    } else {
      Toast.warning('只能和下一个元素进行合并');
    }
  };

  // 尽量将元素放到一个轨道，如果有冲突，也可以放多轨道
  @action
  optimizeTrack = (elements: types.BaseElement[]) => {
    if (!elements.length) return;

    // 按 startTime 升序排列
    const sorted = [...elements].sort((a, b) => a.startTime - b.startTime);

    // 收集现有的 trackIndex 并排序，作为可用轨道编号
    const trackIndices = [...new Set(elements.map(e => e.trackIndex))].sort((a, b) => a - b);

    // trackEndTimes: trackIndex -> 该轨道最后一个元素的结束时间
    const trackEndTimes = new Map<number, number>();

    for (const elem of sorted) {
      const speed = (elem as any).speed ?? 1;
      const actualDuration = elem.duration / speed;
      const endTime = elem.startTime + actualDuration;

      let placed = false;

      // 在现有轨道中找第一条不重叠的轨道
      for (const trackIdx of trackIndices) {
        const lastEnd = trackEndTimes.get(trackIdx) ?? 0;
        if (elem.startTime >= lastEnd) {
          elem.trackIndex = trackIdx;
          trackEndTimes.set(trackIdx, endTime);
          placed = true;
          break;
        }
      }

      // 没有可用轨道，新建一条
      if (!placed) {
        const newTrackIndex = trackIndices.length > 0 ? Math.max(...trackIndices) + 1 : 1;
        elem.trackIndex = newTrackIndex;
        trackEndTimes.set(newTrackIndex, endTime);
        trackIndices.push(newTrackIndex);
      }
    }
  };

  // 删除字幕
  @action
  deleteCaption = (id: string) => {
    remove(this.data.captions, d => d.id === id);
    const last = utils.lastItem(this.data.captions);
    if (last) {
      this.currentTime = last.startTime;
    }
    this.updateMovie();
    this.updateTimeline();
    this.setContorlAndSelectedElemenent(last ? [last.id] : []);
  };

  // ai插入字幕
  @action
  addCaptions = async (
    sentences: {
      BeginTime: number;
      EndTime: number;
      Text: '你好，世界哈哈哈。';
    }[],
  ) => {
    this.data.captions = [];
    // 每隔20个字幕做一次缓存
    let i = 0;
    for (let d of sentences) {
      const id = utils.createID();
      const len = this.data.captions.length;
      const last = this.data.captions[len - 1];
      const caption = (await this.movie.addElementNoSource(
        {
          text: d.Text,
        },
        {
          time: d.BeginTime / 1000,
          elementType: 'caption',
          duration: util.timeToNum((d.EndTime - d.BeginTime) / 1000),
          onlyGetJSON: true,
        },
      )) as types.CaptionElement;

      caption.id = id;
      caption.style.alpha = 1;
      caption.style.x = last ? last.style.x : this.data.width / 2;
      caption.style.y = last ? last.style.y : this.data.height - 60;
      caption.textStyle.fontFamily = 'siYuanHeiTi';
      caption.textScale = 0.2;
      this.data.captions.push(caption);
      i++;
      if (i % 20 === 0) {
        await sleep(1000);
        this.updateMovie();
        this.updateTimeline();
      }
      // if (i > 30) {
      //   break;
      // }
    }
    this.record({
      type: 'add',
      desc: '添加字幕',
    });
    this.updateMovie();
    this.updateTimeline();
  };

  // 判断元素是否和同轨道的其他元素重叠了，非字幕轨道
  checkTrackElementOverlap = (trackIndex: number) => {
    const trackElements = this.data.elements.filter(d => d.trackIndex === trackIndex);

    const checkBoxOverlap = (box1, box2) => {
      const box1Right = box1.x + box1.width;
      const box2Right = box2.x + box2.width;
      const noOverlap = box1Right < box2.x || box2Right < box1.x;
      return !noOverlap;
    };

    for (let i = 1; i < trackElements.length; i++) {
      const elemPrev = trackElements[i - 1];
      const elem = trackElements[i];

      const speedPrev = speedHelper.videoAvgSpeed(elemPrev as any) || 1;
      const speed = speedHelper.videoAvgSpeed(elem as any) || 1;
      const box1 = {
        width: elemPrev.duration / speedPrev,
        x: elemPrev.startTime,
      };
      const box2 = {
        width: elem.duration / speed,
        x: elem.startTime,
      };
      if (checkBoxOverlap(box1, box2)) {
        return elemPrev;
      }
    }
    return false;
  };

  // 添加字幕，在index之后插入
  @action
  addCaption = async (text: string, index?: number) => {
    const id = utils.createID();
    const len = this.data.captions.length;
    const last = this.data.captions[len - 1];
    const startTime = last ? last.startTime + last.duration + 0.01 : 0;
    const caption = (await this.movie.addElementNoSource(
      {
        text: text,
      },
      {
        time: startTime,
        elementType: 'caption',
        duration: util.timeToNum(3),
        onlyGetJSON: true,
      },
    )) as types.CaptionElement;

    caption.id = id;
    caption.style.alpha = 1;
    caption.style.x = last ? last.style.x : this.data.width / 2;
    caption.style.y = last ? last.style.y : this.data.height - 60;
    caption.textStyle.fontFamily = 'siYuanHeiTi';
    caption.textScale = 0.3;

    // 复用原来的字幕样式
    if (this.data.captions[0]) {
      const { textStyle, textScale } = this.data.captions[0];
      caption.textStyle = utils.toJS(textStyle);
      caption.textScale = textScale;
    }

    const texts = this.data.captions;
    if (index === undefined) {
      texts.push(caption);
    } else {
      // 判断是否支持插入
      const _self = texts[index];
      const next = texts[index + 1];
      if (!next) {
        texts.splice(index, 0, caption);
      } else {
        // 如果有，小于1s不可以插入
        if (next.startTime - (_self.startTime + _self.duration) < 1) {
          Toast.error('插入时间必须大于1秒');
          return;
        } else {
          caption.duration = Math.min(1, next.startTime - (_self.startTime + _self.duration));
          caption.startTime = _self.startTime + _self.duration + 0.01;
          console.log('插入', caption);
          texts.splice(index, 0, caption);
        }
      }
    }

    // 重新排序
    this.data.captions.sort((a, b) => {
      return a.startTime - b.startTime;
    });
    this.currentTime = startTime;
    this.record({
      type: 'add',
      desc: '添加字幕',
    });
    this.updateMovie();
    this.updateTimeline();
    this.setContorlAndSelectedElemenent([id]);
  };

  // 播放
  @action
  play = async () => {
    pubsub.publish('stopTTSPlay');
    await this.movie.play();
    this.playing = true;
  };

  /**
   * 暂停播放
   */
  @action
  pause = (time?: number) => {
    this.movie.pause();
    this.playing = false;
    if (time !== undefined) {
      setTimeout(() => {
        const t = Math.min(time, this.movie.getTotalTime());
        this.currentTime = util.timeToNum(t);
      }, 10);
    } else {
      setTimeout(() => {
        this.currentTime = util.timeToNum(this.currentTime);
      }, 10);
    }
  };

  @action
  destroy = () => {
    // 取消pubsub订阅（如果有相关方法）
    try {
      // 这里可以根据实际使用的pubsub库添加取消订阅的代码
      pubsub.clearAllSubscriptions();
    } catch (e) {
      console.error('取消pubsub订阅失败:', e);
    }

    // 清理上下文菜单实例
    if (this.contextMenuInstance) {
      this.contextMenuInstance.hideAll();
      this.contextMenuInstance = null;
    }

    // 清理所有observable属性
    transaction(() => {
      this.data = null;
      this.movie = null;
      this.copyTempData = null;
      this.copyTempFrameData = null;
      this.activeItems = {};
      this.watermark = null;
      this.previewSource = null;
      this.selectedElementIds = [];
      this.userInfo = null;
      this.aiLoopStatus = {};
      this.transitionCanInsertTemp = [];
    });

    // 清理非observable属性
    this.apiServer = undefined;
    this.loginButtonConfig = undefined;
    this.exportButtonConfig = undefined;
    this.pluginsConfig = null;
    this.lastUpdateAppData = '';
    this.cacheAppDetailRes = null;
    this.timeLineTrackHeightTop = {};
    this.saveApp = null;
    this.token = '';
    this.saveAppCallback = null;
    this.resourcesHost = '';

    // 重置状态标志
    this.movieCreateSuccess = false;
    this.globalLoading = false;
    console.log('Editor实例已完全销毁');
  };

  // 保存APP方法
  public saveApp: any;

  public token: string = '';

  // 不是用户信息，是用户相关的配置信息
  @observable userInfo: Record<string, any> = null;

  @observable globalLoading: boolean = false;

  // 鼠标右键
  public contextMenuInstance: {
    show: (params: any) => void;
    hideAll: () => void;
  };
  // 鼠标右键的状态，选中组或者单元素
  // @observable contextMenuType: 'single' | 'group' = 'single';

  // 保存的回调
  public saveAppCallback: (res: any) => void = null;

  // ai视频轮训状态
  @observable aiLoopStatus: Record<string, any> = {};
}

// const editor = new Editor();
