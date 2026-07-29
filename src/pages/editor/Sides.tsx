import {
  UploadOne,
  PictureOne,
  Video,
  Music,
  MoreTwo,
  Text,
  ColorFilter,
  Effects,
  InvertCamera,
  InnerShadowBottomLeft,
  TextMessage,
  Page,
} from '@icon-park/react';
import Custom from './Custom';

const fill = 'var(--theme-icon)';
export const sides = [
  {
    icon: <Page theme="outline" size="24" fill={fill} />,
    type: 'custom',
    name: '自定义',
    enName: 'Custom',
    panel: Custom,
  },
  {
    icon: <Page theme="outline" size="24" fill={fill} />,
    type: 'template',
    name: '模板', // 模板
    simple: true,
    enName: 'Template',
  },
  {
    icon: <UploadOne theme="outline" size="24" fill={fill} />,
    type: 'my',
    name: '我的', // 我的
    simple: true,
    enName: 'My',
  },
  {
    icon: <TextMessage theme="outline" size="24" fill={fill} />,
    type: 'caption',
    name: '字幕', // 字幕
    enName: 'Caption',
  },
  {
    icon: <PictureOne theme="outline" size="24" fill={fill} />,
    type: 'image',
    name: '图片', // 图片
    simple: true,
    enName: 'Image',
  },
  {
    icon: <Video theme="outline" size="24" fill={fill} />,
    type: 'video',
    simple: true,
    name: '视频', // 视频
    enName: 'Video',
  },
  {
    icon: <Music theme="outline" size="24" fill={fill} />,
    type: 'audio',
    name: '音频', // 音频
    enName: 'Audio',
  },
  {
    icon: <Text theme="outline" size="24" fill={fill} />,
    type: 'text',
    name: '文字', // 文字
    enName: 'Text',
  },
  {
    icon: <InnerShadowBottomLeft theme="outline" size="24" fill={fill} />,
    type: 'lottie',
    name: '贴纸', // 贴纸
    enName: 'Sticker',
  },
  {
    icon: <ColorFilter theme="outline" size="24" fill={fill} />,
    type: 'filter',
    name: '滤镜', // 滤镜
    enName: 'Filter',
  },
  {
    icon: <Effects theme="outline" size="24" fill={fill} />,
    type: 'effect',
    name: '特效', // 特效
    enName: 'Effect',
  },
  {
    icon: <InvertCamera theme="outline" size="24" fill={fill} />,
    type: 'transition',
    name: '转场', // 转场
    enName: 'Transition',
  },
  {
    icon: <MoreTwo theme="outline" size="24" fill={fill} />,
    type: 'more',
    name: '更多', // 更多
    enName: 'More',
  },
];
