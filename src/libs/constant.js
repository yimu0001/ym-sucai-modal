/*
 * @文件描述:
 * @公司: 广电信通
 * @作者: 赵婷婷
 * @Date: 2022-02-16 17:50:22
 * @LastEditors: 赵婷婷
 * @LastEditTime: 2022-02-18 15:04:15
 */

import config from '@/config';

export const TEST_BASE_URL = 'https://sucai.shandian8.com/';
export const PROD_BASE_URL = 'https://shandianyun-sck.iqilu.com/';

export const BaseUrl =
  process.env.NODE_ENV === 'development' ? config.baseUrl.dev : config.baseUrl.pro;
export const WebsocketUrl =
  process.env.NODE_ENV === 'development' ? config.websocketUrl.dev : config.websocketUrl.pro;

export const PAGE_SIZE = 8;
export const BIG_PAGE_SIZE = 10;

export const SUCAI_TYPE_MAP = Object.freeze({
  image: '图片素材选择',
  video: '视频素材选择',
  voice: '音频素材选择',
  coverImg: '封面选择',
  transcodeVideo: '转码视频选择',
});
