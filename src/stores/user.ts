import { action, observable, transaction } from 'mobx';
import { storage, crypto } from '@utils/index';


export const globalOptions = {
  headers: {
    'Content-Type': 'application/json;charset=utf-8',
    Accept: 'application/json',
    Authorization: crypto.encrypt(storage.local.get('token')) || '',
  },
};

/**
 * @desc 存放外部传入的props数据
 */
class User {
  @observable token: string = crypto.encrypt(storage.local.get('token')) || ''; // 外部传入的参数
  @observable info: any = null; // 外部传入的参数

  // 云合成视频轮训状态
  lunXunStatus: string[] = [];
  @observable lunXunStatusRes: Record<string, any> = {};
  lunXunStatusCahceItem: Record<string, any> = {};

  /**
   * 设置用户信息
   * @param {*} info
   * @param {*} token
   */
  @action
  setUserInfo(info: any) {
    this.info = info;
  }

  @action
  getUserInfo() {
    return this.info;
  }

  @action
  getToken() {
    return this.token;
  }

  @action
  setToken(token: string) {
    token = token;
    this.token = token;
    globalOptions.headers.Authorization = token;
    storage.local.set('token', crypto.decrypt(token));
  }

  @action
  updateUserInfo(values: { [x: string]: any }) {
    transaction(() => {
      for (let key in values) {
        this.info[key] = values[key];
      }
    });
  }

  @action
  logout = async () => {
    this.clearUserInfo();
    window.location.href = '/';
  };

  @action
  clearUserInfo = () => {
    transaction(() => {
      this.info = null;
      this.token = '';
    });
    storage.local.remove('token');
  };
}

const user = new User();

export { user, User };
