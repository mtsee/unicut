import styles from './styles.module.less';
import Item from '../item';
import { Button, Modal, TextArea } from '@douyinfe/semi-ui';
import type { TextElement, VideoElement } from 'video-core-sdk';
import { useReducer, useState } from 'react';
import { observer } from 'mobx-react';
// import * as PIXI from 'pixi.js';
import { language } from '@language/language';
import { stores } from '@stores/index';

// https://pixijs.download/release/docs/PIXI.html#BLEND_MODES
/**
 * 模版模式切换
 */
export interface IProps {}
function TemplateDown(props: IProps) {
  const { editor } = stores;
  const [, forceUpdate] = useReducer(x => x + 1, 0);
  const elementData = editor.getElementData() as TextElement;
  const [visible, setVisible] = useState(false);
  const [img, setImg] = useState('');

  return (
    <>
      <Item
        title={language.val('option_export_data')}
        extra={
          <Button
            onClick={async () => {
              // 导出指定图层的封面
              setVisible(true);
              const image = await editor.movie?.pixiContainerToImageById(elementData.id);
              if (image) {
                setImg(image.src);
              }
            }}
          >
            Download
          </Button>
        }
      ></Item>
      <Modal
        visible={visible}
        title={language.val('option_export_data')}
        onCancel={() => {
          setVisible(false);
        }}
      >
        <TextArea rows={10} style={{ whiteSpace: 'pre-wrap' }} value={JSON.stringify(elementData.textStyle)}></TextArea>
        <a href={img} download={`${elementData.textStyle.fontFamily}.png`}>
          <img src={img} style={{ width: '100%' }} alt="" />
        </a>
      </Modal>
    </>
  );
}
export default observer(TemplateDown);
