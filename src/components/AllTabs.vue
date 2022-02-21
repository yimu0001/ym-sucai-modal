<!--
 * @Author: your name
 * @Date: 2020-07-23 11:54:45
 * @LastEditTime: 2022-02-18 18:01:57
 * @LastEditors: 赵婷婷
 * @Description: In User Settings Edit
 * @FilePath: \sucai-modal\src\components\modal-tabs\image-tabs.vue
-->
<template>
  <div>
    <Tabs :value="materialKey" @on-click="handleClickTabs">
      <TabPane label="素材库" name="library" v-if="type !== 'transcodeVideo'">
        <library-list
          ref="libraryList"
          :fileLimit="fileLimit"
          :highLimit="highLimit"
          :materialType="materialType"
          @startFrame="initWebSocket"
        ></library-list>
      </TabPane>
      <TabPane label="本地库" name="local">
        <js-uploader
          v-if="materialKey === 'local' && modalKey"
          ref="jsUploader"
          :accept="materialType"
          :fileNumLimit="fileLimit"
          :highLimit="highLimit"
          @error="uploadOnImgError"
          @success="uploadOnSuccess"
          @remove="uploadOnImgRemove"
        ></js-uploader>
      </TabPane>
      <TabPane v-if="type === 'video'" label="插入视频" name="online">
        <div class="setVideoByPath">
          <Input
            search
            enter-button="预览"
            v-model="uploadVideoUrl"
            placeholder="请输入视频地址"
            @on-search="previewVideo"
            style="width: 600px; margin: 0 auto;"
          />
          <div v-if="showPreview" style="text-align: center; padding-top: 20px;">
            <video :src="choosedMaterials[0].url" controls class="setVideoShow"></video>
          </div>
        </div>
      </TabPane>
      <TabPane v-if="type === 'coverImg'" label="抽帧图片" name="framePicture">
        <CoverList ref="ymCoverList" :list="cutTUrls"></CoverList>
      </TabPane>
      <TabPane
        v-if="type === 'image' && articleImages && articleImages.length > 0"
        label="文章内图片"
        name="pictureInArticle"
      >
        <ArticlePictures ref="articleDom" :articleImages="articleImages"></ArticlePictures>
      </TabPane>
    </Tabs>
  </div>
</template>

<script>
// 素材库
import LibraryList from './LibraryList';
// 本地库
import JsUploader from './JsUploader';
// 抽帧图片
import CoverList from './CoverList';
// 文章内图片
import ArticlePictures from './ArticlePictures';

import { saveFileToStore, checkIsTranscode } from '@/api/data';
import { WebsocketUrl } from '@/libs/constant';
import Bus from '../libs/bus';

export default {
  name: 'imageTabs',
  props: {
    fileLimit: {
      type: Number,
      default: 1,
    },
    type: {
      required: true,
      type: String,
    },
    modalKey: {
      type: Boolean,
      default: false,
    },
    from: {
      type: String,
      required: true,
    },
    highLimit: {
      type: String,
      default: '0',
    },
    articleImages: {
      type: Array,
      default: [],
    },
  },
  data() {
    return {
      materialKey: 'library', //  library | local | online | framePicture | pictureInArticle
      choosedMaterials: [],
      uploadVideoUrl: '',
      showPreview: false,
      materialType: this.type,
      cutTUrls: [], // [{height, id, name, size, url, width},...]
      // webSocket所用
      ws: null,
      wsInterval: undefined,
    };
  },
  components: {
    LibraryList,
    JsUploader,
    CoverList,
    ArticlePictures,
  },
  watch: {
    type: {
      immediate: true,
      handler() {
        this.materialType = this.type;
        this.materialKey = 'library';
        if (this.type == 'coverImg') {
          this.materialType = 'image';
        } else if (this.type == 'transcodeVideo') {
          this.materialType = 'video';
          this.materialKey = 'local';
        }

        this.choosedMaterials = [];
        this.uploadVideoUrl = '';
        this.showPreview = false;
      },
    },
    materialKey(newVal, oldVal) {
      this.page = 1;
      if (oldVal === 'library') {
        this.$refs.libraryList && this.$refs.libraryList.clearChoosed();
      }
      this.choosedMaterials = [];
      this.uploadVideoUrl = '';
      this.showPreview = false;
    },
  },
  methods: {
    // 打开窗口方法
    onOpenModal(type) {
      if (this.type == 'transcodeVideo') {
        this.materialType = 'video';
        this.materialKey = 'local';
      } else {
        this.materialType = type;
        this.materialKey = 'library';
      }

      this.choosedMaterials = [];
      this.$refs.libraryList && this.$refs.libraryList.clearChoosed();
    },
    onCloseModal() {
      this.choosedMaterials = [];
      this.uploadVideoUrl = '';
      this.resetComponents();
      this.resetVideoCut();
    },
    resetComponents() {
      this.$refs.libraryList && this.$refs.libraryList.clearChoosed();
      this.$refs.jsUploader && this.$refs.jsUploader.clearChoosed();
      this.$refs.ymCoverList && this.$refs.ymCoverList.clearChoosed();
      this.$refs.articleDom && this.$refs.articleDom.clearChoosed();
    },
    resetVideoCut() {
      this.cutTUrls = [];
      // video才可能会抽帧 转码
      this.ws && this.ws.close();
      clearInterval(this.wsInterval);
    },
    handleClickTabs(name) {
      this.materialKey = name;
    },
    // 本地文件上传
    uploadOnImgError(errorMessage) {
      this.$Message.error({
        content: errorMessage,
        duration: 7,
      });
    },
    uploadOnImgRemove(index) {
      this.choosedMaterials.splice(index, 1);
      Bus.$emit('doMaterials', this.choosedMaterials);
      this.resetVideoCut();
    },
    uploadOnSuccess(file, extra) {
      if (extra) {
        if (!extra.url) {
          this.$Message.error('上传失败！');
          return;
        }

        extra.filename = file.name;
        if (this.materialType !== 'video') {
          this.choosedMaterials.push(extra);
          Bus.$emit('doMaterials', this.choosedMaterials);
        }
        this.handleWarehousing(extra);
      }
    },
    // 入库
    handleWarehousing(info) {
      if (this.from === 'notSave') {
        if (this.materialType === 'video') {
          this.choosedMaterials.push(info);
          Bus.$emit('doMaterials', this.choosedMaterials);
        }
        return false;
      }

      this.$emit('beforeStore'); // 入库中不可点击确认按钮
      saveFileToStore(this.materialType, info.url, this.from, this.highLimit, info.filename)
        .then((res) => {
          if (res.status === 200) {
            info.id = res.data.data.id;
            if (this.materialType === 'video') {
              this.choosedMaterials.push(info);
              Bus.$emit('doMaterials', this.choosedMaterials);
              this.initWebSocket('file_id', res.data.data.id);
              this.handleCheckTranscode(res.data.data.id);
            }
            this.$emit('afterStore');
          } else {
            this.$Message.error(res.data.msg);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    },
    // 采用socket通信来获取封面抽帧 library|local|online
    initWebSocket(ident_type, ident) {
      let _this = this;
      let websocketPath = WebsocketUrl + '/socket.io ';
      _this.ws = new WebSocket(websocketPath);
      let ws = _this.ws;
      if ('WebSocket' in window) {
        ws.onopen = function() {
          //当WebSocket创建成功时，触发onopen事件
          let item = {
            type: 'receive',
            version: '2.00',
            request: {
              ident_type: ident_type,
              ident: ident,
            },
          };
          ws.send(JSON.stringify(item)); //将消息发送到服务端
          _this.cutTUrls = [];
          _this.wsInterval = setInterval(_this.intervalSend, 45000);
        };
        ws.onmessage = function(e) {
          //当客户端收到服务端发来的消息时，触发onmessage事件，参数e.data包含server传递过来的数据
          let data = JSON.parse(e.data);
          switch (data.type) {
            case 'init':
              break;
            case 'reply':
              console.log(data.data);
              break;
            case 'push':
              // 生成10张抽帧图片
              _this.cutTUrls = data.data.urls.concat(_this.cutTUrls);
              break;
          }
        };
        ws.onclose = function(e) {
          //当客户端收到服务端发送的关闭连接请求时，触发onclose事件
          console.log(e);
          console.log('close');
        };
        ws.onerror = function(e) {
          //如果出现连接、处理、接收、发送数据失败的时候触发onerror事件
          console.log(e);
        };
      } else {
        console.log('您的浏览器不支持WebSocket');
      }
    },
    intervalSend() {
      let item = {
        type: 'ping',
      };
      this.ws.send(JSON.stringify(item));
    },
    //判断是否需要转码
    handleCheckTranscode(id) {
      checkIsTranscode()
        .then((res) => {
          let mSwitch = res.data.data.switch;
          if (mSwitch) {
            this.$emit('start_transcode', id);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    },
    // 视频插入 预览
    previewVideo() {
      let isHttps = this.uploadVideoUrl.substr(0, 5) == 'https';
      let reasonableKey = this.uploadVideoUrl.includes('iqilu.com');
      if (!isHttps || !reasonableKey) {
        this.$Message.error('出于系统安全性考虑，请填写本网站下https协议视频');
        return;
      }

      // 正常预览
      let item = {
        url: this.uploadVideoUrl,
      };
      this.choosedMaterials[0] = item;
      this.showPreview = true;
      this.initWebSocket('url', this.uploadVideoUrl);
      Bus.$emit('doMaterials', this.choosedMaterials);
    },
  },
};
</script>

<style lang="less" scoped>
.cutPageDom {
  text-align: center;
  margin-top: 15px;
}
.setVideoByPath {
  text-align: center;
  video {
    max-height: 400px;
  }
}
</style>
