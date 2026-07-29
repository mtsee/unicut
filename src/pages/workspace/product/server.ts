import BasicService from '@server/BasicService';
class Server extends BasicService {
  //
  getList = (params: {
    page: number;
    page_size: number;
    status: string; // 状态(0-待处理 1-处理中 2-处理成功 3-处理失败)
  }) => {
    return this.get('/user/app/tasks/page', params);
  };

  deleteTask = (ids: string[]) => {
    return this.post(`/user/app/tasks/delete`, { id: ids });
  };

  createTask = (data: {
    source: 'user_app';
    source_id: string;
    params: {
      fps: number;
      resolution: string;
      jsonUrl: string;
      // storageUrl: '/videos/1/output.mp4';
      // callback: 'http://localhost:8000/api/callback';
    };
  }) => {
    return this.post(`/user/app/tasks/create`);
  };

  seekStatus = (ids: string[]) => {
    return this.post(`/user/app/tasks/status`, { ids });
  };
}
const server = new Server();
export { server };
