import { theme } from '@theme';
import styles from './footer.module.less';
import { Intl } from '@language/index';

export interface IProps {}

export default function Footer(props: IProps) {
  return (
    <div className={styles.footer}>
      <div className={styles.divider}></div>
      <div className={styles.footerInner}>
        <section className={styles.item}>
          <span className={styles.logo}></span>
          <span className={styles.info}>
            <Intl name="common_about_us_info" />
          </span>
        </section>
        <section className={styles.item}>
          <h3><Intl name="common_navigation" /></h3>
          <ul className={styles.links}>
            <li>
              <a href="#">{<Intl name="common_home" />}</a>
            </li>
            <li>
              <a href="/article/about">{<Intl name="common_about_us" />}</a>
            </li>
            {/* <li>
              <a href="#">VIP特权</a>
            </li> */}
          </ul>
        </section>
        <section className={styles.item}>
          <h3><Intl name="common_support" /></h3>
          <ul className={styles.links}>
            <li>
              <a href="#">{<Intl name="common_help_center" />}</a>
            </li>
            <li>
              <a href="#">{<Intl name="common_privacy_policy" />}</a>
            </li>
            <li>
              <a href="#">{<Intl name="common_service_agreement" />}</a>
            </li>
            <li>
              <a href="#">{<Intl name="common_disclaimer" />}</a>
            </li>
          </ul>
        </section>
        <section className={styles.item}>
          <h3><Intl name="common_contact_us" /></h3>
          <div className={styles.contact}>
            <p>
              <Intl name="common_private_deployment_saas_consultation" />
              <br />
              <Intl name="common_phone" />: 13551301693
            </p>
            <span className={styles.span}>
              <img src="/assets/images/qrcode.png" alt="" />
            </span>
            {/* <span className={styles.span}>
              <i>董经理</i>
              <em>13551301693</em>
            </span> */}
          </div>
        </section>
      </div>
      <div className={styles.footerBottom}>
        <span className={styles.copyRight}>
          <Intl name="common_copyright" />
        </span>
        {/* <span className={styles.cookie}>
          开启cookie提供更好的服务 <a>接受</a>
        </span> */}
      </div>
    </div>
  );
}
