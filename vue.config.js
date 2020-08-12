/*
 * @Author: your name
 * @Date: 2020-07-24 09:12:36
 * @LastEditTime: 2020-08-12 15:07:26
 * @LastEditors: your name
 * @Description: In User Settings Edit
 * @FilePath: \sucai-modal\vue.config.js
 */
const path = require('path');
function resolve(dir) {
    return path.resolve(__dirname, dir)
}

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
            libraryExport: 'default'
        },
        resolve: {
            extensions: ['.js', '.vue', '.json'],
            alias: {
                '@': resolve('packages'),
                'assets': resolve('src/assets'),
                'views': resolve('src/views'),
            }
        }, 
    },
    devServer:{
        port: 8091,
        hot: true,
        open: 'Google Chrome'
    },
    chainWebpack: config => {
        config.module
            .rule('js')
            .include
            .add('/packages')
            .end()
            .use('babel')
            .loader('babel-loader')
            .tap(options => {
                return options
            })
    },
    css: {
        extract: false,
    },

}