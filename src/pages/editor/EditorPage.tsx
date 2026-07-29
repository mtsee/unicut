import { Provider } from 'mobx-react';
import React from 'react';
import { Editor } from '@stores/editor';
import { stores, user } from '@stores/index';
import EditorComp from './Editor';
import { isFSApiSupported } from '@services/localStorageService';

const EditorPage = (props: any) => {
  // 文件夹初始化已移至 App.tsx，此处直接使用
  stores.editor = new Editor();

  return (
    <Provider editor={stores.editor} user={user}>
      <EditorComp {...props} useLocalStorage={isFSApiSupported()} />
    </Provider>
  );
};

export default EditorPage;
