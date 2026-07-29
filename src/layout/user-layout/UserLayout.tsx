import React, { useEffect } from "react";
import { renderRoutes } from "react-router-config";
import { checkAuth } from "@utils/checkAuth";
import { userService } from "@server/index";
import PageLoading from "../../components/page-loading";
import { inject, observer } from "mobx-react";
import { Spin } from "@douyinfe/semi-ui";
import Header from "@components/header";
import styles from "./userLayout.module.less";
import Sidebar from "./sidebar";
import ColorBg from "../workspace-layout/ColorBg";
import { user } from "@stores/user";
import Footer from "@components/footer";
import FolderGuard from "@components/folder-guard/FolderGuard";

function UserLayout({ route }) {
  useEffect(() => {
    if (checkAuth() && !user.info) {
      userService.getUserDetail();
    }
  }, []);

  if (checkAuth() && !user.info) {
    return <Spin />;
  }

  return (
    <FolderGuard>
      <PageLoading />
      <div className={styles.bg}></div>
      <div className={styles.userLayout}>
        <Header />
        <Sidebar />
        <div className={styles.content}>{renderRoutes(route.routes)}</div>
        <ColorBg style={{ top: 0, left: 200 }} />
      </div>
      <Footer />
    </FolderGuard>
  );
}
export default observer(UserLayout);
