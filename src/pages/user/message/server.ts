// @ts-nocheck
import BasicService from '@server/BasicService';
class Server extends BasicService {
  //获取消息列表
  getMessage = params => {
    return this.get(`/user/messages/page`, { params });
  };
  //获取详情
  getMessageDetail = id => {
    return this.get(`/user/messages/info?id=${id}`);
  };
  //设置全部已读
  getAllRead = () => {
    return this.post(`/user/messages/read-all`);
  };
}
const server = new Server();
export default server;
