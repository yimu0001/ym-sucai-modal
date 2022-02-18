/*
 * @Author: your name
 * @Date: 2020-07-23 09:48:43
 * @LastEditTime: 2022-02-17 16:51:54
 * @LastEditors: 赵婷婷
 * @Description: In User Settings Edit
 * @FilePath: \sucai-modal\src\main.js
 */

import Vue from 'vue';

import {
  Button,
  Modal,
  Row,
  Col,
  Input,
  Select,
  Option,
  Time,
  Tabs,
  TabPane,
  Message,
  Icon,
  Page,
  Tree,
  Progress,
  DropdownMenu,
  Dropdown,
} from 'view-design';
import 'view-design/dist/styles/iview.css';
import '@/index.less';
import App from './App.vue';
import router from './router';
import config from '@/config';

Vue.component('Button', Button);
Vue.component('Modal', Modal);
Vue.component('Row', Row);
Vue.component('Col', Col);
Vue.component('Input', Input);
Vue.component('Select', Select);
Vue.component('Option', Option);
Vue.component('Time', Time);
Vue.component('Tabs', Tabs);
Vue.component('TabPane', TabPane);
Vue.component('Icon', Icon);
Vue.component('Page', Page);
Vue.component('Tree', Tree);
Vue.component('Progress', Progress);
Vue.component('DropdownMenu', DropdownMenu);
Vue.component('Dropdown', Dropdown);

Vue.config.productionTip = false;
Vue.prototype.$config = config;
Vue.prototype.$Message = Message;

new Vue({
  router,
  render: (h) => h(App),
}).$mount('#app');
