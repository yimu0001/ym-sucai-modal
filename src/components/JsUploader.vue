<!--
 * 本地上传
 * @Author: your name
 * @Date: 2020-07-23 09:48:43
 * @LastEditTime: 2022-02-18 16:48:19
 * @LastEditors: 赵婷婷
 * @Description: In User Settings Edit
 * @FilePath: \sucai-modal\src\views\Home.vue
-->
<template>
  <div class="js-modal-inner">
    <Button class="upload-btn" type="primary" icon="ios-cloud-upload-outline"
      >上传<input
        type="file"
        multiple
        class="select-file-input"
        :accept="acceptType"
        @change="handleFileChange"
    /></Button>

    <div class="file-list">
      <div class="file-item" v-for="(item, index) in uploadList" :key="index">
        <!-- stroke-color="#E2EDFE" -->
        <Progress
          class="deep-pro-bar"
          :percent="calcPercent(index, item.id)"
          :stroke-width="40"
          stroke-color="#F3F3F3"
          hide-info
        />
        <div class="file-info-line">
          <div class="title-col">
            <div class="file-type top-level" :icon="fileCategory(item.ext, item.file_type)"></div>
            <p class="name-text top-level" :title="item.filename">{{ item.filename }}</p>
          </div>
          <p class="size-text top-level">{{ calcFileSize(item.size) }}</p>
          <p class="status-text top-level">
            <span class="green-tips" v-if="item.upload_status === 2">{{
              uploadStatusText[item.upload_status]
            }}</span>
            <span class="red-tips" v-else-if="item.upload_status === 3">{{
              uploadStatusText[item.upload_status]
            }}</span>
            <span class="grey-tips" v-else>{{ uploadStatusText[item.upload_status] }}</span>
          </p>
          <Icon
            class="close-icon top-level"
            size="18"
            type="md-close"
            @click="removeFile(item, index)"
          />
        </div>
      </div>
      <p class="no-content-tips" v-if="!uploadList || uploadList.length === 0">
        暂无文件
      </p>
    </div>
  </div>
</template>

<script>
import SparkMD5 from 'spark-md5';
import Cookies from 'js-cookie';
import { uploadInit, uploadProcess, uploadFinish, uploadStop } from '@/api/upload';
import { bytesToSize } from '@/libs/tools';

const FILE_TYPE_MAP = {
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

export default {
  name: 'js-upload',
  props: {
    accept: {
      type: String,
      default: null,
    },
    // 上传最大数量 默认为100
    fileNumLimit: {
      type: Number,
      default: 100,
    },
    // 是否需要高码率
    highLimit: {
      type: String | Number,
      default: '0',
    },
  },
  data() {
    return {
      uploadStatusText: {
        0: '校验中...',
        1: '上传中...',
        2: '上传完成',
        3: '上传失败',
      },
      uploadList: [],
      chunkMap: {},
      chunkIndexMap: {},
    };
  },
  watch: {
    uploadList: {
      deep: true,
      handler() {},
    },
    chunkIndexMap: {
      deep: true,
      handler() {},
    },
  },
  computed: {
    // image video text voice
    acceptType() {
      if (!Object.keys(FILE_TYPE_MAP).includes(this.accept)) {
        this.$Message.error('选择的文件类型错误');
        return '';
      }

      let fileType = FILE_TYPE_MAP[this.accept].format.map((ext) => `.${ext}`).join(',');

      return fileType;
    },
  },
  methods: {
    handleFileChange(e) {
      const files = e.target.files;
      console.log('handleFileChange files', files);
      if (!files) return;

      let fileCount = files.length;
      if (fileCount > this.fileNumLimit) {
        // 不符合数量的处理
        this.$Message.warning(
          '文件数不能超过' + this.fileNumLimit + '个，你选择了' + fileCount + '个'
        );
        return false;
      }

      Object.values(files).forEach((file, index) => {
        // 防止多文件上传出现错误
        file.id = new Date().getTime() + '_' + index;
        // file.type = file.file_type;

        this.beforeUpload(file);
      });
    },
    // 处理上传
    beforeUpload(file) {
      console.log('beforeUpload', file);
      let arr = file.name ? file.name.split('.') : [];
      if (arr && arr.length > 0) {
        file.ext = arr[arr.length - 1];
      }

      let newIndex = this.uploadList ? this.uploadList.length : 0;
      let { id, name, type, lastModifiedDate, size, ext } = file;
      this.$set(this.uploadList, newIndex, {
        id,
        name,
        type,
        lastModifiedDate,
        size,
        ext,
        filename: file.name,
        upload_status: 0, // 文件校验中
      });
      // 得到md5码
      this.getFileMD5(file, (md5) => {
        file.file_md5 = md5;
        // 拿md5码查询后台数据库是否存在此md5码，如果存在则无需上传
        this.initCheckUpload(file);
      });
    },
    initCheckUpload(file) {
      let { ext, file_md5, type } = file;
      let initArgs = {
        ext, // "jpg"
        MIME_type: type, // "image/jpeg"
        file_md5: file_md5, // "6e259b9afb49248cd60c2dc78aaf9498"
        video_high_code_rate_limit: this.highLimit, // "0"
      };
      uploadInit(initArgs)
        .then((res) => {
          if (res.status == 200) {
            console.log('res init', res, res.data.data);
            let { status, uuid, current_chunk, extra } = res.data.data;
            // 1：未上传过 2：已存在了 直接finish
            if (status === '1') {
              file.current_chunk = current_chunk;
              file.uuid = uuid;
              // TODO 断点续传
              this.uploadAllChunk(file);
              console.log('继续上传', file);
            } else if (status === '2') {
              this.uploadSuccess(file, extra);
            }
          } else {
            console.log('init Error', file, res);
            this.uploadError(file, { msg: '文件检查失败' });
          }
        })
        .catch((err) => {
          console.log('init catch', err.response);
          this.uploadError(file, { msg: '文件检查失败' });
        });
    },
    // 获得文件md5
    getFileMD5(file, callback) {
      this.chunkMap[file.id] = {}; // index:blob
      //声明必要的变量
      let fileReader = new FileReader(),
        // 文件每块分割5M，计算分割详情
        chunkSize = 5 * 1024 * 1024,
        chunks = Math.ceil(file.size / chunkSize), // 总片数
        currentChunk = 0, // 当前片数
        // 创建md5对象（基于SparkMD5）
        spark = new SparkMD5();

      // this.chunkIndexMap[file.id] = [...new Array(chunks).keys()];
      this.$set(this.chunkIndexMap, file.id, [...new Array(chunks).keys()]);

      //处理单片文件的上传
      const loadNext = () => {
        // (start + chunkSize) >= file.size 判断是否最后一片
        let start = currentChunk * chunkSize,
          end = start + chunkSize >= file.size ? file.size : start + chunkSize;
        let piece = file.slice(start, end);

        this.chunkMap[file.id][currentChunk] = piece;
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
          callback(spark.end());
        }
      };

      loadNext();
    },
    calcPercent(index, fileId) {
      const { upload_status } = this.uploadList[index];
      let percent = 0;
      if (upload_status === 0) {
        percent = 0;
      } else if (upload_status === 2) {
        percent = 100;
      } else {
        // 上传中 或者失败
        let allCount = Object.keys(this.chunkMap[fileId]).length;
        let leftNum = this.chunkIndexMap[fileId];

        if (allCount > 0) {
          percent = parseInt((100 * (allCount - leftNum)) / allCount);
        }
      }

      return percent;
    },
    calcArgumentFormData(file, blob) {
      let { id, name, type, lastModifiedDate, size, uuid } = file;
      let arg = {
        id,
        name,
        type,
        lastModifiedDate,
        size,
        token: Cookies.get('token'),
        uuid,
        file: new window.File([blob], name, { type }),
      };

      // 用FormData传输文件对象
      let fd = new FormData();
      Object.keys(arg).forEach((key) => {
        fd.append(key, arg[key]);
      });

      return fd;
    },
    uploadAllChunk(file) {
      // 文件上传中
      this.uploadList.forEach((item) => {
        item.id === file.id && (item.upload_status = 1);
      });

      console.log('开始上传分片', file, this.chunkMap[file.id]);
      let list = Object.entries(this.chunkMap[file.id]);
      list.forEach(([i, blob]) => {
        this.uploadChunk(file, blob, Number(i));
      });
    },
    // 0 1 3 5 2 4
    uploadChunk(file, blob, index, retryTimes = 0) {
      if (retryTimes > 1) {
        this.uploadError(file, { msg: '失败次数过多，不再重试' });
        return;
      }

      let allCount = Object.keys(this.chunkMap[file.id]).length;
      let fd = this.calcArgumentFormData(file, blob);
      fd.append('chunks', allCount);
      fd.append('chunk', index + 1);

      // fd.append('pieceIndex', index);
      uploadProcess(fd).then((res) => {
        if (res.status === 200) {
          // 这一片上传完成
          let indexs = this.chunkIndexMap[file.id].filter((i) => i !== index);
          this.$set(this.chunkIndexMap, file.id, indexs);
          if (!indexs || indexs.length === 0) {
            this.allChunkUploaded(file);
          }
        } else {
          retryTimes++;
          // 网络问题或者其他问题导致这一片上传失败 重新上传
          this.uploadChunk(file, blob, index, retryTimes);
        }
      });
    },
    allChunkUploaded(file) {
      let params = {
        uuid: file.uuid,
        video_high_code_rate_limit: this.highLimit,
      };
      uploadFinish(params)
        .then((res) => {
          let { data, status } = res;
          if (status === 200) {
            console.log('合并成功', data.data, res);
            this.uploadSuccess(file, data.data);
          } else {
            this.uploadError(file, { msg: data.msg || '文件合并失败' });
          }
        })
        .catch((err) => {
          let errorMessage = '文件合并失败';
          if (this.highLimit == '1') {
            errorMessage = '上传失败，请检查是否是视频码率过低';
          }

          console.log('合并失败catch', err);
          this.uploadError(file, { msg: errorMessage });
        });
    },
    // 上传成功调用
    uploadSuccess(file, data) {
      delete this.chunkMap[file.id];
      delete this.chunkIndexMap[file.id];

      this.uploadList.forEach((item, index) => {
        if (item.id === file.id) {
          let extra = {
            ...item,
            ...data,
            filename: file.name,
            upload_status: 2,
          };
          this.$set(this.uploadList, index, extra);
          this.$emit('success', file, extra);
        }
      });
      console.log('上传完成', this.uploadList);
    },
    // 上传失败调用
    uploadError(file, error) {
      // 文件上传中
      this.uploadList.forEach((item) => {
        item.id === file.id && (item.upload_status = 3);
      });
      this.$emit('error', file, error.msg || '上传失败');
    },
    removeFile(item, index) {
      if (item.upload_status === 1) {
        uploadStop(item.uuid).then((res) => {
          console.log('如果正在上传中--终止', res);
        });
      }

      this.uploadList.splice(index, 1);
      this.$emit('remove', index);
    },
    // 根据文件扩展名得到文件类型  ext ==> type
    fileCategory(ext, fileType) {
      if (fileType) return fileType;

      let type = '';
      Object.keys(FILE_TYPE_MAP).forEach((_type) => {
        const extensions = FILE_TYPE_MAP[_type].format;
        if (extensions.includes(ext)) {
          type = _type;
        }
      });

      return type;
    },
    // 单位转换
    calcFileSize: bytesToSize,
    clearChoosed() {
      this.uploadList = [];
      this.chunkMap = {};
      this.chunkIndexMap = {};
    },
  },
};
</script>

<style lang="less" scoped>
.issues {
  float: right;
}
.js-modal-inner {
  min-height: 200px;
}
.upload-btn {
  position: relative;
  .select-file-input {
    position: absolute;
    top: 0;
    left: 0;
    width: 82px;
    height: 32px;
    opacity: 0;
  }
}
.file-list {
  margin-top: 20px;
  .file-item {
    padding: 0 10px;
    position: relative;

    .deep-pro-bar {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 0;

      ::v-deep .ivu-progress-inner {
        background-color: #fff;
        border-radius: 0;
      }
      ::v-deep .ivu-progress-bg {
        border-radius: 0;
      }
    }

    .file-info-line {
      height: 40px;
      line-height: 40px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 14px;
      background-color: none;
      color: #515a6e;
      z-index: 1;
      .top-level {
        z-index: 1;
      }
      .title-col {
        height: 40px;
        display: flex;
        align-items: center;
      }
      .name-text {
        margin: 10px;
        width: 320px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .size-text {
        width: 110px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .status-text {
        width: 120px;
      }
      .close-icon {
        cursor: pointer;
      }
    }
  }
  .file-item:first-child {
    border-top: 1px solid #ececec;
    border-bottom: 1px solid #ececec;
  }
  .file-item + .file-item {
    border-bottom: 1px solid #ececec;
  }

  .no-content-tips {
    margin-top: 20px;
    width: 100%;
    text-align: center;
    font-size: 14px;
    color: #999;
  }
}

.green-tips {
  color: #19be6b;
}
.red-tips {
  color: #ed4014;
}
.grey-tips {
  color: #515a6e;
}
.file-type {
  width: 24px;
  height: 24px;
}
.file-type[icon='text'] {
  background: url(../assets/icons/text-icon.png) no-repeat center;
}
.file-type[icon='video'] {
  background: url(../assets/icons/video-icon.png) no-repeat center;
}
.file-type[icon='image'] {
  background: url(../assets/icons/image-icon.png) no-repeat center;
}
.file-type[icon='voice'] {
  background: url(../assets/icons/audio-icon.png) no-repeat center;
}
</style>
