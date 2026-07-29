import styles from './keyboardModal.module.less';
import { Modal, Toast } from '@douyinfe/semi-ui';
import { EnterTheKeyboard } from '@icon-park/react';
import { useState, useEffect } from 'react';
import { utils } from 'video-core-sdk';
import {
  Clipboard,
  HorizontalSpacingBetweenItems,
  Copy,
  Intersection,
  Delete,
  Return,
  ArrowCircleRight,
  ArrowCircleLeft,
  LinkFour,
  ZoomIn,
  ZoomOut,
  LinkCloudSucess,
  ArrowCircleUp,
  ArrowCircleDown,
} from '@icon-park/react';
import $ from 'jquery';
import { pubsub } from '@utils/pubsub';
import { language } from '@language/language';

export interface IProps {}

export default function KeyboardModal(props: IProps) {
  const [visible, setVisible] = useState(false);

  const items = [
    {
      name: language.val('shortcut_key_split'),
      win: 'Ctrl + B',
      mac: '⌘ + B',
      icon: <HorizontalSpacingBetweenItems theme="outline" size="20" fill="var(--theme-icon)" />,
    },
    {
      name: language.val('shortcut_key_copy'),
      win: 'Ctrl + C',
      mac: '⌘ + C',
      icon: <Copy theme="outline" size="20" fill="var(--theme-icon)" />,
    },
    {
      name: language.val('shortcut_key_cut'),
      win: 'Ctrl + X',
      mac: '⌘ + X',
      icon: <Clipboard theme="outline" size="20" fill="var(--theme-icon)" />,
    },
    {
      name: language.val('shortcut_key_paste'),
      win: 'Ctrl + V',
      mac: '⌘ + V',
      icon: <Intersection theme="outline" size="20" fill="var(--theme-icon)" />,
    },
    {
      name: language.val('shortcut_key_delete'),
      win: 'Delete/Backspace',
      mac: 'Delete/Backspace',
      icon: <Delete theme="outline" size="20" fill="var(--theme-icon)" />,
    },
    {
      name: language.val('shortcut_key_undo'),
      win: 'Ctrl + Z',
      mac: '⌘ + Z',
      icon: <Return theme="outline" size="20" fill="var(--theme-icon)" />,
    },
    {
      name: language.val('shortcut_key_redo'),
      win: 'Ctrl + Shift + Z',
      mac: '⌘ + Shift + Z',
      icon: <Return style={{ transform: `scaleX(-1)` }} theme="outline" size="20" fill="var(--theme-icon)" />,
    },
    {
      name: language.val('shortcut_key_play'),
      win: language.val('shortcut_key_space'),
      mac: language.val('shortcut_key_space'),
      icon: <LinkFour theme="outline" size="20" fill="var(--theme-icon)" />,
    },
    {
      name: language.val('shortcut_key_right'),
      win: '→',
      mac: '→',
      icon: <ArrowCircleRight theme="outline" size="20" fill="var(--theme-icon)" />,
    },
    {
      name: language.val('shortcut_key_left'),
      win: '←',
      mac: '←',
      icon: <ArrowCircleLeft theme="outline" size="20" fill="var(--theme-icon)" />,
    },
    {
      name: language.val('shortcut_key_up'),
      win: '↑',
      mac: '↑',
      icon: <ArrowCircleUp theme="outline" size="20" fill="var(--theme-icon)" />,
    },
    {
      name: language.val('shortcut_key_down'),
      win: '↓',
      mac: '↓',
      icon: <ArrowCircleDown theme="outline" size="20" fill="var(--theme-icon)" />,
    },
    {
      name: language.val('shortcut_key_timeline_zoomin'),
      win: 'Ctrl + +',
      mac: '⌘ + +',
      icon: <ZoomIn theme="outline" size="20" fill="var(--theme-icon)" />,
    },
    {
      name: language.val('shortcut_key_timeline_zoomout'),
      win: 'Ctrl + -',
      mac: '⌘ + -',
      icon: <ZoomOut theme="outline" size="20" fill="var(--theme-icon)" />,
    },
    {
      name: language.val('shortcut_key_save'),
      win: 'Ctrl + S',
      mac: '⌘ + S',
      icon: <LinkCloudSucess theme="outline" size="20" fill="var(--theme-icon)" />,
    },
  ];

  const isMac = /macintosh|mac os x/i.test(navigator.userAgent);
  const [left, right] = utils.splitArray(items);
  const type = isMac ? 'mac' : 'win';

  useEffect(() => {
    $(document).on('keydown.ievent.keyboard', (e: any) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target?.nodeName) || e.target.className.indexOf('EVENT_STOP') !== -1) {
        return;
      }

      // 快捷键
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const key = e.key.toLowerCase();
        switch (key) {
          case '-':
            pubsub.publish('keyboardScaleRuler', 'in');
            break;
          case '=':
            pubsub.publish('keyboardScaleRuler', 'out');
            break;
          case 'b': // 分割
            pubsub.publish('keyboardSplit');
            break;
          case 'c': // 复制
            pubsub.publish('keyboardCopy');
            break;
          case 'x': // 裁剪
            pubsub.publish('keyboardCut');
            break;
          case 'v': // 粘贴
            pubsub.publish('keyboardPaste');
            break;
          case 'z': // 撤销
            if (e.shiftKey) {
              // 恢复
              pubsub.publish('keyboardRedo');
            } else {
              pubsub.publish('keyboardUndo');
            }
            break;
          case 's':
            pubsub.publish('keyboardSaveApp', () => {
              Toast.success(language.val('common_save_success'));
            });
            break;
        }
      } else if (e.shiftKey) {
        switch (e.key.toLowerCase()) {
          case 'arrowleft':
            pubsub.publish('keyboardArrowLeft', 20);
            break;
          case 'arrowright':
            pubsub.publish('keyboardArrowRight', 20);
            break;
          case 'arrowup':
            pubsub.publish('keyboardArrowUp', 20);
            break;
          case 'arrowdown':
            pubsub.publish('keyboardArrowDown', 20);
            break;
        }
      } else {
        if (e.code.toLowerCase() === 'space') {
           e.preventDefault();
          pubsub.publish('keyboardPlayPasue');
          return;
        }
        switch (e.key.toLowerCase()) {
          case ' ':
            console.log('play');
            break;
          case 'delete':
          case 'del':
          case 'backspace':
            pubsub.publish('keyboardDelete');
            break;
          case 'arrowleft':
            pubsub.publish('keyboardArrowLeft', 1);
            break;
          case 'arrowright':
            pubsub.publish('keyboardArrowRight', 1);
            break;
          case 'arrowup':
            pubsub.publish('keyboardArrowUp', 1);
            break;
          case 'arrowdown':
            pubsub.publish('keyboardArrowDown', 1);
            break;
        }
      }
    });

    return () => {
      $(document).off('keydown.ievent.keyboard');
    };
  }, []);

  return (
    <>
      <Modal
        width={1000}
        title={language.val('shortcut_key')}
        visible={visible}
        onCancel={() => setVisible(false)}
        closeOnEsc={true}
        footer={null}
      >
        <div className={styles.boxs}>
          <div className={styles.box}>
            {left.map(d => {
              return (
                <section key={d.name}>
                  <span className={styles.name}>
                    {d.icon}
                    {d.name}
                  </span>
                  <span className={styles.tip}>{d[type]}</span>
                </section>
              );
            })}
          </div>
          <div className={styles.line}></div>
          <div className={styles.box}>
            {right.map(d => {
              return (
                <section key={d.name}>
                  <span className={styles.name}>
                    {d.icon}
                    {d.name}
                  </span>
                  <span className={styles.tip}>{d[type]}</span>
                </section>
              );
            })}
          </div>
        </div>
      </Modal>
      <a onClick={() => setVisible(true)} className={styles.keyboardbtn}>
        <EnterTheKeyboard theme="outline" size="20" fill="var(--theme-text)" />
      </a>
    </>
  );
}
