import styles from "./styles.module.less";
import { Pagination, Toast } from "@douyinfe/semi-ui";
import { server } from "./server";
import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import Item from "./Item";
import { user } from "@stores/user";
import { observer } from "mobx-react";
import { language } from "@language/language";

export interface IProps {
  match: any;
}
let timer = null;

function Product(props: IProps) {
  // const [playURL, setPlayURL] = useState('');
  const [, forceUpdate] = useReducer((x) => x + 1, 0);
  const [list, setList] = useState([]);
  const params = useRef({
    page: 1,
    page_size: 20,
    status: "",
    total: 0,
  });

  const getList = useCallback(() => {
    return server.getList({ ...params.current }).then((res) => {
      const [redata, err] = res;
      params.current.total = redata.total;
      setList(redata.data);
    });
  }, []);

  const getListAndLoop = () => {
    // 轮训合成进度
    const lunXunStatus = async () => {
      if (user.lunXunStatus.length) {
        const [res] = await server.seekStatus(user.lunXunStatus);
        res.forEach((re) => {
          if (![0, 1].includes(re.status)) {
            user.lunXunStatus = user.lunXunStatus.filter((d) => d !== re.id);
            // 修改状态
            user.lunXunStatusCahceItem[re.id].video = re.result.storageUrl;
            user.lunXunStatusCahceItem[re.id].status = re.status;
            delete user.lunXunStatusRes[re.id];
            delete user.lunXunStatusCahceItem[re.id];
          } else {
            // console.log("user.lunXunStatuslunXunStatus", re);
            user.lunXunStatusRes[re.id] = re;
            // forceUpdate();
          }
        });
      }
      timer = setTimeout(() => {
        lunXunStatus();
      }, 1000);
    };

    getList().then(() => {
      lunXunStatus();
    });
  };

  useEffect(() => {
    getListAndLoop();
    return () => {
      if (timer) {
        user.lunXunStatus = [];
        user.lunXunStatusRes = {};
        user.lunXunStatusCahceItem = {};
        clearTimeout(timer);
        timer = null;
      }
    };
  }, []);

  const deleteItem = useCallback((data: any) => {
    server.deleteTask([data.id]).then((res) => {
      if (!res[1]) {
        Toast.success("success");
        if (timer) {
          user.lunXunStatus = [];
          user.lunXunStatusRes = {};
          user.lunXunStatusCahceItem = {};
          clearTimeout(timer);
          timer = null;
        }
        getListAndLoop();
      }
    });
  }, []);

  return (
    <div className={styles.content}>
      <div className={styles.title}>
        <h1>{language.val("product_title")}</h1>
      </div>
      <div className={styles.contents}>
        {list.map((item) => {
          return (
            <Item
              key={item.id}
              data={item}
              update={() => forceUpdate()}
              deleteItem={deleteItem}
            />
          );
        })}
      </div>
      <div style={{ margin: 10 }}>
        <Pagination
          onChange={(p) => {
            params.current.page = p;
            getList();
          }}
          pageSize={params.current.page_size}
          total={params.current.total}
          style={{ marginBottom: 12 }}
        ></Pagination>
      </div>
    </div>
  );
}

export default observer(Product);
