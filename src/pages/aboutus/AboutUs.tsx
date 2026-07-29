import styles from './styles.module.less';
// import { Link } from 'react-router-dom';
// import { Space } from '@douyinfe/semi-ui';
import { useEffect, useRef } from 'react';
import { observer } from 'mobx-react';
import { layout } from '@stores/layout';
import Links from './Links';
import SubHeader from '@components/header/Header';
import Footer from '@components/footer/Footer';
import { language } from '@language/language';

const win = window as any;

interface IProps {
  ssrRes?: any; // 服务器渲染加载的数据
  location: { pathname: string; search: string; hash: string; state: any };
  history: History;
  match: { path: string; url: string; isExact: boolean; params: any };
  staticContext: { path: string; url: string; isExact: boolean; params: any };
  route: { path: string; ssr: boolean; exact: boolean; component: JSX.Element };
}

function AboutUs(props: IProps) {
  const ref = useRef();

  return (
    <div className={styles.about}>
      <SubHeader title={language.val('about_us')} desc={language.val('common_company')} />
      <div className={styles.bg}></div>
      {language.getLanguage() === 'zh-CN' ? (
        <div className={styles.content}>
          <p>
            “四川爱趣五科技”是一家专注研发可视化内容生产工具的公司目前自主研发的产品包括： <br />
            <a>无界云剪</a>，<a>希尔桌面</a>，<a>H5DS编辑器</a>，<a>图片设计工具</a>，<a>720全景图工具</a>，
            <a>3D云展厅</a>
            <br />
            主要为客户提供私有化部署以及源码授权，降低开发成本，提升效率。
          </p>
          <p>
            咨询电话（董经理）:
            <a className={styles.phone} href="tel:13551301693">
              13551301693
            </a>
          </p>
          <p>地址：成都市高新区天府五街美年广场C-808</p>
        </div>
      ) : (
        <div className={styles.content}>
          <p>
            "Sichuan Aiqu Wu Technology" is a company focusing on the R&D of visual content production tools. Currently,
            its independently developed products include: <br />
            <a>Unbounded Cloud Editor</a>, <a>Hill Desktop</a>, <a>H5DS Editor</a>, <a>Image Design Tool</a>,{' '}
            <a>720° Panorama Tool</a>,<a>3D Cloud Exhibition Hall</a>
            <br />
            We mainly provide customers with private deployment and source code authorization to reduce development
            costs and improve efficiency.
          </p>
          <p>
            Consultation Email (Manager Dong):
            <a
              className={styles.phone}
              href="mailto:676015863@qq.comsubject=Product%20Inquiry&body=Hello,%20I%20would%20like%20to%20inquire%20about%20the%20relevant%20functions%20of%20Unbounded%20Cloud%20Editor..."
            >
              676015863@qq.com
            </a>
          </p>
          <p>Address: Room C-808, Meinian Plaza, Tianfu 5th Street, High-Tech Zone, Chengdu</p>
        </div>
      )}
      {/* <Links /> */}
      {/* <div ref={ref} className={styles.map}></div> */}
      <Footer />
    </div>
  );
}

export default observer(AboutUs);
