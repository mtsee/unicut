import { Input, Button, Space } from '@douyinfe/semi-ui';
import Item from './Item';
import { user } from '@stores/user';
import { observer } from 'mobx-react';
import { useReducer, useState } from 'react';
import { userService } from '@server/user.service';
import { language } from '@language/language';

export interface IProps {}

function NickName(props: IProps) {
  const info = user.info;
  const [editName, setEditName] = useState(false);
  const [name, setName] = useState(info.name);
  const [loading, setLoading] = useState(false);

  return (
    <Item
      title={language.val('user_nickname')}
      extra={
        <>
          {editName ? (
            <Space>
              <Button disabled={loading} type="danger" onClick={() => setEditName(false)}>
                {language.val('common_cancel')}
              </Button>
              <Button
                loading={loading}
                onClick={async () => {
                  setLoading(true);
                  if (name !== info.name) {
                    // 更新个人信息
                    info.name = name;
                    await userService.updateUserInfo({ name: name });
                  }
                  setLoading(false);
                  setEditName(false);
                }}
              >
                {language.val('common_confirm')}
              </Button>
            </Space>
          ) : (
            <Button onClick={() => setEditName(true)}>{language.val('common_edit')}</Button>
          )}
        </>
      }
    >
      {editName ? (
        <Input
          value={name}
          onChange={e => {
            setName(e);
          }}
        />
      ) : (
        info.name
      )}
    </Item>
  );
}

export default observer(NickName);
