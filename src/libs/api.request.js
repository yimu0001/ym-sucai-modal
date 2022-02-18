/*
 * @Author: your name
 * @Date: 2020-05-11 10:45:42
 * @LastEditTime: 2022-02-17 11:02:33
 * @LastEditors: 赵婷婷
 * @Description: In User Settings Edit
 * @FilePath: \files\src\libs\api.require.js
 */
import HttpRequest from '@/libs/axios';
import config from '@/config';
import { BaseUrl } from '@/libs/constant';

const axios = new HttpRequest(BaseUrl);
export default axios;
