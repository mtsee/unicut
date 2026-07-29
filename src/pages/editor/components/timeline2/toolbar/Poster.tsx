import { Toast, Tooltip } from '@douyinfe/semi-ui';
import { Picture, Viewfinder } from '@icon-park/react';
import classNames from 'classnames';
import { observer } from 'mobx-react';
import React from 'react';
import styles from './tools.module.less';
import { stores } from '@stores/index';
import { language } from '@language/language';
import { util } from '@utils/index';

type Props = {};

const Poster = (props: Props) => {
  const { editor } = stores;

  return (
    <Tooltip content={language.val('header_project_poster')}>
      <a
        onClick={async () => {
          const base64 = await editor.movie.capture();

          let ires = null;
          if (base64) {
            // 缩放图片
            const resizedBase64 = (await util.resizeBase64Image(base64, 300)) as string;
            [ires] = await editor.apiServer.uploadBase64({
              content: resizedBase64,
              name: util.randomID() + '.png',
            });
          }
          editor.data.poster = ires.storage_path;
          editor.saveApp();
          Toast.success(language.val('common_toast_poster_success'));
        }}
        className={classNames(styles.button, styles.enable)}
      >
        <Picture theme="outline" size="18" fill="var(--theme-icon)" />
      </a>
    </Tooltip>
  );
};

export default observer(Poster);
