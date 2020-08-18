/*
 * @Author: your name
 * @Date: 2020-05-11 10:44:46
 * @LastEditTime: 2020-08-18 10:44:22
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \files\api\data.js
 */
import axios from '@/libs/api.request'

//获取文件下项目
export const getFileList = (baseUrl, type, path_id, num, page) => {
  let args = {
    num,
    page
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
export const saveFileToStore = (baseUrl, type, url, from) => {
  return axios.request({
    url: baseUrl+'file/'+type,
    method: 'post',
    data:{
      url: url,
      from: from
    }
  })
}

