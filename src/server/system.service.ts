import BasicService from './BasicService';
import { user } from '@stores/user';
import type * as st from '@config/sdk.d';

class SystemService extends BasicService {
  constructor() {
    super();
    // 保存token
    if (user.token) {
      super._setRqHeaderToken(user.token);
    }
  }

  /**
   * 获取分类列表
   */
  getMaterialTypes = (type: string) => {
    const typeMap = {
      text: 311,
      image: 312,
      audio: 313,
      video: 314,
      sticker: 315,
      effect: 316,
      filter: 317,
      transition: 318,
    };
    return this.get(`/common/type-items/page`, {
      params: { type_id: typeMap[type] || '', page_size: 999 },
    }).then(res => {
      const [re, err] = res;
      return [re.data, err];
    });
  };

  /**
   * 搜索模版
   * @param params
   * @returns
   */
  getTemplates = (params: st.TemplateParams) => {
    return this.get('/templates/page', {
      params: {
        ...params,
      },
    }).then(arg => {
      const [res, err] = arg;
      res.data.forEach(d => {
        d.type = 'template';
      });
      return [res, err];
    });
  };
}

export const systemService = new SystemService();
