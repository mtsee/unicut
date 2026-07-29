import BasicService from './BasicService';
import { user } from '@stores/user';
import { util } from '@utils/index';

const _window = window as any;

/**
 * @desc 测试用
 */
class UserService extends BasicService {
  constructor() {
    super();
    // 保存token
    if (user.token) {
      super._setRqHeaderToken(user.token);
    }
  }

  // 获取登录的二维码
  getWxQrcode = async () => {
    return await this.get(`/account/login/wqr`);
  };

  // 查询用户是否通过二维码关注
  seekWxLogin = async (sn: string) => {
    return await this.get(`/account/login/wset?sn=${sn}`);
  };

  // 获取注册手机验证码
  getRegisterSMS = async (data: any) => {
    return await this.post(`/account/sms/register`, data);
  };

  // 获取登录手机验证码
  getLoginSMS = async (data: any) => {
    return await this.post(`/account/sms/login`, data);
  };

  // 验证码
  getCaptcha = async () => {
    return await this.get(`/account/captcha`);
  };

  // 绑定微信-获取二维码
  getBindWeixinCode = async () => {
    return this.get('/account/bind-weixin/wqr');
  };

  // 微信绑定-结果轮训
  bindWeixinSeek = async (sn: string) => {
    return this.get('/account/bind-weixin/wset?sn=' + sn);
  };

  openaiImageDesc = (params: any) => {
    return this.post(`/common/openai/completion`, {
      model: 'doubao-seed-1-6-flash-250828',
      // max_completion_tokens: 65535,
      // reasoning_effort: "medium",
      messages: params,
    });
  };

  openai = async (params: any, model?: string) => {
    return this.post(`/common/openai/completion`, {
      model: model || 'doubao-seed-1-6-flash-250828',
      max_completion_tokens: 65535,
      reasoning_effort: 'medium',
      thinking: {
        type: 'disabled',
      },
      messages: params,
    });
  };

  // 发送邮箱验证码
  sendEmailCode = async (data: any) => {
    return await this.post(`/account/mail/register`, data);
  };

  // 邮箱登录发送验证码
  sendEmailCodeLogin = async (data: any) => {
    return await this.post(`/account/mail/login`, data);
  };

  // 绑定邮箱
  bindEmail = async (data: any) => {
    return await this.post(`/account/mail/bind-email`, data);
  };

  // 绑定手机号 phoneNumber, code
  bindPhone = async (data: { phoneNumber: string; code: string }) => {
    return await this.post(`/account/bind-mobile`, data);
  };

  // 绑定手机号，发送验证码 mobile  captchaCode
  getCodeBindMobile = async (data: { mobile: string; captchaCode: string }) => {
    return await this.post(`/account/sms/bind-mobile`, data);
  };

  // 找回密码发送手机验证码 mobile captchaCode
  getCodeResetPassword = async (data: { mobile: string; captchaCode: string; captchaKey: string }) => {
    return await this.post(`/account/sms/recover-password`, data);
  };

  /**
   * 注册
   * @param {*} registerInfo
   */
  register = async (registerInfo: { username: string; password: string; captchaCode: string }) => {
    return await this.post(`/account/register`, registerInfo);
  };

  // 获取app统计数据
  getStatistics = async () => {
    return await this.get(`/open/app-statistics`);
  };

  // 登录
  login = async (params: any) => {
    const [res, err] = await this.post(`/account/login`, params);
    if (res) {
      this._setRqHeaderToken(res.token);
    } else {
      console.log(err);
    }
    return [res, err];
  };

  // 登录
  loginFvideo = async (params: any) => {
    const [res, err] = await this.post(`https://fvideo.h5ds.com/account/login`, params);
    if (res) {
      this._setRqHeaderToken(res.token);
    } else {
      console.log(err);
    }
    return [res, err];
  };

  // 获取签到数据
  userSign = async () => {
    let stDate = util.formatDate(+new Date(), 'YYYY-MM-DD');
    return await this.get('/api/user-sign?stDate=' + stDate);
  };

  // 签到
  doUserSign = async () => {
    return await this.post('/api/user-sign');
  };

  // 授权QQ登录
  oauthLogin = async (code: string) => {
    const [res] = await this.get('/account/login/provider/qq/user', {
      params: { code },
    });
    if (res) {
      this._setRqHeaderToken(res.token);
      user.setToken(res.token);
      user.setUserInfo(res.user);
      return res;
    } else {
      return false;
    }
  };

  // 退出
  logout = async () => {
    const res = await this.get(`/account/logout`);
    user.clearUserInfo();
    _window.RouterHistory.push('/');
    return res;
  };

  /**
   * 更新用户信息，如果userInfo包含 avatarUrl,则修改头像，否则修改 nickName、email、telphone
   * @param {*} userInfo
   */
  updateUserInfo = async (userInfo: any) => {
    return await this.post('/account/update', userInfo);
  };

  /**
   * 修改密码
   */
  changePassword = async (data: { username: string; password: string; captchaCode: string }) => {
    return await this.post('/account/change-password', data);
  };

  /**
   * 找回密码
   * @param {*} data
   */
  findPassword = async (data: { mobile: string; password: string; code: string }) => {
    return await this.post('/account/recover-password', data);
  };

  /**
   * 获取用户信息
   */
  getUserDetail = async () => {
    const [res, err] = await this.get('/account/info');
    if (err) {
      console.error('登录失效');
      // 退出登录
      user.logout();
      return [res, err];
    }
    console.log('resresres', res);
    user.setUserInfo(res);
    return [res, err];
  };

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  /**
   * 获取未读消息
   * @returns
   */
  getUnreadMessages = async () => await this.post(`/user/messages/count`);

  /**
   * 获取分类列表
   * @param {string} workbench.schema
   * @param {object} params
   * @returns
   */
  getCategoryList = async params => await this.get('/user/categories/page', { params });
  /**
   *添加标签
   * @param {string} workbench.schema
   * @param {object} params
   * @returns
   */
  saveCategory = async params => await this.post('/user/categories/create', params);
  /**
   *删除标签
   * @param {string} workbench.schema
   * @param {object} params
   * @returns
   */
  deleteCategory = async id => await this.post('/user/categories/delete', { id });
  /**
   *更新标签
   * @param {string} workbench.schema
   * @param {object} params
   * @param {string} id
   * @returns
   */
  updateCategory = async params => await this.post('/user/categories/update', params);
  /**
   * base64 上传
   */
  uploadBase64 = async data => {
    // base64Data = base64Data.split(',')[1];
    return await this.post(`/common/upload/base64`, data);
  };

  // tts
  createTTS = (params: CreateTTSParams) => {
    return this.post('/common/tts/huoshan', params);
  };

  // json上传
  uploadJSON = async data => {
    return await this.post(`/common/upload/content`, {
      content: data,
      prefix_path: '/uploads',
      disk: 'oss',
    });
  };
}

export interface CreateTTSParams {
  text: string; // 内容
  config: {
    voice_type: string; // 音色
    loudness_ratio: number; // 音量 //音量，[0.5~2]，默认为 1，通常保留一位小数即可
    speed_ratio: number; // 语速 //语速，[0.8~2]，默认为 1，通常保留一位小数即可
  };
  options: Record<string, any>;
}

export const userService = new UserService();
