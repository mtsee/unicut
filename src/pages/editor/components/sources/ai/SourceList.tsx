import { observer } from 'mobx-react';
import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import styles from './styles.module.less';
import { util } from '@utils/index';
import type { ImageElement } from 'video-core-sdk';
import { stores } from '@stores/index';

type Props = {
  action: string;
  limitType?: 'image' | 'video';
};

const SourceList = (props: Props, ref: any) => {
  const { editor } = stores;
  const [urls, setURLs] = useState([]);
  const imgSize = 80;

  useImperativeHandle(
    ref,
    () => ({
      getURLs: () => urls,
    }),
    [urls],
  );

  useEffect(() => {
    const selectURLs = () => {
      const elems = editor.getGroupElementData();
      const urls = [];
      switch (props.action) {
        case 'text-to-image':
        case 'text-to-video':
          break;
        case 'images-to-image':
        case 'image-to-video':
          {
            const imgs = elems.filter(d => d.type === 'image') as ImageElement[];
            imgs.forEach(item => {
              const resource = editor.movie.resourceManage.getResouceById(item.resourceId);
              urls.push(util.toJS(resource));
            });
          }
          break;
        case 'image-to-image':
        case 'first-to-video':
          {
            const first = elems.find(d => d.type === 'image') as ImageElement;
            if (first) {
              const resource = editor.movie.resourceManage.getResouceById(first.resourceId);
              urls.push(util.toJS(resource));
            }
          }
          break;
        case 'first-last-to-video':
          {
            const imgs = elems.filter(d => d.type === 'image') as ImageElement[];
            imgs.forEach(img => {
              const resource = editor.movie.resourceManage.getResouceById(img.resourceId);
              urls.push(util.toJS(resource));
            });
          }
          break;
      }
      setURLs(urls);
    };
    selectURLs();
  }, [editor.selectedElementIds, props.action]);

  const handleDragStart = (e, index) => {
    e.dataTransfer.setData('index', index);
  };

  const handleDrop = (e, targetIndex) => {
    const sourceIndex = Number(e.dataTransfer.getData('index'));
    const newItems = [...urls];
    const [moved] = newItems.splice(sourceIndex, 1);
    newItems.splice(targetIndex, 0, moved);
    setURLs(newItems);
  };

  return (
    <div className={styles.item}>
      {urls.length === 0 && (
        <div className={styles.imgbox + ' ' + styles.empty} style={{ width: imgSize, height: imgSize }}>
          请选择画布中图片
        </div>
      )}
      {[...urls].map((d, index) => {
        return (
          <div
            key={d.id}
            draggable
            onDragStart={e => handleDragStart(e, index)}
            onDrop={e => {
              e.preventDefault();
              handleDrop(e, index);
            }}
            onDragOver={e => e.preventDefault()}
            className={styles.imgbox}
            style={{ width: imgSize, height: imgSize, backgroundImage: `url(${editor.movie.reURL(d.thumb)})` }}
          >
            <div className={styles.extra}>{d.type}</div>
          </div>
        );
      })}
    </div>
  );
};

export default observer(forwardRef(SourceList));
