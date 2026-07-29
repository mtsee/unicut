import { pubsub } from '@utils/pubsub';
import React, { useEffect, useReducer } from 'react';
import { Return } from '@icon-park/react';
import { Tooltip, Toast } from '@douyinfe/semi-ui';
import classNames from 'classnames';
import styles from './tools.module.less';
import { language } from '@language/language';
import { stores } from '@stores/index';

type Props = {};

const RedoUndo = (props: Props) => {
  const { editor } = stores;
  const [, forceUpdate] = useReducer(x => x + 1, 0);

  const undo = () => {
    editor.movie.record.undo();
    forceUpdate();
    editor.recordUpdateTestKey = +new Date();
    editor.updateTimeline();
  };

  const redo = () => {
    editor.movie.record.redo();
    forceUpdate();
    editor.recordUpdateTestKey = +new Date();
    editor.updateTimeline();
  };

  useEffect(() => {
    pubsub.subscribe('keyboardUndo', undo);
    pubsub.subscribe('keyboardRedo', redo);

    return () => {
      pubsub.unsubscribe('keyboardUndo');
      pubsub.unsubscribe('keyboardRedo');
    };
  }, []);

  return (
    <>
      <Tooltip content={language.val('timeline_top_undo')}>
        <a
          onClick={undo}
          className={classNames({
            [styles.enable]: true,
          })}
        >
          <Return theme="outline" size="18" fill="var(--theme-icon)" />
        </a>
      </Tooltip>
      <Tooltip content={language.val('timeline_top_redo')}>
        <a
          onClick={redo}
          className={classNames({
            [styles.enable]: true,
          })}
        >
          <Return style={{ transform: `scaleX(-1)` }} theme="outline" size="18" fill="var(--theme-icon)" />
        </a>
      </Tooltip>
    </>
  );
};

export default RedoUndo;
