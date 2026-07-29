import React, { useEffect, useReducer, useState } from 'react';
import styles from './clipvideo.module.less';
import { Copy, Scissors } from '@icon-park/react';
import { Modal, Button, Tooltip } from '@douyinfe/semi-ui';
// import Cropper from 'react-easy-crop';
import ClipVideo from './ClipVideo';
import ClipFrame from './ClipFrame';
import { theme } from '@theme';
import { stores } from '@stores/index';
import classNames from 'classnames';
import { language } from '@language/language';
import type { Resource, VideoElement } from 'video-core-sdk';
import { observer } from 'mobx-react';

type Props = {};

const Clip = (props: Props) => {
  const [visible, setVisible] = useState(false);
  const editor = stores.editor;

  let enable = false;

  if (editor.selectedElementIds.length > 1) {
    enable = false;
  }
  if (editor.selectedElementIds.length === 1) {
    const elementData = editor.getElementData();
    if (elementData && elementData.type === 'video') {
      enable = true;
    }
  }

  return (
    <>
      <Tooltip content={language.val('timeline_top_clip_time')}>
        <a
          className={classNames({
            [styles.enable]: enable,
          })}
          onClick={() => {
            if (!enable) {
              return;
            }
            setVisible(true);
            editor.pause();
          }}
        >
          <Scissors theme="outline" size="18" fill="var(--theme-icon)" />
        </a>
      </Tooltip>
      <ClipModal key={~~visible} visible={visible} setVisible={setVisible} />
    </>
  );
};

interface ClipProps {
  visible: boolean;
  setVisible: (visible: boolean) => void;
}

function ClipModal(props: ClipProps) {
  const [, forceUpdate] = useReducer(x => x + 1, 0);
  const { visible, setVisible } = props;
  const [resource, setResource] = useState<Resource>(null);
  const [video, setVideo] = useState<VideoElement>(null);
  const editor = stores.editor;
  useEffect(() => {
    if (!visible) {
      return;
    }
    // 或者视频资源
    const getVideoResource = () => {
      const elementData = editor.getElementData() as VideoElement;
      const resource = editor.movie.resourceManage.getResouceById(elementData.resourceId);
      return resource;
    };

    const resource = getVideoResource();
    if (resource) {
      setResource(resource);
    }
    const elementData = editor.getElementData() as VideoElement;
    setVideo(elementData);
  }, [visible]);


  return (
    <Modal
      visible={visible}
      onCancel={() => {
        setVisible(false);
      }}
      width={1000}
      footer={null}
      onClose={() => {
        setVisible(false);
      }}
    >
      {visible && (
        <div className={styles.clip}>
          <h1>视频裁剪</h1>
          <div className={styles.view}>
            {resource && (
              <ClipVideo
                poster={editor.movie.reURL(resource.thumb)}
                src={editor.movie.reURL(resource.url)}
                clipTime={video.clipTime}
                duration={video.duration}
              />
            )}
          </div>
          <div className={styles.frames}>
            {resource ? (
              <ClipFrame
                callback={t => {
                  video.clipTime = Math.abs(t);
                  forceUpdate();
                }}
                duration={resource.duration}
                clipStart={video.clipTime}
                clipTime={video.duration}
                aspectRatio={
                  resource.attrs.videoWidth / resource.attrs.videoHeight ||
                  resource.attrs.width / resource.attrs.height
                }
                thumb={editor.movie.reURL(resource.thumb)}
                frameImage={editor.movie.reURL(resource.attrs.frames)}
              />
            ) : null}
          </div>
          <div className={styles.footer}>
            <Button
              color="primary"
              onClick={() => {
                setTimeout(() => {
                  editor.updateMovie();
                  editor.updateTimeline();
                  setVisible(false); 
                }, 500);
              }}
              className={styles.export}
            >
              确认裁剪
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}

export default observer(Clip);
