import { util } from '@utils/index';
import type { BaseElement, ElementStyle, AnimationItem, ElementMask } from 'video-core-sdk';

interface Params {
  text: string; // 二维码内容
  size: number; // 尺寸大小
  colorDark?: string; // 背景色
  colorLight?: string; // 块区域的颜色
  correctLevel?: 'L' | 'M' | 'Q' | 'H'; // 二维码精度
}

export class QrcodeElement implements BaseElement {
  id: string = null;
  _dirty: string = '1';
  name: string = '未命名';
  duration: number = 5;
  startTime: number = 0;
  scale: number = 1;
  type: string = 'qrcode';
  trackIndex: number = null;
  flipx: number = 1;

  style: ElementStyle = {
    alpha: 1,
    x: 0,
    y: 0,
    width: 300,
    height: 300,
  }; // 位置大小旋转
  animates?: AnimationItem[] = []; // 动画
  text: string = ''; // 二维码内容
  colorDark: string = '#000000'; // 背景色
  colorLight: string = '#ffffff'; // 块区域的颜色
  correctLevel: 'L' | 'M' | 'Q' | 'H' = 'Q';
  constructor(params: Params) {
    const { size, ...other } = params;
    this.id = util.randomID();
    this.style.width = size;
    this.style.height = size;
    // 位置默认在左上角，元素的定位是以中心点为参考点进行定位的，比如画布中心坐标就是[movieData.width/2, movieData.height/2]
    this.style.x = size / 2;
    this.style.y = size / 2;
    Object.assign(this, other);
  }
}
