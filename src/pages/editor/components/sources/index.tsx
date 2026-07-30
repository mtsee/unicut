import { observer } from 'mobx-react';
import My from './my';
import Image from './image';
import Video from './video';
import Text from './text';
import Filter from './filter';
import Effect from './effect';
import Transition from './transition';
import Audio from './audio';
import More from './more';
import Lottie from './lottie';
import Template from './template';
import Caption from './caption';
import AiComp from './ai';
import { stores } from '@stores/index';

export interface IProps {}

function Sources(props: IProps) {
  const { editor } = stores;
  const type = editor.sourceType;

  return (
    <>
      {type === 'template' ? <Template /> : null}
      {type === 'my' ? <My /> : null}
      {type === 'caption' ? <Caption /> : null}
      {type === 'image' ? <Image /> : null}
      {type === 'audio' ? <Audio /> : null}
      {type === 'video' ? <Video /> : null}
      {type === 'text' ? <Text /> : null}
      {type === 'lottie' ? <Lottie /> : null}
      {type === 'filter' ? <Filter /> : null}
      {type === 'effect' ? <Effect /> : null}
      {type === 'transition' ? <Transition /> : null}
      {type === 'ai' ? <AiComp /> : null}
      {type === 'more' ? <More /> : null}
      {editor.sides?.map(item => {
        const Panel = item.panel as any;
        if (!Panel) {
          return null;
        }
        return type === item.type ? (
          <div
            style={{ height: '100%', position: 'relative' }}
            key={item.type}
          >
            <Panel editor={editor} show={editor.sourceType === item.type} />
          </div>
        ) : null;
      })}
    </>
  );
}

export default observer(Sources);
