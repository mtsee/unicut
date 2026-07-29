import React from 'react';
import { plugin, options, observer } from '@pages/editor/SDK';
import { Tabs, TabPane } from '@douyinfe/semi-ui';
import QrcodeSet from './QrcodeSet';
import { language } from '@language/language';

export interface IOptionsProps {
  editor: Record<string, any>;
}

function Options(props: IOptionsProps) {
  const { Align, Opacity, Rotation, Size, Position, Colour, Animation } = options;
  const { editor } = props;
  return (
    <Tabs
      className="optionTabs"
      activeKey={editor.elementOptionType}
      onChange={e => {
        editor.elementOptionType = e as any;
      }}
    >
      <TabPane tab={language.val('option_tab_base')} itemKey="basic">
        <div className="scroll scrollBox">
          <Align />
          <Position />
          <Size />
          <QrcodeSet {...props} />
          <Opacity />
          <Rotation />
        </div>
      </TabPane>
      <TabPane tab={language.val('option_tab_animation')} itemKey="animation">
        <Animation />
      </TabPane>
      <TabPane tab={language.val('option_tab_filter')} itemKey="colour">
        <Colour />
      </TabPane>
    </Tabs>
  );
}

export default observer(Options);
