import BasicService from '@server/BasicService';
class Server extends BasicService {

  // base64 上传
  uploadBase64 = async data => {
    return await this.post(`/common/upload/base64`, data);
  };

  //更新账户信息
  accountUpdate = async data => {
    return this.post('/account/update', data);
  };
}
const server = new Server();

export default server;
