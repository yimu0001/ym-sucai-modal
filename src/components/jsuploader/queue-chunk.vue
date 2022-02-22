<!--
 * 修改 适应原本的sucai-modal
 * @Author: your name
 * @Date: 2020-07-23 09:48:43
 * @LastEditTime: 2022-02-22 15:27:53
 * @LastEditors: 赵婷婷
 * @Description: In User Settings Edit
 * @FilePath: \sucai-modal\src\views\Home.vue
-->
<template>
  <div class="queue-dom"></div>
</template>

<script>
import { uploadProcess } from '@/api/upload';
import Cookies from 'js-cookie';

export default {
  name: 'QueueChunk',
  props: {
    max: {
      type: Number,
      default: 5,
    },
    env: {
      type: String,
      default: 'prod',
    },
  },
  data() {
    return {
      allCount: 0,
      chunkList: [], // [ [index,chunk], ... ]
      stackList: [], // 正在processd 最多五个
    };
  },
  watch: {
    chunkList: {
      handler(newVal) {
        if (this.allCount > 0) {
          let leftCount = newVal.length || 0;
          let percent = parseInt((100 * (this.allCount - leftCount)) / this.allCount);
          this.$emit('setProgress', percent);
        }
      },
      deep: true,
    },
  },
  methods: {
    queueUpload(file, list) {
      this.allCount = list.length;
      this.chunkList = [...list];

      const onceMaxChunkArr = this.chunkList.splice(0, this.max);
      // i最小从0开始
      onceMaxChunkArr.forEach(([i, blob]) => {
        this.uploadChunk(file, blob, Number(i));
        this.stackList.push(Number(i));
      });
    },
    // 0 1 3 5 2 4
    uploadChunk(file, blob, index, retryTimes = 0) {
      if (!blob || retryTimes > 1) {
        console.log('失败次数过多，不再重试');
        this.$emit('error', file, { msg: '文件上传失败' });
        return;
      }

      let fd = this.calcArgumentFormData(file, blob);
      fd.append('chunks', this.allCount);
      fd.append('chunk', index + 1);

      // fd.append('pieceIndex', index);
      uploadProcess(this.env, fd).then((res) => {
        if (res.status === 200) {
          // 这一片上传完成
          this.stackList = this.stackList.filter((i) => i !== index);

          if (this.chunkList && this.chunkList.length > 0) {
            // 下一片 上传
            let arr = this.chunkList.splice(0, 1);
            let [i, blob] = arr[0];
            this.uploadChunk(file, blob, Number(i));
            this.stackList.push(Number(i));
          } else {
            // 等this.stackList为空 文件所有分片上传完成
            if (!this.stackList || this.stackList.length === 0) {
              this.$emit('success', file);
            }
          }
        } else {
          retryTimes++;
          // 网络问题或者其他问题导致这一片上传失败 重新上传
          this.uploadChunk(file, blob, index, retryTimes);
        }
      });
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
    destroy() {
      console.log('停止分片上传');
      this.chunkList = [];
      this.stackList = [];
      this.allCount = 0;
    },
  },
};
</script>
