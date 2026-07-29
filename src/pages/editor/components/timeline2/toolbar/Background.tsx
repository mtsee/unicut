import React from 'react';
import { Tooltip } from '@douyinfe/semi-ui';
import classNames from 'classnames';
import { BackgroundColor } from '@icon-park/react';
import styles from './tools.module.less';
import { language } from '@language/language';
import { stores } from '@stores/index';

type Props = {};

const Background = (props: Props) => {
  const { editor } = stores;
  return (
    <Tooltip content={language.val('timeline_top_background_color')}>
      <a
        onClick={() => {
          editor.optionPanelCustom = 'background';
        }}
        className={classNames({
          [styles.enable]: true,
        })}
      >
        <BackgroundColor theme="outline" size="18" fill="var(--theme-icon)" />
      </a>
    </Tooltip>
  );
};

export default Background;
