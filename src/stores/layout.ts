import { theme } from '@theme';
import { action, observable, transaction } from 'mobx';
import { util, storage } from '../utils';
import { server as materialServer } from '@pages/workspace/material/server';
import { server as draftServer } from '@pages/workspace/draft/server';
import { config } from '@config/index';
import axios from 'axios';
import { Toast } from '@douyinfe/semi-ui';

export interface SelectItem {
  type: 'folder' | 'item';
  id: string;
}

class Layout {
  @observable layoutKeys: Record<string, string> = {};

  @observable themeUpdateKey: 'dark' | 'light' = theme.getTheme();
  @observable languageUpdateKey: number = 1;

  materialList: any[] = [];

  projectDetail: any = null;

  // 清空缓存
  @action
  clearCache = () => {
    transaction(() => {
      this.openSelectManage = false;
      this.projectDetail = null;
      this.movies = [];
      this.selects = [];
    });
  };

  // 视频数据
  movies: any[] = [];

  // 多选
  @observable selects: SelectItem[] = [];
  // 批量操作的开关
  @observable openSelectManage: boolean = false;

  @action
  getSelectItems = () => {
    const ids = this.selects.map(d => d.id);
    const selectItems = [];
    console.log('ids-materialList', util.toJS(this.selects), this.materialList);
    this.materialList.forEach(d => {
      if (ids.includes(d.id)) {
        selectItems.push(d);
      }
    });
    return selectItems;
  };

  // 取消
  @action
  cancelSelected = () => {
    transaction(() => {
      this.selects = [];
      this.openSelectManage = false;
    });
  };
  @action
  setSelected = (item: SelectItem, checked: boolean) => {
    transaction(() => {
      if (checked) {
        this.selects.push({ ...item });
      } else {
        this.selects = this.selects.filter(d => d.id !== item.id);
      }
      if (this.selects.length) {
        this.openSelectManage = true;
      }
      this.selects = [...this.selects];
    });
  };

  // 手动触发模块更新
  @action
  updateComponent = (...keyName: string[]) => {
    transaction(() => {
      for (let i = 0; i < keyName.length; i++) {
        this.layoutKeys[keyName[i]] = util.randomID();
      }
    });
  };

  @observable getDraftListLoading: boolean = false;

  @action
  initMoviesSelectsData = async (project_id: string) => {
    this.getDraftListLoading = true;
    const getMaterialList = async () => {
      const [res, err] = await materialServer.getMaterialList({ project_id, page_size: 999 });
      if (!err) {
        this.materialList = res.data.map(d => ({
          ...d,
        }));
      }
    };

    const getList = async () => {
      const [res, err] = await draftServer.getDraftList({ project_id, page_size: 999 });
      if (!err) {
        for (let d of res.data) {
          const jsonurl = util.reURL(d.url, config.resourcesHost);
          // 获取json数据
          const jsonres = await axios.get(jsonurl + '?t=' + util.randomID());
          d.data = jsonres.data;
        }
        this.movies = res.data.map(d => {
          return {
            ...d,
            script: d.script instanceof Array ? d.script : [],
          };
        });
      } else {
        Toast.error(err);
      }
    };

    await getMaterialList();
    if (!this.movies.length) {
      await getList();
      this.getDraftListLoading = false;
    }
  };
}

const layout = new Layout();

export { layout, Layout };
