<!--
 * @Author: your name
 * @Date: 2020-07-23 11:54:45
 * @LastEditTime: 2020-12-10 14:32:38
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \sucai-modal\src\components\modal-tabs\image-tabs.vue
-->
<template>
  <div>
    <Tabs :value="materialVal" @on-click="handleClickTabs">
      <TabPane label="素材库" name="materialVal1">
        <sucai-list
          :list="sucaiList"
          :maxNum="fileLimitNum"
          @chooseFolder="chooseFolder"
          :baseUrl="baseUrl"
          :type="materialType"
          :websocketUrl="websocketUrl"
          @cutTimePic="cutTimePic"
        ></sucai-list>
        <Row>
          <i-col offset="5" class="cutPageDom" span="18">
            <Page :total="total" show-elevator @on-change="changePage" :page-size= '8' />
          </i-col>
        </Row>
      </TabPane>
      <TabPane label="本地库" name="materialVal2">
        <vue-uploader
          :url="uploadUrl"
          :baseUrl='baseUrl'
          :fileNumLimit="fileLimitNum"
          @error="uploadOnImgError"
          @success="uploadOnSuccess"
          @remove="uploadOnImgRemove"
          @uploadError="uploadImgError"
          :accept="materialType"
          :highLimit='highLimit'
          compress="false"
          ref="vueUploader"
          v-if="materialVal === 'materialVal2' && baseUrl != '' && modal"
        ></vue-uploader>
      </TabPane>
      <TabPane label="插入视频" name="materialVal3" v-if="type == 'video'">
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
      <TabPane label="抽帧图片" name="materialVal4" v-if="type == 'coverImg'">
        <CoverList :list="cutTUrls"></CoverList>
      </TabPane>
    </Tabs>
  </div>
</template>

<script>
import { getFileList, saveFileToStore, checkIsTranscode } from '@/api/data';
import SucaiList from './sucaiList';
import CoverList from './coverList';
import VueUploader from '_c/vueuploader/index.js';
import {
  Tabs,
  TabPane,
  Row,
  Col,
  Input,
  Page,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  Icon,
  Message,
} from 'view-design';
// import 'view-design/dist/styles/iview.css';
import '@/index.less';
import Bus from '../libs/bus';
export default {
  name: 'imageTabs',
  props: {
    fileLimitNum: {
      type: Number,
      default: 1,
    },
    type: {
      required: true,
      type: String,
      // default: 'image'
    },
    modalKey: {
      type: Boolean,
      default: false,
    },
    baseUrl: {
      type: String,
    },
    from: {
      type: String,
      required: true,
    },
    websocketUrl: {
      type: String,
      default: 'wss://sucai.shandian.design/',
    },
    highLimit:{
      type: String | Number,
      default: '0'
    }
  },
  watch: {
    type() {
      this.materialType = this.type;
      if (this.type == 'coverImg') {
        this.materialType = 'image';
      }
      this.materialVal = 'materialVal1';
      this.choosedMaterials = [];
      this.uploadVideoUrl = '';
      this.showPreview = false;
    },
    materialVal() {
      this.page = 1;
      this.choosedMaterials = [];
      this.uploadVideoUrl = '';
      this.showPreview = false;
    },
    baseUrl() {
      console.log(this.baseUrl)
    },
    modalKey() {
      this.modal = this.modalKey
    },
  },
  components: {
    SucaiList,
    CoverList,
    VueUploader,
    Tabs,
    TabPane,
    [Row.name]: Row,
    [Col.name]: Col,
    Input,
    Page,
    [Dropdown.name]: Dropdown,
    DropdownItem,
    [DropdownMenu.name]: DropdownMenu,
    Icon,
    Message,
  },
  data() {
    return {
      materialVal: 'materialVal1',
      num: 8,
      page: 1,
      total: 0,
      sucaiList: [],
      path_id: 0,
      choosedMaterials: [],
      modal: this.modalKey,
      uploadVideoUrl: '',
      showPreview: false,
      materialType: this.type,
      uploadUrl: this.baseUrl + 'upload/chunk-resume/process',
      ws: null, //webSocket所用
      wsInterval: undefined,
      cutTUrls: [],
      ws_transcode: null, //webSocket所用
      wsInterval_transcode: undefined,
    };
  },
  mounted() {
    Bus.$on('openModal', (args) => {
      this.sucaiList = [];
      this.path_id = 0;
      this.materialType = args.type;
      this.materialVal = 'materialVal1';
      this.getFileList(args.highLimit);
      this.choosedMaterials = [];
    });
    Bus.$on('closeModal', () => {
      this.choosedMaterials = [];
      this.cutTUrls = [];
      clearInterval(this.wsInterval);
      clearInterval(this.wsInterval_transcode);
      this.$refs.vueUploader && this.$refs.vueUploader.destroy()
      if (this.ws) {
        this.ws.close();
      }
    });
  },
  methods: {
    getFileList(highLimit) {
      getFileList(this.baseUrl, this.materialType, this.path_id, this.num, this.page, highLimit)
        .then((res) => {
          res.data.data.rows.forEach((sucai) => {
            sucai.choosed = false;
          });
          this.sucaiList = res.data.data.rows;
          this.total = Number(res.data.data.total);
        })
        .catch((err) => {
          console.log(err);
        });
    },
    changePage(currentPage) {
      this.page = currentPage;
      this.getFileList(this.highLimit);
    },
    handleClickTabs(name) {
      this.materialVal = name;
    },
    chooseFolder(path_id) {
      this.path_id = path_id;
      this.page = 1;
      this.getFileList(this.highLimit);
    },
    // 文件上传
    uploadOnImgError(errorMessage) {
      Message.error(errorMessage);
    },
    uploadOnSuccess(res, data) {
      let extra = data.data.data;
      console.log(extra)
      if (extra) {
        if (extra.url) {
          if (this.materialType !== 'video') {
            this.choosedMaterials.push(extra);
            Bus.$emit('doMaterials', this.choosedMaterials);
          }
          this.saveFileToStore(extra);
        } else {
          Message.error('上传失败！');
        }
      }
    },
    saveFileToStore(info) {
      saveFileToStore(this.baseUrl, this.materialType, info.url, this.from, this.highLimit)
        .then((res) => {
          if (res.status === 200) {
            info.id = res.data.data.id;
            if (this.materialType === 'video') {
              this.choosedMaterials.push(info);
              Bus.$emit('doMaterials', this.choosedMaterials);
              this.initWebSocket('file_id', res.data.data.id);
              this.checkIsTranscode(res.data.data.id);
            }
          } else {
            Message.error(res.data.msg);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    },
    //采用socket通信来获取封面抽帧
    initWebSocket(ident_type, ident) {
      let _this = this;
      let websocketPath = _this.websocketUrl + 'socket.io ';
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
              ident : ident
            }
          };
          ws.send(JSON.stringify(item)); //将消息发送到服务端
          _this.wsInterval = setInterval(() => {
            _this.intervalSend();
          }, 45000);
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
              _this.cutTUrls = _this.cutTUrls.concat(data.data.urls);
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
    checkIsTranscode(id) {
      checkIsTranscode(this.baseUrl)
        .then((res) => {
          let mSwitch = res.data.data.switch;
          if (mSwitch) {
            // this.initTranscodeWs(id)
            this.$emit('start_transcode', id);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    },
    initTranscodeWs(id) {
      let _this = this;
      let websocketPath = _this.websocketUrl + 'socket/video/transcode';
      _this.ws_transcode = new WebSocket(websocketPath);
      let ws_transcode = _this.ws_transcode;
      if ('WebSocket' in window) {
        ws_transcode.onopen = function() {
          //当WebSocket创建成功时，触发onopen事件
          let item = {
            type: 'receive',
            file_id: id,
          };
          ws_transcode.send(JSON.stringify(item)); //将消息发送到服务端
          _this.wsInterval_transcode = setInterval(() => {
            _this.intervalSend_transcode();
          }, 45000);
        };
        ws_transcode.onmessage = function(e) {
          //当客户端收到服务端发来的消息时，触发onmessage事件，参数e.data包含server传递过来的数据
          let data = JSON.parse(e.data);
          switch (data.type) {
            case 'init':
              break;
            case 'reply':
              console.log(data.data);
              break;
            case 'push':
              console.log('push', data.data);
              _this.$emit('transcodeSuccess', data.data);
              break;
            case 'un_identify':
              break;
          }
        };
        ws_transcode.onclose = function(e) {
          //当客户端收到服务端发送的关闭连接请求时，触发onclose事件
          console.log(e);
          console.log('trans_code close');
        };
        ws_transcode.onerror = function(e) {
          //如果出现连接、处理、接收、发送数据失败的时候触发onerror事件
          console.log(e);
        };
      } else {
        console.log('您的浏览器不支持WebSocket');
      }
    },
    intervalSend_transcode() {
      let item = {
        type: 'ping',
      };
      this.ws_transcode.send(JSON.stringify(item));
    },
    uploadOnImgRemove(file, index) {
      this.choosedMaterials.splice(index, 1);
      Bus.$emit('doMaterials', this.choosedMaterials);
      this.ws && this.ws.close()
      clearInterval(this.wsInterval)
      this.cutTUrls = [];
    },
    uploadImgError(errorMessage) {
      console.log(errorMessage);
    },
    // 视频插入预览
    previewVideo() {
      let isHttps = /^https:\/\/.*/i.test(this.uploadVideoUrl);
      if (isHttps) {
        let item = {
          url: this.uploadVideoUrl,
        };
        this.choosedMaterials[0] = item;
        this.showPreview = true;
        this.initWebSocket('url', this.uploadVideoUrl);
        Bus.$emit('doMaterials', this.choosedMaterials);
      } else {
        Message.error('请填写https协议视频');
      }
    },
    //素材库选中 获取抽帧
    cutTimePic(list) {
      this.cutTUrls = this.cutTUrls.concat(list);
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
