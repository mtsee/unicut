import { Button, Popover, Tooltip, Image } from '@douyinfe/semi-ui';
import { ScanCode } from '@icon-park/react';
import { language } from '@language/language';
import React from 'react';
import styles from './qrcodeUpload.module.less';
import { QRCodeCanvas } from 'qrcode.react';
import { observer } from 'mobx-react';
import { config } from '@config/index';
import { stores } from '@stores/index';

type Props = {
  refresh: () => void;
};

const QrcodeUpload = (props: Props) => {
  const { editor } = stores;
  const url =
    location.origin +
    `/${config.basename}/upload?token=${editor.token}&appid=${editor.appid}&language=${language.getLanguage()}`;
  return (
    <Popover
      content={
        <div className={styles.qrcodeUpload}>
          <QRCodeCanvas value={url} size={200} />
          <p>{language.val('source_upload_mobile')}</p>
          <p style={{ padding: 10 }}>
            <Button onClick={() => props.refresh()}>{language.val('my_upload_refresh')}</Button>
          </p>
        </div>
      }
    >
      <Button
        data-url={url}
        onClick={() => {
          // show mobile upload dialog
        }}
        icon={<ScanCode theme="outline" size="20" fill="var(--theme-icon)" />}
      ></Button>
    </Popover>
  );
};

export default observer(QrcodeUpload);
