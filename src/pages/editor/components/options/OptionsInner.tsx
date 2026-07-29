import styles from './optionsInner.module.less';
import { observer } from 'mobx-react';
import ImageOptions from './elements/ImageOptions';
import TextOptions from './elements/TextOptions';
import VideoOptions from './elements/VideoOptions';
import FilterOptions from './elements/FilterOptions';
import EffectOptions from './elements/EffectOptions';
import GroupOptions from './elements/GroupOptions';
import AudioOptions from './elements/AudioOptions';
import CameraOptions from './elements/CameraOptions';
// import EchartOptions from './elements/EchartOptions';
import CaptionOptions from './elements/CaptionOptions';
import TransitionOptions from './elements/TransitionOptions';
import LottieOptions from './elements/LottieOptions';
import type { BaseElement, TransitionItem } from 'video-core-sdk';
import { Empty } from '@douyinfe/semi-ui';
import { IllustrationNoResult, IllustrationNoResultDark } from '@douyinfe/semi-illustrations';
import { language } from '@language/language';
import { stores } from '@stores/index';

export interface IProps {
  elements: BaseElement[];
}

function OptionsInner(props: IProps) {
  const { editor } = stores;
  if (!editor.movie) return null;
  const elements = editor.movie.getElementDataByIds([...editor.selectedElementIds]) || [];

  if (elements.length === 1) {
    const [elementData] = elements;

    console.log('elementData', elementData);

    switch (elementData.type) {
      case 'image':
        return <ImageOptions key={elementData.id} element={elementData} />;
      case 'text':
        return <TextOptions key={elementData.id} element={elementData} />;
      case 'caption':
        return <CaptionOptions key={elementData.id} element={elementData} />;
      case 'video':
        return <VideoOptions key={elementData.id} element={elementData} />;
      case 'filter':
        return <FilterOptions key={elementData.id} element={elementData} />;
      case 'effect':
        return <EffectOptions key={elementData.id} element={elementData} />;
      case 'audio':
        return <AudioOptions key={elementData.id} element={elementData} />;
      case 'lottie':
        return <LottieOptions key={elementData.id} element={elementData} />;
      case 'camera':
        return <CameraOptions key={elementData.id} element={elementData} />;
      default:
        if ((elementData as any).startElementId) {
          return <TransitionOptions key={elementData.id} element={elementData as any} />;
        }
        const plus = editor.pluginsConfig.find(d => d.type === elementData.type);
        if (plus) {
          const Options = plus.Options as any;
          return <Options editor={editor} language={language} key={elementData.id} element={elementData} />;
        }
        return null;
    }
  } else if (elements.length > 1) {
    return <GroupOptions />;
  }

  return (
    <div className={styles.empty}>
      <Empty
        image={<IllustrationNoResult style={{ width: 150, height: 150 }} />}
        darkModeImage={<IllustrationNoResultDark style={{ width: 150, height: 150 }} />}
        description={'类型错误'}
      />
    </div>
  );
}
export default observer(OptionsInner);
