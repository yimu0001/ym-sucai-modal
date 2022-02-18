/*
 * @Author: your name
 * @Date: 2020-08-13 10:13:33
 * @LastEditTime: 2020-08-13 10:53:00
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \ym-sucai-modal\src\components\index.js
 */
import YMMateriesModal from './sucai-modal.vue';
YMMateriesModal.install = function(Vue) {
    Vue.component(YMMateriesModal.name, YMMateriesModal);
};
export default YMMateriesModal;