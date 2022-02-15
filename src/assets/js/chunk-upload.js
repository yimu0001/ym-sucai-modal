// uploadFile.js
import Vue from 'vue';
import SparkMD5 from 'spark-md5';

export default function() {
  // 将上传文件的方法挂载到vue的原型链上面
  Vue.prototype.uploadFile = uploadFile;

  function uploadFile(file, backtopage) {
    // 得到md5码
    getFileMD5(file, (md5) => {
      // 存储文件的md5码
      file.md5 = md5;
      // 拿md5码查询后台数据库是否存在此md5码，如果存在则无需上传
      // handleAjax为封装好的ajax方法
      this.handleAjax(
        'api/doc/file/getFileByMd5',
        {
          md5,
          name: file.name,
        },
        (res) => {
          if (!res.data) {
            // 不存在
            // 开始上传文件
            uploadChunk(this, file, 0, backtopage);
          } else {
            // 秒传
            // 文件上传成功
            backtopage && backtopage();
          }
        }
      );
    });
  }

  // currentChunk为上传文件块的索引
  function uploadChunk(that, file, currentChunk, backtopage) {
    var fileReader = new FileReader(),
      // 上传文件块的大小，可自定义
      chunkSize = 2097152,
      // 计算改文件的可分为多少块
      chunks = Math.ceil(file.size / chunkSize);

    // 文件切割后的回调，this.result为切割的文件块
    fileReader.onload = function(e) {
      // 用FormData传输文件对象
      let fd = new FormData();
      // 设置文件上传接口的需要的参数
      fd.append('md5', file.md5);
      fd.append('chunks', chunks);
      fd.append('chunksize', chunksize);
      fd.append('currentChunk', currentChunk);
      // 设置上传的当前的文件块
      fd.append('fileObj', new Blob([this.result]));

      let xhr = new XMLHttpRequest();
      xhr.open('post', 'api/common/file/upload', true);
      xhr.onreadystatechange = function() {
        // 上传成功
        if (xhr.readyState == 4 && xhr.status == 200) {
          currentChunk++;
          if (currentChunk < chunks) {
            loadNext(); // 继续切割下一块文件
          } else {
            // 文件上传成功
            backtopage && backtopage();
          }
          xhr = null;
          return;
        }
        if (xhr.readyState == 4 && xhr.status == 500) {
          // 文件上传出错
        }
      };
      // 文件上传进度条
      xhr.upload.onprogress = function(e) {
        // 计算上传的进度
        const progress = parseInt(((e.loaded + currentChunk * chunkSize) / file.size) * 100);
        // 更新ui
      };
      xhr.onerror = xhr.upload.onerror = function() {
        // 文件上传出错
      };
      //开始发送
      xhr.send(fd);
      fd = null;
    };

    //处理单片文件的上传
    function loadNext() {
      // 查询后台判断当前块文件有没有上传，如果已经上传则不需要上传，继续读取下一块
      that.handleAjax(
        'api/common/file/checkChunk',
        { md5: upload.md5, chunk: currentChunk },
        (res) => {
          // 后台返回没有上传过
          if (res.data === false) {
            // 计算切割文件的开始索引和结束索引
            var start = currentChunk * chunkSize,
              end = Math.min(start + chunkSize, file.size);
            // 切割文件并触发fileReader.onload
            fileReader.readAsArrayBuffer(file.slice(start, end));
            // 后台返回此块已经上传过，递归调用loadNext，继续判断下一块文件块
          } else {
            currentChunk++;
            if (currentChunk < chunks) {
              loadNext();
            }
          }
        },
        (err) => {
          // 文件上传出错
        }
      );
    }
    // 触发文件第一块上传
    loadNext();
  }

  // 获得文件md5
  function getFileMD5(file, callback) {
    //声明必要的变量
    var fileReader = new FileReader(),
      //文件每块分割2M，计算分割详情
      chunkSize = 2097152,
      chunks = Math.ceil(file.size / chunkSize),
      currentChunk = 0,
      //创建md5对象（基于SparkMD5）
      spark = new SparkMD5();

    //每块文件读取完毕之后的处理
    fileReader.onload = function(e) {
      //每块交由sparkMD5进行计算
      spark.appendBinary(e.target.result);
      currentChunk++;

      //如果文件处理完成计算MD5，如果还有分片继续处理
      if (currentChunk < chunks) {
        loadNext();
      } else {
        callback(spark.end());
      }
    };

    //处理单片文件的上传
    function loadNext() {
      var start = currentChunk * chunkSize,
        end = start + chunkSize >= file.size ? file.size : start + chunkSize;

      fileReader.readAsBinaryString(file.slice(start, end));
    }

    loadNext();
  }
}
