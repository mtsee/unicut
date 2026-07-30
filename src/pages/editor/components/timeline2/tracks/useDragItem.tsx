import { useCallback, useState } from 'react';
import { utils, helper, speedHelper } from 'video-core-sdk';
import type { BaseElement, TextElement } from 'video-core-sdk';
import $ from 'jquery';
import { config } from '../config';
import styles from './element.module.less';
import { pubsub } from '@utils/pubsub';
import './drag.less';
import { isOverlapping } from './tools';
import { util } from '@utils/index';
import { stores } from '@stores/index';

// 拖动的业务场景，上下文环境
export type DragContext = 'element' | 'source';

export interface Params {
  dragContext: DragContext;
  element: BaseElement;
  isCaption: boolean; // 是否是字幕轨道
  prevElement?: BaseElement; // prev, next
  nextElement?: BaseElement;
  forceUpdate: () => void;
  setPostion: (params: { zIndex: number; top?: number; left?: number }) => void;
  setReplace?: (replaceElementMark: boolean) => void; // 拖入元素进行替换
}

export default function useDragItem(params: Params) {
  const { editor } = stores;
  const [draging, setDraging] = useState(false);

  const { element, dragContext } = params;
  const startDragElement: any = useCallback(
    e => {
      e.stopPropagation();

      if (editor.movie.controlModeType === 'editMask') {
        editor.elementOptionType = 'basic'; // 切换到tab1
        return;
      }

      const $tracksBody = $('#h5dsVideoTracksBody');
      // 计算insert区域
      let canInsertIndex = null;
      const timelineBodyOffset = $tracksBody.offset();

      // 获取 insertsTop，时间轴轨道的top数据
      const insertsTop = [];
      const canInsertHeight = 4; // insert间隙高度
      const insertHeight = 5 + canInsertHeight * 2; // 5 + 4 + 4 = 间隙 + 上 + 下
      const timeLineTrackHeightTopArr: { top: number; height: number }[] = Object.values(editor.timeLineTrackHeightTop);
      timeLineTrackHeightTopArr.forEach(el => {
        insertsTop.push(el.top - 5 - 4);
      });
      if (timeLineTrackHeightTopArr.length) {
        const lastTimeLineTrackHeightTopElem = timeLineTrackHeightTopArr[timeLineTrackHeightTopArr.length - 1];
        insertsTop.push(lastTimeLineTrackHeightTopElem.top + lastTimeLineTrackHeightTopElem.height - canInsertHeight);
        const width = $('#elementSelectedBox').data('width');
        $('#h5dsVideoTracksBody').append(
          insertsTop
            .map((top, i) => {
              return `<div data-insertindex="${i}" class="tempInsertDom" style="top: ${top}px; width: ${width}px;"></div>`;
            })
            .join(''),
        );
      }

      // 多元素被拖动
      if (editor.selectedElementIds.includes(element.id) && editor.selectedElementIds.length > 1 && !e.ctrlKey) {
        console.log('选择了多个元素进行拖动');

        const $targets = [];
        const positionStart = {};
        editor.selectedElementIds.forEach(id => {
          const $target = $(`[data-id="${id}"]`);
          if ($target[0]) {
            $targets.push($target);
            positionStart[id] = $target.position();
          }
        });

        const target = $(e.target);
        if (!positionStart[target.data('id')]) {
          return;
        }

        $(document)
          .on('mousemove.timelineDragElement', em => {
            const scrollTop = $tracksBody.scrollTop();
            // insert可插入判断
            const top = em.pageY - timelineBodyOffset.top + scrollTop;
            canInsertIndex = null;
            for (let i = 0; i < insertsTop.length; i++) {
              const d = insertsTop[i];
              if (top >= d && top <= d + insertHeight) {
                canInsertIndex = i;
                break;
              }
            }
            $('.tempInsertDomActive').removeClass('tempInsertDomActive');
            if (canInsertIndex !== null) {
              $(`.tempInsertDom[data-insertindex="${canInsertIndex}"]`).addClass('tempInsertDomActive');
            }

            const scrollLeft = $tracksBody.scrollLeft();
            let ex = em.pageX - e.pageX + scrollLeft;
            let ey = em.pageY - e.pageY + scrollTop;

            // 批量拖动元素
            $targets.forEach($target => {
              const id = $target.data('id');
              $target.css({
                zIndex: 150,
                top: positionStart[id].top + ey,
                left: positionStart[id].left + ex,
              });
            });
          })
          .on('mouseup.timelineDragElement', eu => {
            $('.tempInsertDom').remove();
            $(document).off('mousemove.timelineDragElement');
            $(document).off('mouseup.timelineDragElement');

            // 如果选择的元素不是组中的元素，不用做处理
            const target = $(e.target);
            if (!positionStart[target.data('id')]) {
              return;
            }

            const elements = editor.getGroupElementData();

            const scrollLeft = $tracksBody.scrollLeft();
            let left = target.position().left + scrollLeft;
            if (left < 0) {
              left = 0;
            }

            // 移动的时间，确保每个元素startTime不能小于0
            const time = Number((left / editor.rulerScale).toFixed(2));
            const targetStartTime = elements.find(d => d.id === target.data('id'))?.startTime || 0;
            let moveTime = time - targetStartTime;
            const minStartTime = Math.min(...elements.map(d => d.startTime));
            if (minStartTime + moveTime < 0) {
              moveTime = -minStartTime;
            }
            elements.forEach(element => {
              element.startTime = util.timeToNum(element.startTime + moveTime);
            });

            // 在canInsertIndex位置插入elements.length 个元素
            if (canInsertIndex !== null) {
              const each = 1 / (elements.length + 1);
              elements.forEach((element, index) => {
                element.trackIndex = canInsertIndex + each * (index + 1);
              });
            }

            // 判断是否相交，相交要重新设置轨道
            elements.forEach(element => {
              editor.checkTimelineCrashAndResetTrackIndex({
                element,
                canInTrackIndex: element.trackIndex,
              });
            });

            // 更新视图
            editor.trackBodysKey = utils.createID();
            editor.setContorlAndSelectedElemenent(elements.map(d => d.id));
            editor.updateTimeline();
            params.forceUpdate();
            editor.updateTimelineTools();
            editor.updateMovie();
            // 历史记录
            editor.record({
              type: 'elements_update',
              data: [element],
              desc: '更新元素startTime',
            });
            const scrollTop = $tracksBody.scrollTop();
            setTimeout(() => {
              $('#h5dsVideoTracksBody').scrollTop(scrollTop);
            }, 0);
          });
        return;
      } else {
        // 单个元素被拖动了
        // console.log('选择元素', element, e.ctrlKey);
        if (!['temp', 'transition'].includes(element.id)) {
          // 按住ctrl键，选择多个元素，如果选择选中的元素，就取消选中
          let arr = [];
          if (e.ctrlKey) {
            if (editor.selectedElementIds.includes(element.id)) {
              arr = editor.selectedElementIds.filter(d => d !== element.id);
            } else {
              arr = [element.id, ...editor.selectedElementIds];
            }
            // 去掉重复的id
            arr = utils.uniqArr(arr);
          } else {
            // 看element是否有组
            if (element.groupId) {
              editor.data.elements.forEach(d => {
                if (element.groupId === d.groupId) {
                  arr = [...arr, d.id];
                }
              });
            } else {
              arr = [element.id];
            }
          }

          if (element._noControl) {
            editor.setSelectedElementIds(arr);
          } else {
            editor.setContorlAndSelectedElemenent(arr);
          }
        }
      }

      // 开始拖动元素，如果是素材那边拖入的元素，没有$target
      // const $target = $(`[data-id="${element.id}"]`);
      const $target = $(e.target);
      const targetOffset = $target.offset();
      const position = $target.position();

      // 获取elements元素，吸附对齐，source拖入的时候没有紫色的磁吸线
      const $h5dsMagnetLine = $('#h5dsMagnetLine');
      let elementsX = [0];

      console.log('dragContext', dragContext);

      if (dragContext === 'source') {
        // source的时候不做x轴的对齐
      } else {
        const $items = $tracksBody.find('.element-item');
        $items.each((_index, target) => {
          const $t = $(target);
          if ($t.attr('data-id') !== element.id) {
            const o = $t.offset();
            elementsX.push(o.left);
            elementsX.push(o.left + $t[0].offsetWidth);
          }
        });
        const $h5dsCursor = $('#h5dsCursor');
        if ($h5dsCursor[0]) {
          const cursorLeft = $h5dsCursor.offset().left;
          elementsX.push(cursorLeft + $h5dsCursor[0].offsetWidth / 2);
          elementsX = utils.uniqArr(elementsX);
        }
      }

      // 判断同轨道的元素是否相交
      const groups = helper.groupByTrackIndex(editor.data.elements);

      // 获取track类型
      const indexTrackTypes = {};
      groups.forEach((elms, index) => {
        indexTrackTypes[index] = elms[0]?.type;
      });

      // 计算canIn区域
      let canInIndex = null;
      const canInTop = [];
      // console.log('indexTrackTypes', element.type, groups, indexTrackTypes, editor.timeLineTrackHeightTop);

      Object.values(editor.timeLineTrackHeightTop).forEach(
        (el: { top: number; height: number; trackIndex: number; elementType: string }) => {
          // video 和 image 可以混合轨道
          if (['video', 'image'].includes(element.type) && ['video', 'image'].includes(el.elementType)) {
            canInTop.push({
              height: el.height - canInsertHeight * 2,
              top: el.top + canInsertHeight,
              trackIndex: el.trackIndex,
            });
          } else {
            if (el.elementType === element.type) {
              canInTop.push({
                height: el.height - canInsertHeight * 2,
                top: el.top + canInsertHeight,
                trackIndex: el.trackIndex,
              });
            }
          }
        },
      );
      // $('#h5dsVideoTracksBody').append(
      //   canInTop
      //     .map((d, i) => {
      //       return `<div data-caninindex="${i}" class="tempCanInDom" style="top: ${d.top}px; height: ${d.height}px;"></div>`;
      //     })
      //     .join(''),
      // );
      console.log('can in', canInTop);

      const gasp = 4; // 吸附距离参数
      const targetWidth = $target[0]?.offsetWidth || 0;

      $(document)
        .on('mousemove.timelineDragElement', em => {
          const scrollTop = $tracksBody.scrollTop();
          const scrollLeft = $tracksBody.scrollLeft();
          let ex = em.pageX - e.pageX + scrollLeft;
          let ey = em.pageY - e.pageY + scrollTop;

          // x轴对齐线
          $h5dsMagnetLine?.css({ display: 'none' });
          for (let i = 0; i < elementsX.length; i++) {
            const x = elementsX[i] + scrollLeft;
            const targetx1 = targetOffset.left + ex;
            const targetx2 = targetOffset.left + ex + targetWidth;
            if (Math.abs(targetx1 - x) <= gasp) {
              $h5dsMagnetLine?.css({ left: x - timelineBodyOffset.left, display: 'block' });
              ex = x - targetOffset.left;
              break;
            }
            if (Math.abs(targetx2 - x) <= gasp) {
              $h5dsMagnetLine?.css({ left: x - timelineBodyOffset.left, display: 'block' });
              ex = x - targetOffset.left - targetWidth;
              break;
            }
          }

          // insert可插入判断
          const top = em.pageY - timelineBodyOffset.top + scrollTop;
          canInsertIndex = null;
          for (let i = 0; i < insertsTop.length; i++) {
            const d = insertsTop[i];
            if (top >= d && top <= d + insertHeight) {
              canInsertIndex = i;
              break;
            }
          }
          $('.tempInsertDomActive').removeClass('tempInsertDomActive');
          if (canInsertIndex !== null) {
            $(`.tempInsertDom[data-insertindex="${canInsertIndex}"]`).addClass('tempInsertDomActive');
          }

          // canIn可插入判断
          canInIndex = null;
          for (let i = 0; i < canInTop.length; i++) {
            const d = canInTop[i];
            if (top >= d.top && top <= d.top + d.height) {
              canInIndex = d.trackIndex;
            }
          }
          params.setPostion({
            zIndex: 150,
            top: position.top + ey,
            left: position.left + ex,
          });
        })
        .on('mouseup.timelineDragElement', eu => {
          console.log('canInsertIndex------------------------------->', canInsertIndex);
          editor.tempInsertIndex = canInsertIndex;
          $('.tempInsertDom').remove();
          $(document).off('mousemove.timelineDragElement');
          $(document).off('mouseup.timelineDragElement');

          // 有效拖动才会修改startTime
          const scrollLeft = $tracksBody.scrollLeft();
          let left = $(e.target).position().left + scrollLeft;
          if (left < 0) {
            left = 0;
          }
          const time = util.timeToNum(left / editor.rulerScale);

          // 相交不做变动
          if (['caption', 'camera'].includes(element.type)) {
            // // 碰撞检测
            let isOver = false;
            let elements = [];
            if (element.type === 'caption') {
              elements = editor.data.captions.filter(d => d.id !== element.id);
            }
            if (element.type === 'camera') {
              elements = editor.data.cameras.filter(d => d.id !== element.id);
            }
            isOver = isOverlapping(elements, {
              startTime: time,
              duration: element.duration,
            });

            if (isOver) {
              editor.updateTimeline();
              params.setPostion({
                zIndex: 0,
              });
              $h5dsMagnetLine?.css({ display: 'none' });
              params.forceUpdate();
              editor.updateMovie();
              return;
            }
          }

          element.startTime = time;

          if (canInsertIndex !== null) {
            element.trackIndex = canInsertIndex + 0.5;
          }
          if (canInIndex !== null) {
            editor.checkTimelineCrashAndResetTrackIndex({
              element,
              canInTrackIndex: canInIndex,
            });
          }
          editor.updateTimeline();
          params.setPostion({
            zIndex: 0,
          });
          $h5dsMagnetLine?.css({ display: 'none' });
          // 如果是字幕，重新排序
          if (element.type === 'caption') {
            editor.data.captions.sort((a, b) => a.startTime - b.startTime);
          }
          params.forceUpdate();
          editor.updateTimelineTools();
          editor.updateMovie();
          editor.totalTimeKey = util.randomID();
          // 历史记录
          editor.record({
            type: 'elements_update',
            data: [element],
            desc: '更新元素startTime',
          });
        });
    },
    [element],
  );

  return [startDragElement, draging];
}
