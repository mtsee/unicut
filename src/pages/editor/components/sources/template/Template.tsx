import Source from '@pages/editor/common/source';
import styles from './template.module.less';
import $ from 'jquery';
import type { MovieData } from 'video-core-sdk';
import { util } from '@utils/index';
import { transaction } from 'mobx';
import { Modal } from '@douyinfe/semi-ui';
import { config } from '@config/index';
import { stores } from '@stores/index';

export default function Template() {
  const { editor } = stores;

  return (
    <Source
      type="template"
      item={(d: any) => {
        return <img src={editor.movie.reURL(d.thumb)} />;
      }}
      itemClassName={styles.imgItem}
      addItem={item => {
        Modal.confirm({
          title: '系统提示',
          content: '模版替换会覆盖当前视频内容，是否继续？',
          onOk: async () => {
            console.log(item);
            const json = await $.get(editor.movie.reURL(item.url + '?t=' + +new Date()));
            transaction(() => {
              editor.data = util.reJSON(json) as MovieData;
              editor.movieDataUpdateKey = util.randomID();
              // editor.editMode = 'template';
            });
          },
        });
      }}
    />
  );
}
