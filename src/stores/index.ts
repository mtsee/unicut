/* eslint-disable prettier/prettier */
import { layout } from './layout';
import { user } from './user';
import { audios } from './audios';

const stores = {
  layout,
  user,
  audios,
  editor: null,
};

export { stores, user };
