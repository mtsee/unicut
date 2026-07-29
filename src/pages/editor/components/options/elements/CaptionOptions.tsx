import { observer } from 'mobx-react';
import {
  Align,
  Opacity,
  Rotation,
  TextContent,
  Position,
  FontScale,
  Animation,
  TextStyle,
  TemplateMode,
  FrameData,
} from '../components';
import TextAnimation from '../components/animation/TextAnimation';
import type { BaseElement } from 'video-core-sdk';
import { Tabs, TabPane } from '@douyinfe/semi-ui';
import { language } from '@language/language';
import { stores } from '@stores/index';
import TTS from '../../sources/my/TTS';

export interface IProps {
  element: BaseElement;
}

function CaptionOptions(props: IProps) {
  const { editor } = stores;
  let active = editor.elementOptionType;
  if (props.element.type === 'caption') {
    active = 'caption';
  }

  return (
    <Tabs
      className="optionTabs"
      collapsible={true}
      arrowPosition={'end'}
      activeKey={editor.elementOptionType}
      onChange={e => {
        editor.elementOptionType = e as any;
      }}
    >
      <TabPane tab={language.val('option_tab_base')} itemKey="basic">
        <div className="scroll scrollBox">
          <Align />
          <Position />
          <FontScale />
          <TextContent />
          <TextStyle />
          <Opacity />
          <Rotation />
          <FrameData />
          <TemplateMode />
        </div>
      </TabPane>
      <TabPane tab={language.val('option_tab_ai_read')} itemKey="aiRead">
        <div className="scroll" style={{ height: '100%', overflow: 'hidden', position: 'relative' }}>
          <TTS
            ttsStyle={{ height: 'calc(100% - 40px)' }}
            style={{ height: 'calc(100% - 40px)', maxHeight: 'none' }}
            element={[props.element as any]}
            addItem={d => {
              console.log('d', d);
            }}
            onCancel={null}
          />
        </div>
      </TabPane>
      <TabPane tab={language.val('option_tab_text_animation')} itemKey="textAnimation">
        <TextAnimation />
      </TabPane>
      <TabPane tab={language.val('option_tab_animation')} itemKey="animation">
        <Animation />
      </TabPane>
    </Tabs>
  );
}

export default observer(CaptionOptions);
