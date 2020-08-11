/*
 * @Author: your name
 * @Date: 2020-08-11 11:18:22
 * @LastEditTime: 2020-08-11 11:38:14
 * @LastEditors: your name
 * @Description: In User Settings Edit
 * @FilePath: \sucai-modal\packages\index.js
 */
import YMMateriesModal from '../src/components/sucai-modal.vue';
YMMateriesModal.install = function(Vue) {
    Vue.component(YMMateriesModal.name, YQTreeSelector);
};
export default YMMateriesModal;