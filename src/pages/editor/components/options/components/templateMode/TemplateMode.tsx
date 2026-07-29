import styles from './styles.module.less';
import Item from '../item';
import { Button, InputNumber, Space, Switch, TextArea } from '@douyinfe/semi-ui';
import type { VideoElement } from 'video-core-sdk';
import { useReducer } from 'react';
import { observer } from 'mobx-react';
import { util } from '@utils/index';
import { language } from '@language/language';
import { stores } from '@stores/index';

// https://pixijs.download/release/docs/PIXI.html#BLEND_MODES
/**
 * 模版模式切换
 */
export interface IProps {}
function TemplateMode(props: IProps) {

  return null;
  // const { editor } = stores;
  // const [, forceUpdate] = useReducer(x => x + 1, 0);
  // const elementData = editor.getElementData() as VideoElement;

  // return (
  //   <>
  //     <Item
  //       title={language.val('option_template_replaceable')}
  //       extra={
  //         <Switch
  //           checked={elementData.templateEnable}
  //           onChange={e => {
  //             elementData.templateEnable = e;
  //             forceUpdate();
  //             editor.updateTimelineElement();
  //             // editor.timelineUpdateElementKey = util.randomID();
  //           }}
  //         />
  //       }
  //     >
  //       {elementData.templateEnable && (
  //         <>
  //           <div style={{ paddingTop: 10 }}>
  //             <InputNumber
  //               style={{ width: '100%' }}
  //               placeholder={language.val('option_template_scene_index')}
  //               value={elementData.sceneIndex || ''}
  //               onChange={v => {
  //                 elementData.sceneIndex = Number(v);
  //                 forceUpdate();
  //               }}
  //             />
  //           </div>
  //           <div style={{ paddingTop: 10 }}>
  //             <TextArea
  //               placeholder={language.val('option_template_info')}
  //               value={elementData.desc || ''}
  //               onChange={v => {
  //                 elementData.desc = v;
  //                 forceUpdate();
  //               }}
  //             />
  //           </div>
  //         </>
  //       )}
  //     </Item>
  //     {elementData.type === 'video' && elementData.templateEnable && (
  //       <Item
  //         title={language.val('option_demo')}
  //         extra={
  //           <Space>
  //             <a
  //               onClick={() => {
  //                 const resource = editor.movie.resourceManage.getResouceById(elementData.resourceId);
  //                 const a = document.createElement('a');
  //                 a.href = resource.url;
  //                 a.download = resource.name;
  //                 a.click();
  //               }}
  //             >
  //               Download
  //             </a>
  //             <Button
  //               onClick={() => {
  //                 const resource = editor.movie.resourceManage.getResouceById(elementData.resourceId);
  //                 elementData.sampleVideo = {
  //                   url: resource.url,
  //                   clipTime: elementData.clipTime || 0,
  //                   duration: elementData.duration,
  //                 };
  //                 forceUpdate();
  //               }}
  //             >
  //               {language.val('option_demo_button')}
  //             </Button>
  //           </Space>
  //         }
  //       >
  //         {elementData.sampleVideo && (
  //           <TextArea readOnly value={elementData.sampleVideo ? JSON.stringify(elementData.sampleVideo) : ''} />
  //         )}
  //       </Item>
  //     )}
  //   </>
  // );
}
export default observer(TemplateMode);
