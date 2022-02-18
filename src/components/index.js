/*
 * @Author: your name
 * @Date: 2020-08-13 10:13:33
 * @LastEditTime: 2022-02-18 16:45:36
 * @LastEditors: 赵婷婷
 * @Description: In User Settings Edit
 * @FilePath: \ym-sucai-modal\src\components\index.js
 */
import YMMateriesModal from './SucaiModal.vue';
YMMateriesModal.install = function(Vue) {
  Vue.component(YMMateriesModal.name, YMMateriesModal);
};
export default YMMateriesModal;
