import { util } from '@utils/index';
import { utils } from 'video-core-sdk';

// 碰撞检测
export function isOverlapping(elements, newElement) {
  const newStart = newElement.startTime;
  const newEnd = newElement.startTime + newElement.duration;
  for (const element of elements) {
    const elementStart = element.startTime;
    const elementEnd = element.startTime + element.duration;
    // 判断两个区间是否相交
    if (
      utils.toNum(newStart, 1) < utils.toNum(elementEnd, 1) &&
      utils.toNum(newEnd, 1) > utils.toNum(elementStart, 1)
    ) {
    //   console.log('newStart', utils.toNum(newStart, 1));
    //   console.log('elementEnd', utils.toNum(elementEnd, 1));
    //   console.log('newEnd', utils.toNum(newEnd, 1));
    //   console.log('elementStart', utils.toNum(elementStart, 1));
      return true; // 存在相交
    }
  }
  return false; // 没有相交
}
