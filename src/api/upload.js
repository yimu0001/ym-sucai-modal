/*
 * @Author: your name
 * @Date: 2020-10-15 16:21:50
 * @LastEditTime: 2022-02-22 17:15:11
 * @LastEditors: 赵婷婷
 * @Description: In User Settings Edit
 * @FilePath: \sucaiku_front_pc\src\api\webupload.js
 */
import axios from '@/libs/api.request';
import { getUploadHeaders } from '@/libs/util';

let TEST_BASE_URL = 'https://sucai.shandian8.com/';
let PROD_BASE_URL = 'https://shandianyun-sck.iqilu.com/';

// let BASE_URL = 'https://shandianyun-sck.iqilu.com/';
// if (process.env.NODE_ENV === 'development') {
//   BASE_URL = 'https://sucai.shandian8.com/';
// } else {
//   BASE_URL = 'https://shandianyun-sck.iqilu.com/';
// }

/**
 * @description: 创建分片上传过程
 * @param {MIME_type： MIME-TYPE ext : 文件扩展名 file_md5 : 整个文件MD5}
 * @return {type}
 */
export const uploadInit = (env, args) => {
  let base_url = env === 'test' ? TEST_BASE_URL : PROD_BASE_URL;
  return axios.request({
    url: base_url + 'upload/chunk-resume/init',
    method: 'post',
    data: args,
  });
};

/**
 * @description: 分片上传 顺序 需等待上片返回后下一片请求
 * @param {chunk : 分片编号 递增, uuid : 创建分片上传过程返回 upload_id, chunkMD5： 分片MD5}
 * @return {type}
 */
export const uploadProcess = (env, args) => {
  let base_url = env === 'test' ? TEST_BASE_URL : PROD_BASE_URL;
  return axios.request({
    url: base_url + 'upload/chunk-resume/process',
    method: 'post',
    headers: { ...getUploadHeaders(), 'content-type': 'multipart/form-data' },
    // data: new URLSearchParams(args),
    data: args,
  });
};

/**
 * @description: 终止
 * @param {uuid ： 创建分片上传过程返回 upload_id}
 * @return {type}
 */
export const uploadStop = (env, uuid) => {
  let base_url = env === 'test' ? TEST_BASE_URL : PROD_BASE_URL;
  return axios.request({
    url: base_url + 'upload/chunk-resume/abort',
    method: 'post',
    data: { uuid },
  });
};

/**
 * @description: 完成 开始合并
 * @param {uuid ： 创建分片上传过程返回 upload_id, fileMD5 : 文件整体MD5}
 * @return {type}
 */
export const uploadFinish = (env, args) => {
  let base_url = env === 'test' ? TEST_BASE_URL : PROD_BASE_URL;
  return axios.request({
    url: base_url + 'upload/chunk-resume/finish',
    method: 'post',
    data: args,
  });
};
