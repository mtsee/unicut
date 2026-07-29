import React, { useEffect, useReducer } from 'react';
import styles from './decoding.module.less';
import { language } from '@language/language';
import { stores } from '@stores/index';

type Props = {
  item: any;
  callback: any;
};

const Decoding = (props: Props) => {
  const { editor } = stores;
  const [, forceUpdate] = useReducer(x => x + 1, 0);

  useEffect(() => {
    let timer = null;
    // 转码任务状态(-1-不处理 0-待处理1-处理中 2-处理成功3-处理失败)
    if ([0, 1].includes(props.item.convert_status)) {
      // 轮训状态
      const loop = () => {
        editor.apiServer.seekVideoReplayStatus([props.item.id]).then(([res, err]) => {
          if (!err) {
            const rdata = res.find(d => d.source_id === props.item.id);
            if ([0, 1].includes(rdata?.status)) {
              timer = setTimeout(() => {
                loop();
              }, 2000);
            } else {
              if (rdata) {
                props.item.convert_status = rdata.status;
                if (rdata.material) {
                  props.item.urls = { ...rdata.material.urls };
                }
                props.callback({
                  convert_status: rdata.status,
                  urls: { ...props.item.urls },
                });
              }
              forceUpdate();
            }
          }
        });
      };
      loop();
    }
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [props.item.convert_status]);

  if (props.item.convert_status === 2 || props.item.convert_status === -1 || props.item.convert_status === undefined) {
    return null;
  }
  if (props.item.convert_status === 3) {
    return (
      <div className={styles.decoding} style={{ color: 'red' }}>
        {language.val('source_encode_failed')}
      </div>
    );
  }
  return <div className={styles.decoding}>{language.val('source_encoding')}</div>;
};

export default Decoding;
