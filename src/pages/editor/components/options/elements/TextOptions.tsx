import { observer } from 'mobx-react';
import {
  Align,
  Opacity,
  Rotation,
  TextContent,
  TextStyle,
  Position,
  Animation,
  FontScale,
  // Audio,
  // Speed,
  // Colour,
  TemplateMode,
  TemplateDown,
  FrameData,
} from '../components';
import type { BaseElement } from 'video-core-sdk';
import { Tabs, TabPane } from '@douyinfe/semi-ui';
import TextAnimation from '../components/animation/TextAnimation';
import { language } from '@language/language';
import { stores } from '@stores/index';
import TTS from '../../sources/my/TTS';

export interface IProps {
  element: BaseElement;
}

function TextOptions(props: IProps) {
  const { editor } = stores;
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
          <TemplateDown />
        </div>
      </TabPane>
      <TabPane tab={language.val('option_tab_ai_read')} itemKey="aiRead">
        <TTS
          addItem={d => {
            console.log('d', d);
          }}
          ttsStyle={{ height: 'calc(100% - 40px)' }}
          style={{ height: 'calc(100% - 40px)', maxHeight: 'none' }}
          element={[props.element as any]}
          onCancel={null}
        />
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

export default observer(TextOptions);
