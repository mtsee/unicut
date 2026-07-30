import styles from './more.module.less';
import WaterFull from '@components/water-full';
import { PayCodeOne, VipOne, ChartHistogramOne, StereoPerspective, SoccerOne, Audit, Search } from '@icon-park/react';
import { DanMuIcon } from './icon';
import { addItem } from '../addItem';
import { Toast } from '@douyinfe/semi-ui';
import { QrcodeElement } from '@pages/editor/plugins/qrcode/ElementData';
import { language } from '@language/language';
import { stores } from '@stores/index';

export default function More() {
  const { editor } = stores;

  const addPlus = d => {
    console.log('添加插件', d);
    switch (d.id) {
      case 'chart':
        Toast.warning(language.val('source_caption_ai_feature_not_supported'));
        // addItem({ type: 'echart' }, editor.currentTime, null);
        break;
      case 'model3D':
        Toast.warning(language.val('source_caption_ai_feature_not_supported'));
        // addItem({ type: 'model3D' }, editor.currentTime, null);
        break;
      case 'qrcode':
        // 添加二维码插件
        {
          const elementData = new QrcodeElement({
            size: 400,
            text: 'hello',
          });
          // 设置trackIndex
          console.log('elementData', elementData);
          elementData.trackIndex = editor.getAutoTrackIndex();
          editor.data.elements.push(elementData);
          editor.setSelectedElementIds([elementData.id]);
          editor.updateMovie();
          editor.updateTimeline();
        }
        break;
    }
  };

  const languageType = language.getLanguage();

  return (
    <div className={styles.moreList + ' scroll'}>
      <h1 className={styles.title}>{language.val('more_plus')}</h1>
      <WaterFull
        itemWidth={60}
        itemClassName={styles.waterfull}
        item={(d: any) => {
          return (
            <div
              onClick={() => {
                addPlus(d);
              }}
              className={styles.item}
            >
              <span>
                {d.icon}
                <p>
                  {d.vip && <VipOne theme="filled" size="14" fill="#FFA24D" />}
                  {languageType === 'zh-CN' ? d.name : d.ename}
                </p>
              </span>
            </div>
          );
        }}
        list={[
          {
            id: 'qrcode',
            name: '二维码',
            ename: 'qrcode',
            icon: <PayCodeOne theme="filled" size="25" fill="var(--theme-icon)" />,
          },
          // {
          //   id: 'magnifyingGlass',
          //   name: '放大镜',
          //   icon: <Search theme="filled" size="25" fill="var(--theme-icon)" />,
          // },
          // {
          //   id: 'chart',
          //   name: '动态图表',
          //   vip: true,
          //   icon: <ChartHistogramOne theme="filled" size="25" fill="var(--theme-icon)" />,
          // },
          // {
          //   id: 'model3D',
          //   name: '3D模型',
          //   vip: true,
          //   icon: <StereoPerspective theme="filled" size="25" fill="var(--theme-icon)" />,
          // },
          // {
          //   id: 'peopleKeletonMan',
          //   name: '人物',
          //   vip: true,
          //   icon: <SoccerOne theme="filled" size="25" fill="var(--theme-icon)" />,
          // },
          // {
          //   id: 'watermark',
          //   name: '水印',
          //   vip: true,
          //   icon: <Audit theme="filled" size="25" fill="var(--theme-icon)" />,
          // },
          // {
          //   id: 'barrage',
          //   name: '弹幕',
          //   vip: true,
          //   icon: <DanMuIcon theme="filled" size="25" fill="var(--theme-icon)" />,
          // },
        ].map(d => {
          return { ...d, width: 100, height: 100 };
        })}
      />
    </div>
  );
}
