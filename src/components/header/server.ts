import BasicService from '@server/BasicService';
class Server extends BasicService {
  /**
   * @desc 创建视频
   */
  createVideo = async data => {
    return await this.post('/user/apps/create', data);
  };
}

export const server = new Server();
