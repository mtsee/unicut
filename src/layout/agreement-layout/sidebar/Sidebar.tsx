import React from "react";
import { NavLink } from "react-router-dom";
import styles from "./sidebar.module.less";

const Sidebar = () => {
  const navList = [
    {
      name: "用户协议",
      path: "/user/agreement",
    },
    {
      name: "隐私政策",
      path: "/user/privacy",
    },
    {
      name: "会员服务协议",
      path: "/user/vipService",
    },
  ];

  return (
    <div className={styles.sidebar}>
      <div className={styles.navList}>
        {navList.map((item) => (
          <NavLink
            activeClassName={styles.active}
            to={item.path}
            key={item.name}
          >
            <div className={styles.navItem}>
              <span className={styles.text}>{item.name}</span>
            </div>
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
