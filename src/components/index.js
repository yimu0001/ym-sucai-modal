/*
 * @Author: your name
 * @Date: 2020-08-13 10:13:33
 * @LastEditTime: 2020-08-13 10:16:28
 * @LastEditors: your name
 * @Description: In User Settings Edit
 * @FilePath: \ym-sucai-modal\src\components\index.js
 */
import YMMateriesModal from './sucai-modal.vue';
YMMateriesModal.install = function(Vue) {
    Vue.component(YMMateriesModal.name, YMMateriesModal);
};
export default {install, YMMateriesModal};