/*
 * @文件描述:
 * @公司: 广电信通
 * @作者: 赵婷婷
 * @Date: 2022-02-22 16:03:19
 * @LastEditors: 赵婷婷
 * @LastEditTime: 2022-02-22 16:25:19
 */

import SparkMD5 from 'spark-md5';

export const perChunkSize = 5 * 1024 * 1024;
export const FILE_TYPE_MAP = {
  image: { title: '图片', format: ['gif', 'jpg', 'jpeg', 'png', 'bmp', 'webp'] },
  video: { title: '视频', format: ['mp4', 'm3u8', 'rmvb', 'avi', 'swf', '3gp', 'mkv', 'flv'] },
  voice: { title: '音频', format: ['wav', 'mp3'] },
  text: {
    title: '文本',
    format: [
      'doc',
      'txt',
      'docx',
      'pages',
      'epub',
      'pdf',
      'numbers',
      'csv',
      'xls',
      'xlsx',
      'keynote',
      'ppt',
      'pptx',
    ],
  },
};
/**
 * @param {*} size
 * @description 单位转换 后端返回的字节数 ==> 前台展示的M、G
 */
export const calcBytesToSize = (size) => {
  var data = '';
  if (size < 1024) {
    //如果小于1KB转化成B
    data = size.toFixed(2) + 'B';
  } else if (size < 1024 * 1024) {
    //如果小于1MB转化成KB
    data = (size / 1024).toFixed(2) + 'KB';
  } else if (size < 1024 * 1024 * 1024) {
    //如果小于1GB转化成MB
    data = (size / (1024 * 1024)).toFixed(2) + 'MB';
  } else {
    //其他转化成GB
    data = (size / (1024 * 1024 * 1024)).toFixed(2) + 'GB';
  }

  var sizestr = data + '';
  var len = sizestr.indexOf('.');
  var dec = sizestr.substr(len + 1, 2);
  if (dec == '00') {
    //当小数点后为00时 去掉小数部分
    return sizestr.substring(0, len) + sizestr.substr(len + 3, 2);
  }

  return sizestr;
};

/**
 * @param {*} file 本地文件
 * @param {*} callback 回调函数
 * @description 获得文件md5
 */
export const getFileMD5 = (file, callback) => {
  let chunkObj = {}; // index:blob
  //声明必要的变量
  let fileReader = new FileReader(),
    // 文件每块分割5M，计算分割详情
    chunkSize = perChunkSize,
    chunks = Math.ceil(file.size / chunkSize), // 总片数
    currentChunk = 0, // 当前片数 从0开始计数
    // 创建md5对象（基于SparkMD5）
    spark = new SparkMD5();

  //处理单片文件的上传
  const loadNext = () => {
    // (start + chunkSize) >= file.size 判断是否最后一片
    let start = currentChunk * chunkSize,
      end = start + chunkSize >= file.size ? file.size : start + chunkSize;
    let piece = file.slice(start, end);

    chunkObj[currentChunk] = piece;
    fileReader.readAsBinaryString(piece);
  };

  //每块文件读取完毕之后的处理
  fileReader.onload = (e) => {
    //每块交由sparkMD5进行计算
    spark.appendBinary(e.target.result);
    currentChunk++;

    //如果文件处理完成计算MD5，如果还有分片继续处理
    if (currentChunk < chunks) {
      loadNext();
    } else {
      callback(spark.end(), chunkObj);
    }
  };

  loadNext();
};
