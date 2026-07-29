// @ts-nocheck
import BasicService from '@server/BasicService';
class Server extends BasicService {
  //获取用户详情
  getUserDetail = async () => {
    return this.get('/account/info');
  };
  //查询已绑定账号信息
  getUserBind = async () => {
    return this.get('/account/binds');
  };
  //更新用户信息
  getUpdateUser = async data => {
    return this.post('/account/update', data);
  };
  //
}
const server = new Server();
export default server;
