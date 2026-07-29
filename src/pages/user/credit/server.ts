// @ts-nocheck
import BasicService from '@server/BasicService';

class Server extends BasicService {
  getUserCredits = params => {
    return this.get('/user/credits/page', { params });
  };

  getCreditLogs = params => {
    return this.get('/user/credit-logs/page', { params });
  };
}

const server = new Server();
export default server;
