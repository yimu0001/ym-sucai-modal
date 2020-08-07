/*
 * @Author: your name
 * @Date: 2020-05-11 10:45:42
 * @LastEditTime: 2020-07-23 10:27:18
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \files\src\libs\api.require.js
 */
import HttpRequest from '@/libs/axios'
import config from '@/config'
const baseUrl = process.env.NODE_ENV === 'development'? config.baseUrl.dev : config.baseUrl.pro

const axios = new HttpRequest(baseUrl)
export default axios
