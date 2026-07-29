import {config} from '@config/index';

export const getUrl = (url) => {
    return config.resourcesHost + url;
}