import * as sdk from 'video-core-sdk';
import '@less/initialize.less';
// import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { Provider } from 'mobx-react';
import { stores } from './stores';
import { BrowserRouter } from 'react-router-dom'; // 路由
import { routes } from './routes.config';
import { LocaleProvider } from '@douyinfe/semi-ui';
import { language } from '@language/language';
import zh_CN from '@douyinfe/semi-ui/lib/es/locale/source/zh_CN';
import en_US from '@douyinfe/semi-ui/lib/es/locale/source/en_US';

console.log('xxxxxxxxxxx',sdk);

const locale = {
  'zh-CN': zh_CN,
  'en-US': en_US,
}[language.getLanguage()];

ReactDOM.createRoot(document.getElementById('root')!).render(
  <LocaleProvider locale={locale}>
    <Provider {...stores}>
      <App Router={BrowserRouter} routes={routes} />
    </Provider>
  </LocaleProvider>,
);

export { routes };
