<!--
 * @Author: your name
 * @Date: 2020-07-23 11:54:45
 * @LastEditTime: 2020-08-14 14:41:45
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \sucai-modal\src\components\modal-tabs\image-tabs.vue
--> 
<template>
  <div>
    <Tabs :value="materialVal" @on-click='handleClickTabs'>
      <TabPane label="素材库" name="materialVal1">
        <sucai-list :list='sucaiList' :maxNum='fileLimitNum' @chooseFolder= 'chooseFolder' :baseUrl='baseUrl'></sucai-list>
        <Row>
          <i-col offset='5' class="cutPageDom" span='18'>
            <Page :total="total" show-elevator @on-change='changePage'/>
          </i-col>
        </Row>
      </TabPane>
      <TabPane label="本地库" name="materialVal2">
        <vue-uploader
          :url="uploadUrl"
          :fileNumLimit="fileLimitNum"
          @error="uploadOnImgError"
          @success="uploadOnImgSuccess"
          @remove="uploadOnImgRemove"
          @uploadError="uploadImgError"
          :accept="type"
          compress="false"
          v-if="materialVal == 'materialVal2' && modal"
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
            <video :src="choosedMaterials[0]" controls class="setVideoShow"></video>
          </div>
        </div>
      </TabPane>
      <!-- <TabPane label="抽帧图片" name="materialVal4" v-if="type == 'coverImg'">
        <sucai-list :list='sucaiList' :maxNum='1'></sucai-list>
      </TabPane> -->
    </Tabs>
  </div>
</template>

<script>
import { getFileList } from '@/api/data'
import SucaiList from './sucaiList'
import VueUploader from "_c/vueuploader/index.js";
import { Tabs, TabPane, Row, Col, Input, Page, Dropdown, DropdownItem, DropdownMenu, Icon } from 'view-design';
import 'view-design/dist/styles/iview.css';
import Bus from '../libs/bus'
  export default {
    name: 'imageTabs',
    props: {
      fileLimitNum: {
        type: Number,
        default: 1
      },
      type: {
        required: true,
        type: String,
        // default: 'image'
      },
      modalKey: {
        type: Boolean,
        default: false
      },
      baseUrl: {
        type: String
      }
    },
    watch: {
      type() {
        this.materialType = this.type
        if(this.type == 'coverImg'){ this.materialType = 'image'}
        this.materialVal = 'materialVal1'
        this.choosedMaterials = []
        this.getFileList()
      },
      modalKey() {
        this.modal = this.modalKey
      },
      materialVal() {
        this.page =1;
        this.choosedMaterials = []
      }
    },
    components: {
      SucaiList,
      VueUploader,
      Tabs, TabPane, [Row.name]: Row,  [Col.name]: Col, Input, Page, [Dropdown.name]: Dropdown, DropdownItem, [DropdownMenu.name]: DropdownMenu, Icon
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
        modal: false,
        uploadVideoUrl: '',
        showPreview: false,
        materialType: this.type,
        uploadUrl: this.baseUrl+'/upload/chunked'
      }
    },
    mounted () {
      // console.log(12222)
      // this.getFileList();
      Bus.$on('openModal', ()=> {
        this.sucaiList = []
        this.path_id = 0
        this.getFileList()
        this.choosedMaterials = []
      })
    },
    methods: {
      getFileList() {
        getFileList(this.baseUrl, this.materialType, this.path_id, this.num, this.page).then(res => {
          res.data.data.rows.forEach(sucai => {
            sucai.choosed = false
          })
          this.sucaiList = res.data.data.rows;
          this.total = Number(res.data.data.total)
        }).catch(err => {
          console.log(err)
        })
      },
      changePage(currentPage) {
        this.page = currentPage;
        this.getFileList()
      },
      handleClickTabs(name) {
        this.materialVal = name
      },
      chooseFolder(path_id) {
        this.path_id = path_id;
        this.page = 1;
        this.getFileList()
      },
      // 图片文件上传
      uploadOnImgError(errorMessage) {
        this.$Message.error(errorMessage)
      },
      uploadOnImgSuccess(res, data) {
        let info = data.data
        this.choosedMaterials.push(info)
        if(info){
          Bus.$emit('doMaterials', this.choosedMaterials)
        }
      },
      uploadOnImgRemove(file, index) {
        this.choosedMaterials.splice(index, 1)
        Bus.$emit('doMaterials', this.choosedMaterials)
      },
      uploadImgError(errorMessage) {
        console.log(errorMessage)
      },
      // 视频插入预览
      previewVideo() {
        let item = {
          url: this.uploadVideoUrl
        }
        this.choosedMaterials[0] = item;
        this.showPreview = true
        Bus.$emit('doMaterials', this.choosedMaterials)
      },
    },
  }
</script>

<style lang="less" scoped>
.cutPageDom{
  text-align: center;
  margin-top: 15px;
}
.setVideoByPath{
  text-align: center;
  video{
    max-height: 400px;
  }
}
</style>