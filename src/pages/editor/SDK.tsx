import EditorPage from './Editor';
import type { APIServer, VideoEditorSDKParams } from '@config/sdk.d';
import ReactDOM from 'react-dom/client';
import { Provider } from 'mobx-react';
// import { stores } from '../../stores';
import { Editor } from '@stores/editor';
import { exportMovie } from '@utils/export';

import { observer } from 'mobx-react';
import * as options from '@pages/editor/components/options/components';
import { stores } from '@stores/index';
import { User } from '@stores/user';
import {
  plugin,
  ResourceItem,
  helper,
  utils,
  initData,
  getInitData,
  Movie,
  MovieEncoding,
  loadFFmpeg,
  VideoCoreSDK
} from 'video-core-sdk';

class VideoEditorSDK {
  private _params: VideoEditorSDKParams = null;
  constructor(params: VideoEditorSDKParams) {
    this._params = Object.assign(
      {
        target: document.body,
        appid: '',
        token: '',
        userInfo: null,
        workerPath: '',
        loginButtonConfig: null,
        exportButtonConfig: null,
      },
      params,
    );
  }

  public editor: Editor = null;

  /**
   * 初始化
   * @returns
   */
  public init(): Promise<null> {
    return new Promise(resolve => {
      const { target, ...other } = this._params;
      const editor = new Editor();
      const user = new User();
      this.editor = editor;
      stores.editor = editor;
      stores.user = user;

      ReactDOM.createRoot(target!).render(
        <Provider editor={editor} user={user}>
          <EditorPage
            {...other}
            callback={() => {
              resolve(null);
            }}
          />
        </Provider>,
      );
    });
  }

  /**
   * 销毁
   */
  public destroy() {
    const { target, ...other } = this._params;
    this.editor.destroy();
    ReactDOM.createRoot(target!).unmount();
  }
}

export {
  exportMovie,
  VideoEditorSDK,
  options,
  plugin,
  observer,
  // core中的类型
  VideoCoreSDK,
  ResourceItem,
  helper,
  utils,
  initData,
  getInitData,
  Movie,
  MovieEncoding,
  loadFFmpeg,
};
