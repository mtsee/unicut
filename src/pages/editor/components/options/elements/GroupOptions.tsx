import styles from './styles.module.less';
import type { BaseElement } from 'video-core-sdk';
import { Tabs, TabPane } from '@douyinfe/semi-ui';
import { GroupAlign, GroupFast, Opacity, Rotation, Position, Size } from '../components';
import { observer } from 'mobx-react';
import { language } from '@language/language';
import { stores } from '@stores/index';
import TTS from '../../sources/my/TTS';

export interface IProps {}

function GroupOptions(props: IProps) {
  const { editor } = stores;

  // 如果全部是字幕，就不显示字幕选项
  const elements = editor.getGroupElementData();
  const isAllSubtitle = elements.every(item => item.type === 'caption');

  console.log('isAllSubtitle', isAllSubtitle);

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
      <TabPane tab={language.val('option_tab_group')} itemKey="basic">
        <GroupAlign />
        <GroupFast />
        {/* <Position />
        <Size />
        <Opacity />
        <Rotation /> */}
      </TabPane>
      {isAllSubtitle && (
        <TabPane tab={language.val('option_tab_ai_read')} itemKey="aiRead">
          <div className="scroll" style={{ height: '100%', overflow: 'hidden', position: 'relative' }}>
            <TTS
              ttsStyle={{ height: 'calc(100% - 40px)' }}
              style={{ height: 'calc(100% - 40px)', maxHeight: 'none' }}
              element={elements as any[]}
              addItem={d => {
                console.log('d', d);
              }}
              onCancel={null}
            />
          </div>
        </TabPane>
      )}
    </Tabs>
  );
}

export default observer(GroupOptions);
