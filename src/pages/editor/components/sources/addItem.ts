import { helper, speedHelper, utils, ResourceItem } from 'video-core-sdk';
import { Toast } from '@douyinfe/semi-ui';
// import type { EChartElement, Model3DElement } from 'video-core-sdk';
import { util } from '@utils/index';
import { language } from '@language/language';
// import { config } from '@config/index';
import { stores } from '@stores/index';
import { hydrateResourcePaths } from '@services/localStorageService';

// 添加元素 图片，视频，音频
export const addImageVideoAudioItem = async (
  item: any,
  insertTime?: number,
  trackIndex?: number,
  unSelect?: boolean,
) => {
  const { editor } = stores;

  if (editor.editMode === 'template') {
    Toast.error(language.val('source_transition_add_template_error'));
    return;
  }

  console.log('添加元素image or video --->', item, insertTime, trackIndex);
  const hasAudio = await util.checkVideoUrlHasAudio(editor.movie.reURL(item.urls.url), item.type);
  // 通过 _localPath 判断资源是否来自本地存储，而非 editor.useLocalStorage（后者仅表示浏览器是否支持本地API）
  const isLocal = !!item._localPath;
  // console.log('hasAudio', hasAudio);

  let resource: ResourceItem | any = new ResourceItem({
    id: utils.createID(),
    originId: item.id,
    url: isLocal ? item._localPath : item.urls.url,
    name: item.name,
    fileType: item.type,
    type: item.type as any,
    isLocal: isLocal ? true : false,
    noAudioTracks: !hasAudio,
    mustFetch: item.type === 'image' ? true : false,
    thumb: isLocal ? item._thumbPath || '' : item.urls.thumb,
    frames: isLocal ? item.attrs.frames || '' : item.attrs.frames,
    wave: isLocal ? item.attrs.wave || '' : item.attrs.wave,
    styleSize: {
      width: Number(item.attrs.videoWidth || item.attrs.naturalWidth || item.attrs.width),
      height: Number(item.attrs.videoHeight || item.attrs.naturalHeight || item.attrs.height),
    },
    duration: Number(item.attrs.duration),
    from: item.from,
    attrs: { ...item.attrs },
  });

  // gif、apng
  if (item.attrs.totalFrame) {
    resource.duration = item.attrs.totalFrame ? item.attrs.totalFrame * item.attrs.delayFrame : 5;
  }

  // 素材duration保留一位小数
  resource.duration = util.timeToNum(resource.duration);
  // 本地存储模式：将资源中的相对路径解析为 blob URL
  if (isLocal && editor.movie?.resourceManage) {
    await hydrateResourcePaths([resource as any], editor.movie.resourceManage);
  }
  const elementData = await editor.movie.addElementByResource(resource as any, {
    time: util.timeToNum(insertTime === undefined ? editor.currentTime : insertTime),
    trackIndex,
    elementType: item.type as any,
    duration: resource.duration || 10,
    speed: item.speed || 1,
  });
  // console.log('addItem elementData', elementData);
  if (item.urls.url.split('.').pop() === 'gif') {
    (elementData as any).isGif = true;
  }
  if (item.urls.url.split('.').pop() === 'png' && !!resource.attrs?.delayFrame) {
    (elementData as any).isApng = true;
  }
  console.log('resource---noAudioTracks', resource.noAudioTracks);
  editor.record({
    type: 'elements_create',
    desc: '添加元素' + elementData.id,
    data: [elementData],
  });

  editor.updateMovie();
  editor.updateTimeline();
  // 选中元素
  if (elementData && !unSelect) {
    if (elementData.type === 'audio') {
      editor.setSelectedElementIds([elementData.id]);
    } else {
      editor.setContorlAndSelectedElemenent([elementData.id]);
    }
  }
  return elementData;
};

/**
 * lottie动画
 * @param item
 * @param insertTime
 * @param trackIndex
 */
export const addLottieItem = async (item: any, insertTime?: number, trackIndex?: number) => {
  console.log('添加元素', item);
  const { editor } = stores;
  const resource = new ResourceItem({
    id: utils.createID(),
    originId: item.id,
    url: item.urls.url,
    name: item.name,
    fileType: item.urls.url.split('.').pop(),
    type: 'lottie',
    mustFetch: true,
    thumb: item.thumb || item.urls.thumb,
    frames: item.attrs.frames,
    styleSize: {
      width: item.attrs.width,
      height: item.attrs.height,
    },
    duration: itemDuration(item),
    from: item.from,
    extend: { ...item.attrs },
  });
  console.log('resource', resource);
  // 素材duration保留一位小数
  resource.duration = util.timeToNum(resource.duration);

  const elementData = await editor.movie.addElementByResource(resource as any, {
    time: insertTime || editor.currentTime,
    trackIndex,
    elementType: 'lottie',
    // duration: resource.duration || 10,
  });
  // 保存历史记录
  editor.record({
    type: 'elements_create',
    desc: '添加元素' + elementData.id,
    data: [elementData],
  });
  editor.updateMovie();
  editor.updateTimeline();
  // 选中元素
  if (elementData) {
    editor.setContorlAndSelectedElemenent([elementData.id]);
  }
  return elementData;
};

export const addEffectItem = async (item: any, insertTime?: number, trackIndex?: number) => {
  const { editor } = stores;
  console.log('添加元素', item);
  item.name = item.name;
  item.jscript = item.jscript;
  item.effectType = item.attrs.effectType;

  if (item.effectType === 'gif' || item.effectType === 'apng') {
    item.resource = new ResourceItem({
      id: utils.createID(),
      originId: item.id,
      url: item.urls.url,
      name: item.name,
      fileType: item.effectType === 'gif' ? 'gif' : 'png',
      type: 'image',
      mustFetch: false,
      thumb: item.urls.thumb,
      styleSize: {
        width: Number(item.attrs.videoWidth || item.attrs.width || editor.data.width),
        height: Number(item.attrs.videoHeight || item.attrs.height || editor.data.height),
      },
      duration: Number(item.attrs.duration),
      from: item.from,
      attrs: { ...item.attrs },
    });
  }
  if (item.effectType === 'lottie') {
    item.resource = new ResourceItem({
      id: utils.createID(),
      originId: item.id,
      url: item.urls.url,
      name: item.name,
      fileType: item.urls.url.split('.').pop(),
      type: 'lottie',
      mustFetch: true,
      thumb: item.thumb || item.urls.thumb,
      frames: item.attrs.frames,
      styleSize: {
        width: item.attrs.width,
        height: item.attrs.height,
      },
      duration: util.timeToNum(item.attrs.totalFrames / item.attrs.frameRate),
      from: item.from,
      attrs: { ...item.attrs },
      extend: { ...item.attrs },
    });
  }
  let elementData = null;
  // 素材duration保留一位小数
  if (item.resource) {
    item.resource.duration = util.timeToNum(item.resource.duration);
  }

  if (item.resource) {
    elementData = await editor.movie.addElementByResource(item.resource, {
      time: insertTime || editor.currentTime,
      trackIndex,
      elementType: 'effect',
      duration: item.resource.duration || itemDuration(item),
    });
  } else {
    elementData = await editor.movie.addElementNoSource(item, {
      time: insertTime || editor.currentTime,
      trackIndex,
      elementType: 'effect',
      duration: itemDuration(item),
    });
  }

  // 保存历史记录
  editor.record({
    type: 'elements_create',
    desc: '添加元素' + elementData.id,
    data: [elementData],
  });
  editor.updateMovie();
  editor.updateTimeline();
  // 选中元素
  if (elementData) {
    editor.setSelectedElementIds([elementData.id]);
  }
  return elementData;
};

/**
 *
 * @param item
 * @param insertTime
 * @param trackIndex
 */
export const addFilterItem = async (item: any, insertTime?: number, trackIndex?: number) => {
  const { editor } = stores;
  console.log('添加元素', item);
  const resource = new ResourceItem({
    id: utils.createID(),
    originId: utils.createID(),
    url: item.urls.url,
    name: item.name,
    thumb: item.urls.thumb,
    fileType: 'png',
    type: 'image',
    mustFetch: true,
    styleSize: {
      width: item.attrs.width,
      height: item.attrs.height,
    },
    duration: itemDuration(item),
    from: 'system',
  });
  const elementData = await editor.movie.addElementByResource(resource, {
    time: insertTime || editor.currentTime,
    trackIndex,
    elementType: 'filter',
    duration: 10,
  });
  // 保存历史记录
  editor.record({
    type: 'elements_create',
    desc: '添加元素' + elementData.id,
    data: [elementData],
  });
  editor.updateMovie();
  editor.updateTimeline();
  // 选中元素
  if (elementData) {
    editor.setSelectedElementIds([elementData.id]);
  }
  return elementData;
};

export const addTextItem = async (item: any, insertTime?: number, trackIndex?: number) => {
  const { editor } = stores;
  console.log('添加元素', item);
  item.text = '文字内容';
  const elementData = await editor.movie.addElementNoSource(item, {
    time: insertTime || editor.currentTime,
    trackIndex,
    elementType: 'text',
    duration: itemDuration(item),
  });
  // 保存历史记录
  editor.record({
    type: 'elements_create',
    desc: '添加元素' + elementData.id,
    data: [elementData],
  });
  editor.updateMovie();
  editor.updateTimeline();
  // 选中元素
  if (elementData) {
    editor.setContorlAndSelectedElemenent([elementData.id]);
  }
  return elementData;
};

export const addTransitionItem = (item: any, insertTime?: number) => {
  const { editor } = stores;
  // console.log('添加元素', item, insertTime);

  // 查startElementId
  // 获取满足条件的元素
  const canTransitionArr = helper.getCanTransitionArr(editor.data);

  if (canTransitionArr.length) {
    const elementData = editor.getElementData() as any;
    if (!elementData) {
      return Toast.error(language.val('source_transition_add'));
    }
    // 判断元素后面是否有其他元素
    const [prev, next] = editor.getAdjacentElementData(elementData.id);
    if (!next) {
      return Toast.error(language.val('source_transition_add_error'));
    }

    const newTranstionItem = {
      id: utils.createID(),
      _dirty: '1',
      name: item.name,
      duration: itemDuration(item),
      startElementId: elementData.id,
      transitionName: item.attrs.name,
      __a: 1,
    };

    // 判断是否已经有转场了
    // console.log('newTranstionItemnewTranstionItem', newTranstionItem);
    for (let tran of editor.data.transitions) {
      if (tran.startElementId === newTranstionItem.startElementId) {
        Toast.success(language.val('source_transition_replace_success'));
        tran._dirty = utils.createID();
        tran.name = newTranstionItem.name;
        tran.transitionName = newTranstionItem.transitionName;
        editor.updateMovie();
        editor.updateTimeline();
        editor.updateOption();
        return;
      }
    }
    editor.data.transitions.push(newTranstionItem);
    editor.updateMovie();
    editor.updateTimeline();
    Toast.success(language.val('source_add_success'));
    return newTranstionItem;
  } else {
    Toast.error(language.val('source_transition_add_transtion_error'));
  }
  return null;
};

/**
 * 添加echart
 * @param insertTime
 * @param trackIndex
 */
async function addEChartItem(item: any, insertTime?: number, trackIndex?: number) {
  // const first = editor.data.elements[0];
  // const elementData: EChartElement = {
  //   id: utils.createID(),
  //   type: 'echart',
  //   _optionDirty: '1',
  //   _dirty: '1',
  //   name: '动态图表',
  //   blendMode: 0,
  //   flipx: false,
  //   duration: itemDuration(item),
  //   startTime: insertTime,
  //   trackIndex: trackIndex ? trackIndex : utils.inserValAB(0, (first || { trackIndex: 2 }).trackIndex),
  //   controlUnKeepRatio: true,
  //   data: `[{"time":2000,"中国":23,"美国":12,"日本":32,"韩国":23,"泰国":4,"新加坡":1,"巴基斯坦":23,"俄罗斯":21,"英国":12},{"time":2001,"中国":43,"美国":35,"日本":54,"韩国":56,"泰国":65,"新加坡":44,"巴基斯坦":22,"俄罗斯":34,"英国":23},{"time":2002,"中国":64,"美国":34,"日本":54,"韩国":75,"泰国":65,"新加坡":76,"巴基斯坦":34,"俄罗斯":45,"英国":54},{"time":2003,"中国":88,"美国":76,"日本":45,"韩国":54,"泰国":45,"新加坡":34,"巴基斯坦":45,"俄罗斯":23,"英国":67},{"time":2004,"中国":123,"美国":431,"日本":121,"韩国":233,"泰国":234,"新加坡":221,"巴基斯坦":322,"俄罗斯":112,"英国":442},{"time":2005,"中国":542,"美国":12,"日本":23,"韩国":43,"泰国":653,"新加坡":545,"巴基斯坦":322,"俄罗斯":123,"英国":342},{"time":2006,"中国":554,"美国":23,"日本":321,"韩国":23,"泰国":34,"新加坡":23,"巴基斯坦":54,"俄罗斯":54,"英国":234},{"time":2007,"中国":232,"美国":123,"日本":123,"韩国":12,"泰国":123,"新加坡":23,"巴基斯坦":54,"俄罗斯":234,"英国":123},{"time":2008,"中国":654,"美国":232,"日本":543,"韩国":12,"泰国":23,"新加坡":32,"巴基斯坦":123,"俄罗斯":34,"英国":43},{"time":2009,"中国":214,"美国":34,"日本":54,"韩国":435,"泰国":54,"新加坡":45,"巴基斯坦":542,"俄罗斯":23,"英国":23},{"time":2010,"中国":1233,"美国":231,"日本":43,"韩国":66,"泰国":54,"新加坡":45,"巴基斯坦":234,"俄罗斯":54,"英国":231}]`,
  //   style: { x: editor.data.width / 2, y: editor.data.height / 2, width: 1400, height: 800, alpha: 1 },
  //   option: {
  //     animateDuration: 0.5,
  //     chartType: 'bar',
  //     colors: [
  //       '#8DB6C7',
  //       '#C1B38E',
  //       '#CA9F92',
  //       '#F9CD97',
  //       '#E3D9B0',
  //       '#B1C27A',
  //       '#B2E289',
  //       '#51C0BF',
  //       '#59ADD0',
  //       '#7095E1',
  //       '#9FA3E3',
  //       '#C993D4',
  //       '#DB8DB2',
  //       '#F1C3D0',
  //     ], // 颜色
  //     legend: {
  //       // 图例
  //       show: false,
  //       color: '#fff',
  //       fontSize: 32,
  //     },
  //     title: {
  //       // 标题配置
  //       show: true, // 是否显示
  //       name: `{name}`, // 格式  `{name}年`
  //       fontSize: 72,
  //       color: '#fff',
  //     },
  //     ruler: {
  //       show: true,
  //       // 刻度配置
  //       color: '#fff',
  //       fontSize: 32,
  //     },
  //     seriesName: {
  //       // 数据文字
  //       show: true,
  //       fontSize: 32,
  //     },
  //   },
  // };
  // editor.data.elements.push(elementData);
  // // 保存历史记录
  // editor.record({
  //   type: 'elements_create',
  //   desc: '添加元素' + elementData.id,
  //   data: [elementData],
  // });
  // editor.updateMovie();
  // editor.updateTimeline();
  // // 选中元素
  // if (elementData) {
  //   editor.setSelectedElementIds([elementData.id]);
  // }
}

/**
 * 添加3D模型
 * @param insertTime
 * @param trackIndex
 */
async function addModel3DItem(item: any, insertTime?: number, trackIndex?: number) {
  // console.log('添加3D元素');
  // const first = editor.data.elements[0];
  // const elementData: Model3DElement = {
  //   id: utils.createID(),
  //   type: 'model3D',
  //   _dirty: '1',
  //   name: '3D模型',
  //   blendMode: 0,
  //   flipx: false,
  //   duration: itemDuration(item),
  //   startTime: insertTime,
  //   trackIndex: trackIndex ? trackIndex : utils.inserValAB(0, (first || { trackIndex: 2 }).trackIndex),
  //   style: { x: editor.data.width / 2, y: editor.data.height / 2, width: 1400, height: 800, alpha: 1 },
  //   modelURL: '/assets/N01_Beech/N01_Beech.gltf',
  //   points: [],
  // };
  // editor.data.elements.push(elementData);
  // // 保存历史记录
  // editor.record({
  //   type: 'elements_create',
  //   desc: '添加元素' + elementData.id,
  //   data: [elementData],
  // });
  // editor.updateMovie();
  // editor.updateTimeline();
  // // 选中元素
  // if (elementData) {
  //   editor.setContorlAndSelectedElemenent([elementData.id]);
  // }
}

export function itemDuration(item: any): number {
  switch (item.type) {
    case 'model3D':
      return util.timeToNum(20);
    case 'lottie':
    case 'sticker':
      return util.timeToNum(item.attrs.totalFrames / item.attrs.frameRate);
    case 'image':
    case 'video':
    case 'audio':
      return util.timeToNum(item.attrs.duration || 5);
    case 'text':
      return util.timeToNum(10);
    case 'transition':
      return util.timeToNum(2);
    case 'filter':
      return util.timeToNum(5);
    case 'effect':
      return util.timeToNum(10);
    case 'echart':
      return util.timeToNum(20);
  }
  return util.timeToNum(5);
}

export async function addItem(item: any, insertTime: number, trackIndex: number) {
  const { editor } = stores;

  if (editor.globalLoading) {
    Toast.warning('操作太频繁了');
    return;
  }

  // 转码任务状态(-1-不处理 0-待处理1-处理中 2-处理成功3-处理失败)
  if ([0, 1, 3].includes(item.convert_status)) {
    Toast.warning('素材不可用');
    return;
  }

  editor.globalLoading = true;

  const mediaTrackNum = editor.movie.getMediaTrackNum();
  if (mediaTrackNum >= editor.exConfig.maxMediaTrackNum) {
    Toast.error(`最多只能添加${editor.exConfig.maxMediaTrackNum}条媒体(视频&图片)轨道`);
    editor.globalLoading = false;
    return;
  }

  if (item.user_id) {
    item.from = 'user';
  } else {
    item.from = 'system';
  }
  let elem = null;
  switch (item.type) {
    // case 'model3D':
    //   await addModel3DItem(item, insertTime, trackIndex);
    //   break;
    case 'lottie':
    case 'sticker':
      elem = await addLottieItem(item, insertTime, trackIndex);
      break;
    case 'image':
    case 'video':
    case 'audio':
      elem = await addImageVideoAudioItem(item, insertTime, trackIndex);
      break;
    case 'text':
      elem = await addTextItem(item, insertTime, trackIndex);
      break;
    case 'transition':
      elem = addTransitionItem(item, insertTime);
      break;
    case 'filter':
      elem = await addFilterItem(item, insertTime, trackIndex);
      break;
    case 'effect':
      elem = await addEffectItem(item, insertTime, trackIndex);
      break;
    // case 'echart':
    //   await addEChartItem(item, insertTime, trackIndex);
    //   break;
  }
  editor.globalLoading = false;
  return elem;
}
