import React, { useReducer } from 'react';
import { Tooltip } from '@douyinfe/semi-ui';
import { observer } from 'mobx-react';
import classNames from 'classnames';
import styles from './tools.module.less';
import { VolumeNotice, VolumeMute } from '@icon-park/react';
import type { VideoElement } from 'video-core-sdk';
import { language } from '@language/language';
import { stores } from '@stores/index';

export interface IProps {}

function ForbiddenAudio(props: IProps) {
  const { editor } = stores;
  editor.timelineToolsUpdateKey;
  const [, forceUpdate] = useReducer(x => x + 1, 0);

  let enable = false;

  if (editor.selectedElementIds.length > 1) {
    enable = false;
  }
  if (editor.selectedElementIds.length === 1) {
    const elementData = editor.getElementData();
    if (elementData && (elementData as any).type === 'video') {
      enable = true;
    }
  }
  const elementData = editor.getElementData() as VideoElement;

  if (!elementData) {
    return null;
  }

  return (
    <Tooltip content={language.val('timeline_top_forbidden_audio')}>
      <a
        onClick={() => {
          elementData.muted = !elementData.muted;
          forceUpdate();
          editor.updateMovie();
          editor.updateTimeline();
        }}
        className={classNames({
          [styles.enable]: enable,
        })}
      >
        {!elementData.muted ? (
          <VolumeNotice theme="outline" size="18" fill="var(--theme-icon)" />
        ) : (
          <VolumeMute theme="outline" size="18" fill="var(--theme-icon)" />
        )}
      </a>
    </Tooltip>
  );
}

export default observer(ForbiddenAudio);
