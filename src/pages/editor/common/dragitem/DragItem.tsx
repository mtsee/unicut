import { useEffect, useState, useRef } from 'react';
import { DragItemCls } from './dragItemCls';
import styles from './styles.module.less';
import type { SourceItem } from '../../types';
import { Time, Music, Text, ColorFilter } from '@icon-park/react';
import $ from 'jquery';
import { addItem, itemDuration } from '../../components/sources/addItem';
import { pubsub } from '@utils/pubsub';
import { cloneDeep } from 'lodash';

import { util } from '@utils/index';
import { helper, utils, ResourceItem } from 'video-core-sdk';
import type { ImageElement, VideoElement } from 'video-core-sdk';
import { Toast } from '@douyinfe/semi-ui';
import { config } from '@config/index';
import useDragItem from '@pages/editor/components/timeline2/tracks/useDragItem';
import { language } from '@language/language';
import { stores } from '@stores/index';
import { hydrateResourcePaths } from '@services/localStorageService';
// import isEqual from 'react-fast-compare';

export interface IProps {}

export default function DragItem(props: IProps) {
  const { editor } = stores;

  const [item, setItem] = useState<SourceItem>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [element, setElement] = useState<any>({
    id: 'temp',
    duration: 5,
    trackIndex: 0,
    type: 'image',
    startTime: 0,
  });

  const replaceElementMark = useRef(false);

  const [startDragElement] = useDragItem({
    dragContext: 'source',
    element: element,
    isCaption: false,
    forceUpdate: () => {},
    prevElement: null,
    nextElement: null,
    setPostion: pos => {
      // setStyle(pos);
    },
  });

  useEffect(() => {
    const di = new DragItemCls(editor);
    let tempPos = null;
    let tempElement = null;

    const replaceElementById = async (id: string, d: any) => {
      if (!editor.movie) return;

      // 替换资源
      const [elementData] = editor.movie.getElementDataByIds([id]);
      const item = d;

      // 判断元素时长是否满足
      if (item.type === 'video' && item.attrs.duration < elementData.duration) {
        Toast.error(language.val('common_toast_video_replace_limit', { duration: elementData.duration }));
        return;
      }
      const hasAudio = await util.checkVideoUrlHasAudio(editor.movie.reURL(item.urls.url), item.type);
      // 通过 _localPath 判断资源是否来自本地存储
      const isLocal = !!(item._localPath);

      console.log('hasAudio', hasAudio);
      // 添加素材
      const resource = new ResourceItem({
        id: utils.createID(),
        originId: item.id,
        url: isLocal ? (item._localPath || item.urls.url) : item.urls.url,
        name: item.name,
        fileType: item.type,
        type: item.type as any,
        isLocal: isLocal ? true : false,
        noAudioTracks: !hasAudio,
        mustFetch: item.type === 'image' ? true : false,
        thumb: isLocal ? (item._thumbPath || item.urls.thumb) : item.urls.thumb,
        frames: item.attrs.frames,
        wave: item.attrs.wave,
        styleSize: {
          width: item.attrs.videoWidth || item.attrs.naturalWidth || Number(item.attrs.width),
          height: item.attrs.videoHeight || item.attrs.naturalHeight || Number(item.attrs.height),
        },
        duration: item.attrs.duration,
        from: item.user_id ? 'user' : 'system',
        attrs: { ...item.attrs },
      });
      resource.duration = util.timeToNum(resource.duration);
      // 先判断资源是否重复，通过url判断是否重复资源
      let hasRes = editor.data.resouces.find(d => d.url === resource.url);
      if (!hasRes) {
        hasRes = cloneDeep(resource);
        editor.data.resouces.push(hasRes);
      }

      // 本地存储模式：将资源中的相对路径解析为 blob URL
      if (isLocal && editor.movie?.resourceManage) {
        await hydrateResourcePaths([hasRes as any], editor.movie.resourceManage);
      }

      // 预加载资源
      pubsub.publish('timelineLoading', true);
      // 缓存资源
      if (hasRes.type === 'image') {
        await editor.movie.resourceManage.fetchBlob(hasRes.url);
      } else if (hasRes.type === 'video') {
        // 本地存储模式：先解析为 blob URL 再加载
        const videoUrl = isLocal
          ? editor.movie.resourceManage.getCachedBlobUrl(hasRes.url) || hasRes.url
          : editor.movie.reURL(hasRes.url);
        await utils.mediaLazy(videoUrl).then(media => {
          editor.movie.resourceManage.medias[hasRes!.url] = media;
        });
      } else {
        // 只做图片，视频的资源预加载
      }
      pubsub.publish('timelineLoading', false);

      // 视频，图片可以互相替换
      const element = elementData as VideoElement;

      if (hasRes.url.indexOf('.gif') !== -1) {
        (element as ImageElement).isGif = true;
      } else {
        (element as ImageElement).isGif = false;
      }

      if (hasRes.type !== elementData.type) {
        if (hasRes.type === 'video') {
          element.type = 'video';
          element.clipTime = 0;
          element.volume = 1;
          element.muted = true;
          element.speed = 1;
          element.curveSpeed = false;
          element.fadeInTime = 0;
          element.fadeOutTime = 0;
          element.separate = 0;
        } else {
          element.type = 'image';
          delete element.clipTime;
          delete element.volume;
          if (element.muted !== undefined) {
            delete element.muted;
          }
          delete element.speed;
          delete element.curveSpeed;
          delete element.separate;
          delete element.fadeInTime;
          delete element.fadeOutTime;
        }
      }
      // 只替换选中的元素
      const elem = elementData as VideoElement;
      elem.type = element.type;
      elem._dirty = util.randomID();
      elem.resourceId = hasRes.id;
      utils.setCropSize(elem, hasRes.styleSize);

      // 去掉没用的素材
      editor.movie.clearUnUsedResource();

      // 全部resourceId相同的元素都一起替换
      // const oldResourceId = elem.resourceId;
      // editor.data.elements.forEach((elem: VideoElement) => {
      //   if (elem.resourceId === oldResourceId) {
      //     // 更新元素
      //     elem.type = element.type;
      //     elem._dirty = util.randomID();
      //     elem.resourceId = hasRes.id;
      //     // 重新设置裁剪，自动适配
      //     utils.setCropSize(elem, hasRes.styleSize);
      //   }
      // });
      editor.updateMovie();

      // 保存历史记录
      editor.record({
        type: 'elements_update',
        desc: '替换元素资源' + elementData.id,
        data: [elementData],
      });
    };

    di.on('dragstart', (d, pos, e) => {
      tempPos = { ...pos };
      tempElement = {
        id: util.randomID(),
        type: d.type,
        startTime: 0,
        duration: itemDuration(d),
        name: d.name,
        attrs: d.attrs,
      };
      setElement(tempElement);
      setPosition({ ...pos });
      startDragElement(e);
      if (d.type === 'transition') {
        const canTransitionArr = helper.getCanTransitionArr(editor.data);
        editor.transitionCanInsertTemp = canTransitionArr.map(d => d.id);
      }
      // if (editor.editMode === 'auto') {
      //   onDragElement(e);
      // }
    });

    di.on('dragmove', (d, pos, e) => {
      if (!item && Math.abs(pos.x - tempPos.x) > 3 && Math.abs(pos.y - tempPos.y) > 3) {
        setItem(d);
      }
      const $item = $(e.target).closest('.element-item');
      document.querySelectorAll('.element-replace').forEach(el => {
        $(el).removeClass('element-replace');
      });

      // 判断是否可替换
      const itemType = $item.data('type');
      if (['video', 'image'].includes(itemType) && ['video', 'image'].includes(tempElement.type)) {
        replaceElementMark.current = true;
      } else if (itemType === tempElement.type) {
        replaceElementMark.current = true;
      } else {
        replaceElementMark.current = false;
      }

      if (replaceElementMark.current && $item[0]) {
        $item.addClass('element-replace');
      }
      setPosition({ ...pos });
    });

    di.on('dragend', async (d, pos, e) => {
      setItem(null);
      editor.transitionCanInsertTemp = [];
      // 误差3px都算点击事件
      if (Math.abs(pos.x - tempPos.x) < 3 && Math.abs(pos.y - tempPos.y) < 3) {
        // 音频不点击
        // 系统音频点击后不做处理
        if (d.type === 'audio' && !d.user_id) return;

        // loading
        await addItem(d, undefined, undefined);
        tempPos = null;
        return;
      }
      tempPos = null;

      // 模版替换
      if (editor.editMode === 'template') {
        // 模版替换
        const $item = $(e.target).closest('.replaceTemplateItem');
        if ($item[0]) {
          await replaceElementById($item.attr('data-id'), d);
        }
      } else {
        let trackIndex = tempElement.trackIndex;
        setElement({
          id: 'temp',
          duration: 5,
          trackIndex: 0,
          type: 'image',
          startTime: 0,
        });
        pubsub.publish('timelineLoading', true);
        const $h5dsVideoTracksBody = $('#h5dsVideoTracksBody');
        const elementsLength = editor.data.elements.length;

        // 替换素材
        if (replaceElementMark.current) {
          const replaceElementId = $('.element-replace').removeClass('element-replace').data('id');
          if (tempElement.type === 'transition') {
            const tran = editor.data.transitions.find(d => d.id === replaceElementId);
            tran._dirty = utils.createID();
            tran.name = tempElement.name;
            tran.transitionName = tempElement.attrs.name;
            editor.updateMovie();
            editor.updateOption();
            Toast.success(language.val('common_toast_replace_success'));
          } else {
            await replaceElementById(replaceElementId, d);
          }

          editor.updateTimeline();
        } else {
          // 判断插入上面还是下面，或者中间
          const scrollx = Number($h5dsVideoTracksBody.scrollLeft());
          const time = (e.pageX - $h5dsVideoTracksBody.offset().left + scrollx) / editor.rulerScale;

          if (e.target.dataset.inserttransition) {
            const insertElementId = e.target.dataset.elementid;
            editor.setContorlAndSelectedElemenent([insertElementId]);
          }

          if (d.type === 'transition' && !e.target.dataset.inserttransition) {
            Toast.warning(language.val('common_toast_transition_limit'));
            return;
          }

          // 如果是转场，计算当前插入的位置
          const elem = await addItem(d, elementsLength === 0 ? 0 : time, trackIndex);
          // 判断同轨道是否重叠，如果重叠要自动切换
          if (elem && elem.trackIndex !== undefined) {
            const a = editor.checkTrackElementOverlap(elem.trackIndex);
            if (a) {
              a.trackIndex += 0.5;
            }
          }
          editor.setContorlAndSelectedElemenent([elem.id]);
          // 更新画布，更新时间轴
          editor.updateMovie();
          editor.updateTimeline();
        }
        pubsub.publish('timelineLoading', false);
      }
    });

    return () => {
      di.destroy();
    };
  }, []);

  if (item) {
    switch (item.type) {
      case 'video':
      case 'image':
      case 'lottie':
      case 'sticker':
        return (
          <div
            style={{
              top: position.y,
              left: position.x,
            }}
            className={styles.item}
          >
            <img className={styles.thumb} src={editor.movie.reURL(item.urls.thumb)} alt="" />
            <span className={styles.nameTime}>
              <h5>{item.name}</h5>
              <p>
                <Time theme="outline" size="14" fill="var(--theme-icon)" />
                &nbsp;&nbsp;
                {utils.secToTime(item.attrs?.duration || 5, 'mm:ss')}
              </p>
            </span>
          </div>
        );
      case 'audio':
        return (
          <div
            style={{
              top: position.y,
              left: position.x,
            }}
            className={styles.item}
          >
            <Music theme="outline" size="35" fill="var(--theme-icon)" />
            <span className={styles.nameTime}>
              <h5>{item.name}</h5>
              <p>
                <Time theme="outline" size="14" fill="var(--theme-icon)" />
                &nbsp;&nbsp;
                {utils.secToTime(item.attrs?.duration || 5, 'mm:ss')}
              </p>
            </span>
          </div>
        );
      case 'text':
      case 'filter':
      case 'effect':
      case 'transition':
        return (
          <div
            style={{
              top: position.y,
              left: position.x,
            }}
            className={styles.item}
          >
            {item.type === 'text' && <Text theme="outline" size="20" fill="var(--theme-icon)" />}
            {['filter', 'effect', 'transition'].includes(item.type) && (
              <img style={{ height: 30 }} className={styles.thumb} src={editor.movie.reURL(item.urls.thumb)} alt="" />
            )}
            <span className={styles.nameTime}>
              <h5>{item.name}</h5>
            </span>
          </div>
        );
      default:
        return null;
    }
  } else {
    return null;
  }
}
