import React, { useCallback, useEffect } from 'react';
import styles from './tools.module.less';
import { LinkFour } from '@icon-park/react';
// import { Slider, Tooltip } from '@douyinfe/semi-ui';
import RedoUndo from './RedoUndo';
import Split from './Split';
import Delete from './Delete';
import CopyComp from './Copy';
import Separation from './Separation';
import CropSize from './CropSize';
import Background from './Background';
import ForbiddenAudio from './ForbiddenAudio';
import { observer } from 'mobx-react';
import SetScale from './SetScale';
// import Frame from './Frame';
import AiRubber from './ai-rubber/AiRubber';
import AddCamera from './AddCamera';
import Freeze from './Freeze';
import Poster from './Poster';
import ClipVideo from './clip/Clip';
import { stores } from '@stores/index';
import { language } from '@language/index';
import { Toast } from '@douyinfe/semi-ui';
import type { VideoElement } from 'video-core-sdk';
import { transaction } from 'mobx';
import { pubsub } from '@utils/pubsub';
import Frame from './Frame';
import AiSuperResolution from './ai-super-resolution';
import AiMatting from './ai-matting/AiMatting';
import AiRemoveBg from './ai-removebg/AiRemoveBg';
import FrameSync from './FrameSync';

type Props = {};

const Toolbar = (props: Props) => {
  const size = 18;
  const { editor } = stores;

  // 插入&更新帧
  const updateFrameItem = useCallback((animeId?: string) => {
    // 添加帧
    const elementData = editor.getElementData() as VideoElement;
    if (!elementData) {
      Toast.error(language.val('timeline_top_please_select_element'));
      return;
    }
    transaction(() => {
      if (animeId) {
        editor.frameSelectedId = animeId;
      }
      editor.updateTimeline();
      editor.updateMovie();
      editor.updateOption();
    });
  }, []);

  // 插入帧
  useEffect(() => {
    pubsub.subscribe('keyboardUpdateFrame', (_name, key) => {
      updateFrameItem();
    });

    return () => {
      pubsub.unsubscribe('keyboardUpdateFrame');
    };
  }, []);

  return (
    <div className={styles.toolbar}>
      <div className={styles.left}>
        <RedoUndo />
        <Poster />
        <Split />
        <AddCamera />
        {/* <section>Split-L</section>
        <section>Split-R</section> */}
        <Delete />
        <CopyComp />
        <Separation />
        <Freeze />
        <ClipVideo />
        <CropSize />
        <Background />
        <ForbiddenAudio />
        {/* <section>
          <Erase theme="outline" size={size} fill="var(--theme-icon)" />
        </section>
        <section>
          <Magic theme="outline" size={size} fill="var(--theme-icon)" />
        </section> */}
        <AiRubber />
        <AiRemoveBg />
        <AiMatting />
        <AiSuperResolution />
        <Frame />
        <FrameSync />
      </div>
      <div className={styles.right}>
        <section>
          <LinkFour theme="outline" size={size} fill="var(--theme-icon)" />
        </section>
        <SetScale />
      </div>
    </div>
  );
};

export default observer(Toolbar);
