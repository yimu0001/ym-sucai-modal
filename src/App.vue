<!--
 * @Author: your name
 * @Date: 2020-07-23 09:48:43
 * @LastEditTime: 2020-07-23 10:28:57
 * @LastEditors: your name
 * @Description: In User Settings Edit
 * @FilePath: \sucai-modal\src\App.vue
--> 
<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<style lang="less">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
</style>
