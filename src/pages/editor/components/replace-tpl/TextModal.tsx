import { TextArea } from '@douyinfe/semi-ui';
import { observer } from 'mobx-react';
import type { TextElement } from 'video-core-sdk';
import { useReducer } from 'react';
import { stores } from '@stores/index';

export interface IProps {
  elementId: string;
}

function TextModal(props: IProps) {
  const { editor } = stores;
  const [, forceUpdate] = useReducer(x => x + 1, 0);
  const [elementData] = editor.movie.getElementDataByIds([props.elementId]);
  const element = elementData as TextElement;

  return (
    <TextArea
      value={element.text}
      onChange={v => {
        element.text = v;
        forceUpdate();
      }}
    />
  );
}

export default observer(TextModal);
