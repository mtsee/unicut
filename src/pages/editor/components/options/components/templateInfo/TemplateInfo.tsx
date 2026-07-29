import styles from './styles.module.less';
import Item from '../item';
import { TextArea } from '@douyinfe/semi-ui';
import type { VideoElement } from 'video-core-sdk';
import { useReducer } from 'react';
import { observer } from 'mobx-react';
import { language } from '@language/language';
import { stores } from '@stores/index';

// https://pixijs.download/release/docs/PIXI.html#BLEND_MODES
/**
 * 模版的相关描述
 */
export interface IProps {}
function TemplateInfo(props: IProps) {
  const { editor } = stores;
  const [, forceUpdate] = useReducer(x => x + 1, 0);
  const elementData = editor.getElementData() as VideoElement;

  return (
    <Item title={language.val('option_template_info')}>
      <TextArea
        value={elementData.desc || ''}
        onChange={v => {
          elementData.desc = v;
          forceUpdate();
        }}
      />
    </Item>
  );
}
export default observer(TemplateInfo);
