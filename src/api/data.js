/*
 * @Author: your name
 * @Date: 2020-05-11 10:44:46
 * @LastEditTime: 2020-11-30 15:58:04
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \files\api\data.js
 */
import axios from '@/libs/api.request'

//获取文件下项目
export const getFileList = (baseUrl, type, path_id, num, page, highCodeRateStandardLimit) => {
  let args = {
    num,
    page,
    highCodeRateStandardLimit
  }
  return axios.request({
    url: baseUrl+'folder/'+path_id+'/'+type+'-files',
    method: 'get',
    params: args
  })
}

//根据父类文件夹id获取文件夹
export const getFolders = (baseUrl, type, path_id) => {
  return axios.request({
    url: baseUrl+'folder/'+path_id+'/'+type+'-folders',
    method: 'get',
  })
}


//其他模块文件入库
export const saveFileToStore = (baseUrl, type, url, from, red_soft_process, filename) => {
  return axios.request({
    url: baseUrl+'file/'+type,
    method: 'post',
    data:{
      url: url,
      from: from,
      red_soft_process,
      filename
    }
  })
}

//检查当前机构是否开启转码
export const checkIsTranscode = (baseUrl) => {
  return axios.request({
    url: baseUrl+'transcode/switch-check',
    method: 'get',
  })
}