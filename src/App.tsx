import './theme/theme.less';
import React, { useEffect, useRef } from 'react';
import { userService } from '@server/index';
import { util } from '@utils/index';
import { config } from '@config/index';
import { renderRoutes } from 'react-router-config';
import { user } from '@stores/user';

interface AppProps {
  Router: any;
  routes: any;
  location?: any;
  context?: any;
}

function App(props: AppProps) {
  const { Router, routes, ...otherProps } = props;
  const routerRef = useRef<any>(null);

  // URL token 自动登录
  useEffect(() => {
    let token: any = util.getUrlQuery('token');
    if (token) {
      window.history.pushState(null, '', util.delUrlParam('token'));
      token = decodeURI(token);
      user.setToken(token);
    }
    if (token) {
      userService._setRqHeaderToken(token);
      userService.getUserDetail();
    }
    (window as any).RouterHistory = routerRef.current?.history;
  }, []);

  return (
    <Router ref={routerRef} basename={config.basename} {...otherProps}>
      {renderRoutes(routes)}
    </Router>
  );
}

export default App;
