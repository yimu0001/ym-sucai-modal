<!--
 * @Author: your name
 * @Date: 2020-07-23 10:38:24
 * @LastEditTime: 2022-02-17 10:00:30
 * @LastEditors: 赵婷婷
 * @Description: In User Settings Edit
 * @FilePath: \sucai-modal\src\components\sucai-modal.vue
-->
<template>
  <div>
    <Modal
      v-model="modal"
      :title="`${typeName}`"
      width="970px"
      :mask-closable="false"
      :closable="false"
      @on-visible-change="changeShow"
    >
      <div>
        <material-tabs
          ref="materialTabs"
          :type="materialType"
          :fileLimitNum="fileLimitNum"
          :modalKey="modal"
          :from="from"
          :websocketUrl="websocketUrl"
          :highLimit="m_high_code_rate_limit"
          @start_transcode="start_transcode"
          :showPictureOfArticle="articleCover"
          @beforeSaveToStore="beforeSaveToStore"
          @afterSaveToStore="afterSaveToStore"
        >
        </material-tabs>
      </div>
      <div slot="footer">
        <Button @click="cancel">取消</Button>
        <Button type="primary" @click="ok" :loading="buttonLoading">{{
          materialType == 'video' && !onlyChooseVideo ? '添加封面' : '确定'
        }}</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import MaterialTabs from './material-tabs';

import config from '@/config';
import Bus from '../libs/bus';
import { checkIsTranscode } from '@/api/data';
import Cookies from 'js-cookie';
export default {
  name: 'sucaiModal',
  props: {
    type: {
      type: String,
      default: 'image',
    },
    modalKey: {
      type: Boolean,
      default: false,
    },
    fileLimitNum: {
      type: Number,
      default: 1,
    },
    from: {
      type: String,
      default: 'article',
    },
    websocketUrl: {
      type: String,
      default: 'wss://sucai.shandian.design/',
    },
    high_code_rate_limit: {
      type: String | Number,
      default: '0',
    },
    showPictureOfArticle: {
      type: Boolean,
      default: false,
    },
    onlyChooseVideo: {
      type: Boolean,
      default: false,
    },
  },
  watch: {
    modalKey() {
      this.modal = this.modalKey;
    },
    type() {
      this.materialType = this.type;
    },
    high_code_rate_limit() {
      this.m_high_code_rate_limit = this.high_code_rate_limit;
    },
    showPictureOfArticle() {
      this.articleCover = this.showPictureOfArticle;
    },
  },
  components: {
    MaterialTabs,
  },
  data() {
    return {
      modal: false,
      tabsMenu: {
        image: [
          { index: 1, title: '素材库' },
          { index: 2, title: '本地库' },
        ],
        video: [
          { index: 1, title: '素材库' },
          { index: 2, title: '本地库' },
          { index: 3, title: '插入视频' },
        ],
        voice: [
          { index: 1, title: '素材库' },
          { index: 2, title: '本地库' },
        ],
      },
      choosedMaterials: [],
      materialType: this.type,
      m_high_code_rate_limit: this.high_code_rate_limit,
      showComs: false,
      articleCover: this.showPictureOfArticle,
      buttonLoading: false,
    };
  },
  computed: {
    typeName() {
      let mtypeName = '';
      switch (this.materialType) {
        case 'image':
          mtypeName = '图片素材选择';
          break;
        case 'video':
          mtypeName = '视频素材选择';
          break;
        case 'voice':
          mtypeName = '音频素材选择';
          break;
        case 'coverImg':
          mtypeName = '封面选择';
          break;
        case 'transcodeVideo':
          mtypeName = '转码视频选择';
          break;
      }
      return mtypeName;
    },
  },
  mounted() {
    let vm = this;
    Bus.$on('doMaterials', (list) => {
      console.log('modal', list);
      this.choosedMaterials = list;
    });
  },
  methods: {
    ok() {
      if (this.choosedMaterials.length === 0) {
        this.$Message.error('请选择素材！');
        return false;
      }
      if (this.materialType == 'video') {
        if (this.onlyChooseVideo) {
          this.$emit('chooseVideoOk', this.choosedMaterials);
        } else {
          this.$emit('chooseVideoOk', this.choosedMaterials);
          this.checkIsTranscode(this.choosedMaterials[0].id);
          this.materialType = 'coverImg';
          this.choosedMaterials = [];
          let params = { type: 'image', highLimit: this.high_code_rate_limit };
          // Bus.$emit('openModal', params);
          this.$refs.materialTabs.watchOpenModal('image', this.high_code_rate_limit);
        }
      } else if (this.materialType == 'coverImg') {
        this.$emit('chooseCoverOk', this.choosedMaterials);
        this.choosedMaterials = [];
      } else {
        this.$emit('handleMaterialModalOk', this.choosedMaterials);
        this.choosedMaterials = [];
      }
    },
    cancel() {
      this.$emit('handleMaterialModalCancle');
    },
    changeShow(status) {
      if (status) {
        this.materialType = this.type;
        let params = { type: this.type, highLimit: this.high_code_rate_limit };
        // Bus.$emit('openModal', params);
        console.log(this.articleCover);
        this.$refs.materialTabs.watchOpenModal(this.type, this.high_code_rate_limit);
      } else {
        this.$refs.materialTabs.watchCloseModal(this.type, this.high_code_rate_limit);
        // Bus.$emit('closeModal');
      }
    },
    start_transcode(id) {
      // let orgId = Cookies.get('orgId')
      // if(orgId && orgId == '10339' && this.high_code_rate_limit == '0'){
      //   console.log('这是融媒体,并且没开电视播放，不转码')
      // } else {
      //   this.$emit('start_transcode', id);
      // }
    },
    checkIsTranscode(id) {
      checkIsTranscode()
        .then((res) => {
          let mSwitch = res.data.data.switch;
          if (mSwitch) {
            let orgId = Cookies.get('orgId');
            if (orgId && orgId == '10339' && this.high_code_rate_limit == '0') {
              console.log('这是融媒体,并且没开电视播放，不转码');
            } else {
              this.$emit('start_transcode', id);
            }
          }
        })
        .catch((err) => {
          console.log(err);
        });
    },
    beforeSaveToStore() {
      this.buttonLoading = true;
    },
    afterSaveToStore() {
      this.buttonLoading = false;
    },
  },
};
</script>

<style lang="less" scoped></style>
