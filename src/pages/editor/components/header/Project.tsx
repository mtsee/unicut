import React, { useState } from 'react';
import { Button, Modal, Toast, Upload } from '@douyinfe/semi-ui';
import styles from './project.module.less';
import { helper } from 'video-core-sdk';
import { util } from '@utils/index';
import dayjs from 'dayjs';
import { Intl, language } from '@language/index';
import { stores } from '@stores/index';

type Props = {};

const Project = (props: Props) => {
  const { editor } = stores;
  const [visible, setVisible] = useState(false);
  return (
    <>
      <Button
        onClick={() => {
          setVisible(true);
        }}
      >
        <Intl name="header_project_file" />
      </Button>
      <Modal
        visible={visible}
        onCancel={() => {
          setVisible(false);
        }}
        footer={null}
      >
        <div className={styles.uploadProject}>
          <h1>
            <Intl name="header_project_title" />
          </h1>
          <div className={styles.item}>
            <Upload
              draggable={true}
              customRequest={() => {}}
              action=''
              showUploadList={false}
              dragMainText={language.val('header_project_upload_tip1')}
              dragSubText={language.val('header_project_upload_tip2')}
              onChange={e => {
                Modal.confirm({
                  title: language.val('header_project_confirm_title'),
                  content: language.val('header_project_confirm_content'),
                  onOk: async () => {
                    const ndata = (await util.fileToJson(e.currentFile.fileInstance)) as any;
                    if (util.checkNdata(ndata)) {
                      // 校验合法性
                      await editor.apiServer.updateApp({
                        id: editor.appid,
                        name: ndata.title,
                        data: ndata,
                        width: ndata.width,
                        height: ndata.height,
                        duration: helper.getTotalTime(ndata),
                      });
                      location.reload();
                    } else {
                      Toast.error(language.val('header_project_toast'));
                    }
                  },
                });
              }}
            ></Upload>
          </div>
          <div className={styles.item}>
            <Button
              onClick={() => {
                const ndata = editor.movie.sortZIndexNewData();
                // 去掉重复的resource
                editor.movie.clearUnUsedResource(ndata);
                console.log('ndata===>', ndata);
                util.downloadJson(ndata, `${ndata.title}_${dayjs().format('YYYYMMDDHHmmss')}`);
              }}
              block
              type="primary"
            >
              <Intl name="header_project_export"/>
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default Project;
