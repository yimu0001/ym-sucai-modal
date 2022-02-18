/*
 * @Author: your name
 * @Date: 2020-05-11 10:44:46
 * @LastEditTime: 2022-02-17 14:31:15
 * @LastEditors: 赵婷婷
 * @Description: In User Settings Edit
 * @FilePath: \files\api\data.js
 */
import axios from '@/libs/api.request';
import { PAGE_SIZE } from '@/libs/constant';

//获取文件下项目
export const getFileList = (type, path_id, highCodeRateStandardLimit, page) => {
  let args = {
    highCodeRateStandardLimit,
    num: PAGE_SIZE,
    page,
  };
  return axios.request({
    url: `/folder/${path_id}/${type}-files`,
    method: 'get',
    params: args,
  });
};

//根据父类文件夹id获取文件夹
export const getFolders = (type, path_id) => {
  return axios.request({
    url: `/folder/${path_id}/${type}-folders`,
    method: 'get',
  });
};

//其他模块文件入库
export const saveFileToStore = (type, url, from, red_soft_process, filename) => {
  return axios.request({
    url: `/file/${type}`,
    method: 'post',
    data: {
      url: url,
      from: from,
      red_soft_process,
      filename,
    },
  });
};

//检查当前机构是否开启转码
export const checkIsTranscode = () => {
  return axios.request({
    url: '/transcode/switch-check',
    method: 'get',
  });
};
