/*
 * @Author: your name
 * @Date: 2020-05-11 11:17:25
 * @LastEditTime: 2022-02-17 14:18:57
 * @LastEditors: 赵婷婷
 * @Description: In User Settings Edit
 * @FilePath: \files\src\libs\axios.js
 */
import axios from 'axios';
import Cookies from 'js-cookie';
import { getHeaders } from './util';
import { Message } from 'iview';
import config from '@/config';
import Bus from '@/libs/bus';

Bus.$on('setEnv', (env) => {
  if (env === 'test') {
    config.baseUrl.pro = 'https://sucai.shandian8.com';
    config.websocketUrl.pro = 'wss://sucai.shandian8.com';
  } else {
    config.baseUrl.pro = 'https://shandianyun-sck.iqilu.com';
    config.websocketUrl.pro = 'wss://shandianyun-sck.iqilu.com';
  }
});

// const addErrorLog = (errorInfo) => {
//   const {
//     statusText,
//     status,
//     request: { responseURL },
//   } = errorInfo;
//   let info = {
//     type: 'ajax',
//     code: status,
//     mes: statusText,
//     url: responseURL,
//   };
//   if (!responseURL.includes('save_error_logger')) store.dispatch('addErrorLog', info)
// };

class HttpRequest {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
    this.queue = {};
  }
  getInsideConfig() {
    const config = {
      baseURL: this.baseUrl,
      headers: getHeaders(),
    };
    return config;
  }
  destroy(url) {
    delete this.queue[url];
    if (!Object.keys(this.queue).length) {
      // Spin.hide()
    }
  }
  interceptors(instance, url) {
    // 请求拦截
    instance.interceptors.request.use(
      (config) => {
        // 添加全局的loading...
        if (!Object.keys(this.queue).length) {
          // Spin.show() // 不建议开启，因为界面不友好
        }
        this.queue[url] = true;
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
    // 响应拦截
    instance.interceptors.response.use(
      (res) => {
        this.destroy(url);
        const { data, status } = res;
        if (status != 200) {
          this.$Message.error(data.msg);
        } else {
        }
        return { data, status };
      },
      (error) => {
        this.destroy(url);
        let errorInfo = error.response;
        if (!errorInfo) {
          const {
            request: { statusText, status },
            config,
          } = JSON.parse(JSON.stringify(error));
          errorInfo = {
            statusText,
            status,
            request: { responseURL: config.url },
          };
        }
        // addErrorLog(errorInfo);
        return Promise.reject(error);
      }
    );
  }
  request(options) {
    const instance = axios.create();
    options = Object.assign(this.getInsideConfig(), options);
    this.interceptors(instance, options.url);
    return instance(options);
  }
}
export default HttpRequest;
