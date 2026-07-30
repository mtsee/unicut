import '@icon-park/react/styles/index.css';
import styles from './sidebar.module.less';
// import logo1 from '@images/logo1.png';
// import logo2 from '@images/logo2.png';
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
  RobotOne,
} from '@icon-park/react';
import classNames from 'classnames';
import { observer } from 'mobx-react';
// import KeyboardModal from './KeyboardModal';
// import { Button } from '@douyinfe/semi-ui';
import { theme } from '@theme';
import { language } from '@language/language';
import { SideItem } from '@config/sdk';
import { stores } from '@stores/index';

export interface ISideBarProps {}

function SideBar(props: ISideBarProps) {
  const { editor } = stores;
  const fill = 'var(--theme-icon)';
  let menus: SideItem[] = editor.sides || [
    {
      icon: <Page theme="outline" size="24" fill={fill} />,
      type: 'template',
      name: '模板', // 模板
      simple: true,
      enName: 'Template',
    },
    // {
    //   icon: <RobotOne theme="outline" size="24" fill={fill} />,
    //   type: 'ai',
    //   name: 'Ai生成', // 我的
    //   enName: 'Ai',
    // },
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

  if (editor.editMode === 'template') {
    menus = menus.filter(d => d.simple);
  }

  const languageType = language.getLanguage();
  editor.themeUpdateKey;
  return (
    <div className={styles.sidebar}>
      <span className={styles.logo}>
        {editor.exConfig.logoOnClick ? (
          <a onClick={editor.exConfig.logoOnClick}>
            <img src={editor.exConfig.logo(theme.getTheme())} alt="" />
          </a>
        ) : (
          <a href={editor.exConfig.logoLink || '/workspace/draft'}>
            {/* <img src={editor.exConfig.logo(theme.getTheme())} alt="" /> */}
            UniCut
          </a>
        )}
      </span>
      <div className={styles.menus + ' scroll'}>
        <ul>
          {menus.map((d, i) => {
            return (
              <li
                onClick={() => {
                  editor.setSourceType(d.type as any);
                }}
                key={d.type}
                className={classNames(d.type === editor.sourceType ? styles.active : '')}
              >
                <i>{d.icon}</i>
                <p>{languageType === 'zh-CN' ? d.name : d.enName}</p>
              </li>
            );
          })}
        </ul>
      </div>
      {/* <div className={styles.bottom}>
        <KeyboardModal />
      </div> */}
    </div>
  );
}

export default observer(SideBar);
