/*
 * @Author: your name
 * @Date: 2020-08-12 18:18:35
 * @LastEditTime: 2020-08-13 11:15:17
 * @LastEditors: your name
 * @Description: In User Settings Edit
 * @FilePath: \ym-sucai-modal\babel.config.js
 */
module.exports = {
  presets: [
    '@vue/cli-plugin-babel/preset'
  ],
  plugins: [["import", {
    "libraryName": "view-design",
    "libraryDirectory": "src/components"
  }]]
}
