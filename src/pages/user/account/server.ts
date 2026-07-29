// @ts-nocheck
import BasicService from '@server/BasicService';
class Server extends BasicService {
  //获取用户详情
  getUserDetail = () => {
    return this.get('/account/info');
  };
  //获取手机验证码
  getMobileCode = data => {
    return this.post('/account/sms/bind-mobile', data);
  };
  //获取图片验证码
  getImgCode = () => {
    return this.get('/account/captcha');
  };
  //绑定手机号
  getBindMobile = data => {
    return this.post('/account/bind-mobile', data);
  };
  //更新用户信息
  getUpdateUser = data => {
    return this.post('/account/update', data);
  };
  //获取邮箱验证码
  getEmailCode = data => {
    return this.post('/account/mail/bind-email', data);
  };
  //绑定邮箱
  getBindEmail = data => {
    return this.post('/account/bind-email', data);
  };

  //解除绑定
  getUnBind = data => {
    return this.post('/account/unbind', data);
  };
  //更新用户信息
  getUpdateUser = data => {
    return this.post('/account/update', data);
  };

  //查询已绑定账号信息
  getUserBind = () => {
    return this.get('/account/binds');
  };
  //获取绑定微信二维码
  getWeChatQrCode = () => {
    return this.get('/account/wechat/wqr');
  };
  //查询用户是否扫描二维码
  getHandleCode = sn => {
    return this.get(`/account/wechat/wset?sn=${sn}`);
  };
  //设置密码
  gerBindPassword = data => {
    return this.post('/account/change-password', data);
  };
}
const server = new Server();
export default server;
