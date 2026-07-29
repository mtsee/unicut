// 鼠标右键
import { observer } from 'mobx-react';
import React, { useEffect, useState } from 'react';
import { Menu, Item, Separator, Submenu, useContextMenu } from 'react-contexify';
import './ReactContexify.css';
import styles from './contextMenus.module.less';
import { ToTopOne, ToBottomOne, Up, Down, DeleteFive, Copy, Magic, Erase } from '@icon-park/react';
import { helper } from 'video-core-sdk';
import { pubsub } from '@utils/pubsub';
import { language } from '@language/language';
import { stores } from '@stores/index';

type Props = {};

const ContextMenus = (props: Props) => {
  const { editor } = stores;
  const MENU_ID = 'CanvasMenu';
  editor.contextMenuInstance = useContextMenu({
    id: MENU_ID,
  });
  editor.selectedElementIds;
  if (!editor.movie) return;
  let element = editor.getElementData();

  const handleItemClick: any = ({ id, event, props }) => {
    // console.log('>>>>>>>>>', [...editor.selectedElementIds]);
    switch (id) {
      case 'topOne': // 置顶
        {
          const elements = editor.getGroupElementData();
          // const minTrackIndex = Math.min(...elements.map(d => d.trackIndex));
          const eachIndex = 1 / (elements.length + 1);
          elements.forEach((element, index) => {
            element.trackIndex = index * eachIndex;
          });
          editor.updateMovie();
          editor.updateTimeline();
        }
        break;
      case 'bottomOne': // 置底
        {
          const elements = editor.getGroupElementData();
          const maxTrackIndex = Math.max(...editor.data.elements.map(d => d.trackIndex)) + 1;
          const eachIndex = 1 / (elements.length + 1);
          elements.forEach((element, index) => {
            element.trackIndex = maxTrackIndex + index * eachIndex;
          });
          editor.updateMovie();
          editor.updateTimeline();
        }
        break;
      case 'delete': // 删除
        {
          helper.deleteElementByIds([...editor.selectedElementIds], editor.data);
          editor.setSelectedElementIds([]);
          editor.updateMovie();
          editor.updateTimeline();
        }
        break;
      case 'copy':
        {
          pubsub.publish('keyboardCopy');
          setTimeout(() => {
            pubsub.publish('keyboardPaste');
          }, 0);
        }
        break;
      case 'up':
        {
          const element = editor.getElementData();
          element.trackIndex = element.trackIndex - 1 - 0.5;
          editor.updateMovie();
          editor.updateTimeline();
        }
        break;
      case 'down':
        {
          const element = editor.getElementData();
          element.trackIndex = element.trackIndex + 1 + 0.5;
          editor.updateMovie();
          editor.updateTimeline();
        }
        break;
    }
  };

  const iconcolor = '#333';

  return (
    <Menu className={styles.menu} style={{ zIndex: 11000 }} id={MENU_ID}>
      <Item className={styles.item} id="topOne" onClick={handleItemClick}>
        <ToTopOne theme="outline" size="20" fill={iconcolor} strokeWidth={3} />
        <span className={styles.name}>{language.val('cm_top_one')}</span>
      </Item>
      <Item className={styles.item} id="bottomOne" onClick={handleItemClick}>
        <ToBottomOne theme="outline" size="20" fill={iconcolor} strokeWidth={3} />
        <span className={styles.name}>{language.val('cm_bottom_one')}</span>
      </Item>
      {editor.selectedElementIds.length === 1 && (
        <>
          <Item className={styles.item} id="up" onClick={handleItemClick}>
            <Up theme="outline" size="20" fill={iconcolor} strokeWidth={3} />
            <span className={styles.name}>{language.val('cm_up')}</span>
          </Item>
          <Item className={styles.item} id="down" onClick={handleItemClick}>
            <Down theme="outline" size="20" fill={iconcolor} strokeWidth={3} />
            <span className={styles.name}>{language.val('cm_down')}</span>
          </Item>
        </>
      )}
      {/* <Item id="cut" onClick={handleItemClick}>
        打散
      </Item>
      <Item id="cut" onClick={handleItemClick}>
        合并
      </Item> */}
      <Item className={styles.item} id="copy" onClick={handleItemClick}>
        <Copy theme="outline" size="20" fill={iconcolor} strokeWidth={3} />
        <span className={styles.name}>{language.val('cm_copy')}</span>
      </Item>
      {/* <Item className={styles.item} id="paste" onClick={handleItemClick}>
        <Copy theme="filled" size="20" fill={iconcolor} strokeWidth={3} />
        <span className={styles.name}>{language.val('cm_paste')}</span>
      </Item> */}
      <Item className={styles.item} id="delete" onClick={handleItemClick}>
        <DeleteFive theme="outline" size="20" fill={iconcolor} strokeWidth={3} />
        <span className={styles.name}>{language.val('cm_delete')}</span>
      </Item>
      {/* {element && element.type === 'image' && (
        <>
          <Item
            className={styles.item}
            id="paste"
            onClick={() => {
              pubsub.publish('showAiMatting');
            }}
          >
            <Magic theme="filled" size="20" fill={iconcolor} strokeWidth={3} />
            <span className={styles.name}>{language.val('cm_ai_matting')}</span>
          </Item>
          <Item
            className={styles.item}
            id="paste"
            onClick={() => {
              pubsub.publish('showAiRubber');
            }}
          >
            <Erase theme="outline" size="20" fill={iconcolor} strokeWidth={3} />
            <span className={styles.name}>{language.val('cm_erase')}</span>
          </Item>
        </>
      )} */}
    </Menu>
  );
};

export default observer(ContextMenus);
