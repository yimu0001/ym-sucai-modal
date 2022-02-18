/*
 * @Author: your name
 * @Date: 2020-07-24 09:12:36
 * @LastEditTime: 2022-02-17 17:21:05
 * @LastEditors: 赵婷婷
 * @Description: In User Settings Edit
 * @FilePath: \sucai-modal\vue.config.js
 */
const path = require('path');
function resolve(dir) {
  return path.resolve(__dirname, dir);
}
var webpack = require('webpack');
module.exports = {
  pages: {
    index: {
      entry: 'src/main.js',
      template: 'public/index.html',
      filename: 'index.html',
    },
  },
  productionSourceMap: false,
  configureWebpack: {
    output: {
      libraryExport: 'default',
    },
    resolve: {
      extensions: ['.js', '.vue', '.json'],
      alias: {
        '@': resolve('src'),
        _c: resolve('src/components'),
      },
    },
    plugins: [
      new webpack.ProvidePlugin({
        $: 'jquery',
        jQuery: 'jquery',
        plupload: 'plupload',
      }),
    ],
  },
  devServer: {
    port: 8091,
    hot: true,
    open: 'Google Chrome',
  },
  chainWebpack: (config) => {
    config.module
      .rule('js')
      .include.add('/packages')
      .end()
      .use('babel')
      .loader('babel-loader')
      .tap((options) => {
        return options;
      });
  },
  css: {
    extract: false,
  },
  devServer: {
    proxy: 'https://shandianyun-sck.iqilu.com',
  },
};
