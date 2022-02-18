/*
 * @Author: your name
 * @Date: 2020-07-23 09:48:43
 * @LastEditTime: 2022-02-18 16:46:28
 * @LastEditors: 赵婷婷
 * @Description: In User Settings Edit
 * @FilePath: \sucai-modal\src\router\index.js
 */

import Vue from 'vue';
import VueRouter from 'vue-router';
import Home from '../views/Home.vue';
import initDemo from '../views/initDemo';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/init-demo',
    name: 'init-demo',
    component: initDemo,
  },
  // {
  //   path: '/about',
  //   name: 'About',
  //   component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  // }
];

const router = new VueRouter({
  routes,
});

export default router;
