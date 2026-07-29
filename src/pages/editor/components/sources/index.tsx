import { observer } from 'mobx-react';
import My from './my';
import Image from './image';
import Video from './video';
import Text from './text';
import Filter from './filter';
import Effect from './effect';
import Transition from './transition';
// import Background from '../options/components/background';
import Audio from './audio';
import More from './more';
import Lottie from './lottie';
import Template from './template';
import Caption from './caption';
import AiComp from './ai';
import { stores } from '@stores/index';
// import styles from './sources.module.less';

export interface IProps {}

function Sources(props: IProps) {
  const { editor } = stores;
  return (
    <>
      <Template show={editor.sourceType === 'template'} />
      <My show={editor.sourceType === 'my'} />
      <Caption show={editor.sourceType === 'caption'} />
      <Image show={editor.sourceType === 'image'} />
      <Audio show={editor.sourceType === 'audio'} />
      <Video show={editor.sourceType === 'video'} />
      <Text show={editor.sourceType === 'text'} />
      <Lottie show={editor.sourceType === 'lottie'} />
      <Filter show={editor.sourceType === 'filter'} />
      <Effect show={editor.sourceType === 'effect'} />
      <Transition show={editor.sourceType === 'transition'} />
      <AiComp show={editor.sourceType === 'ai'} />
      <More show={editor.sourceType === 'more'} />
      {editor.sides?.map(item => {
        const Panel = item.panel as any;
        if (!Panel) {
          return null;
        }
        return (
          <div
            style={{
              height: '100%',
              position: 'relative',
              display: editor.sourceType === item.type ? 'block' : 'none',
            }}
            key={item.type}
          >
            <Panel editor={editor} show={editor.sourceType === item.type} />
          </div>
        );
      })}
    </>
  );
}

export default observer(Sources);
