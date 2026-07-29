import React, { useEffect } from "react";
import { renderRoutes } from "react-router-config";
import styles from "./agreementLayout.module.less";
import Sidebar from "./sidebar";
import Footer from "@components/footer";
import ColorBg from "../workspace-layout/ColorBg";
import Header from "@components/header";

function AgreementLayout({ route }) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <>
      <div className={styles.bg}></div>
      <div className={styles.agreementLayout}>
        <Header />
        <Sidebar />
        <div className={styles.content}>{renderRoutes(route.routes)}</div>
        <ColorBg style={{ top: 0, left: 200 }} />
      </div>
      <Footer />
    </>
  );
}

export default AgreementLayout;
