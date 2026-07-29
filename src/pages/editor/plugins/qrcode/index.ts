import type { PluginConfig } from 'video-core-sdk';
import { config } from './config';
import Element from './Element';
import Options from './Options';
import { QrcodeElement as ElementData } from './ElementData';

const conf: PluginConfig = {
  ...config,
  Element,
  Options,
  ElementData,
};

export default conf;
