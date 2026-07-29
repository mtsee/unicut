import { Tooltip } from '@douyinfe/semi-ui';
import { observer } from 'mobx-react';
import React from 'react';
import styles from './tools.module.less';
import { FocusOne } from '@icon-park/react';
import classNames from 'classnames';
import { helper, utils } from 'video-core-sdk';
import type { CameraElement } from 'video-core-sdk';
import { util } from '@utils/index';
import { stores } from '@stores/index';

type Props = {};

const AddCamera = (props: Props) => {
  const { editor } = stores;
  const addCameraFun = () => {
    console.log('添加镜头');
    const { width, height } = editor.data;

    let startTime = 0;
    const lastCamera = editor.data.cameras.sort((a, b) => b.startTime - a.startTime)[0];
    if (lastCamera) {
      startTime = lastCamera.startTime + lastCamera.duration;
    }

    const element: CameraElement = {
      id: utils.createID(),
      type: 'camera',
      style: { x: width / 2, y: height / 2, width: width, height: height, rotation: 0, alpha: 1 },
      _dirty: utils.createID(),
      name: 'camera',
      duration: 3,
      startTime,
      trackIndex: -2,
    };
    if (!editor.data.cameras) {
      editor.data.cameras = [];
    }
    helper.addElement(element, 'camera', editor.data);
    editor.setContorlAndSelectedElemenent([element.id]);
    editor.updateMovie();
    editor.updateTimeline();
  };

  return (
    <Tooltip content={'添加镜头'}>
      <a
        onClick={addCameraFun}
        className={classNames({
          [styles.enable]: true,
        })}
      >
        <FocusOne theme="outline" size="18" fill="var(--theme-icon)" />
      </a>
    </Tooltip>
  );
};

export default observer(AddCamera);
