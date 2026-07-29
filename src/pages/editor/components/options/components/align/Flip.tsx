import { Switch } from '@douyinfe/semi-ui';
import { observer } from 'mobx-react';
import type { VideoElement } from 'video-core-sdk';
import { stores } from '@stores/index';
import { useReducer } from 'react';

export interface IProps {
  onChange: (checked: boolean) => void;
}

function Flip(props: IProps) {
  const { editor } = stores;
  const [, forceUpdate] = useReducer(x => x + 1, 0);
  editor.timelineToolsUpdateKey;
  const elementData = editor.getElementData() as VideoElement;

  return (
    <Switch
      size="small"
      checked={!!elementData?.flipx}
      onChange={checked => {
        elementData.flipx = checked;
        editor.updateMovie();
        forceUpdate();
        props.onChange(checked);
        editor.record({
          type: 'elements_update',
          desc: '镜像翻转',
          data: [elementData],
        });
      }}
    />
  );
}

export default observer(Flip);
