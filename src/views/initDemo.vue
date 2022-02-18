<!--
 * @Author: your name
 * @Date: 2020-07-23 09:48:43
 * @LastEditTime: 2022-02-18 16:44:52
 * @LastEditors: 赵婷婷
 * @Description: In User Settings Edit
 * @FilePath: \sucai-modal\src\views\Home.vue
-->
<template>
  <div class="home">
    <button @click="openModal('image')">打开图片modal</button>
    <button @click="openModal('video')">打开视频modal</button>
    <button @click="openModal('voice')">打开音频modal</button>
    <button @click="openModal('transcodeVideo')">打开转码modal</button>
    <div>
      <Checkbox v-model="videoHighLimit">素材可在电视播出</Checkbox>
    </div>
    <h2>已选选项</h2>
    <div class="formItem">
      <div v-for="(item, index) of choosedMaterials" :key="index">{{ item.url }}</div>
    </div>
    <div v-if="videoUrl !== '' && coverUrl !== ''" class="video-test">
      视频预览
      <video :poster="coverUrl" :src="videoUrl" controls="controls"></video>
    </div>
    <!-- onlyChooseVideo -->
    <sucai-modal
      :modalKey="modalKey"
      @handleMaterialModalOk="handleModalOk"
      :fileLimitNum="fileLimitNum"
      @handleMaterialModalCancle="handleModalCancle"
      :type="type"
      @chooseVideoOk="chooseVideoOk"
      :from="materialFrom"
      @chooseCoverOk="chooseCoverOk"
      :high_code_rate_limit="highLimit"
      websocketUrl="wss://shandianyun-sck.iqilu.com/"
      :showPictureOfArticle="showPictureOfArticle"
    ></sucai-modal>
  </div>
</template>

<script>
// @ is an alias to /src
import SucaiModal from '@/components.init/sucai-modal.vue';
import { Checkbox } from 'iview';
export default {
  name: 'Home',
  components: {
    SucaiModal,
    Checkbox,
  },
  data() {
    return {
      modalKey: false,
      type: '',
      choosedMaterials: [],
      fileLimitNum: 1,
      videoHighLimit: false,
      showPictureOfArticle: false,
      videoUrl: '',
      coverUrl: '',
      materialFrom: 'article',
    };
  },
  computed: {
    highLimit() {
      return this.videoHighLimit ? '1' : '0';
    },
  },
  mounted() {},
  methods: {
    openModal(type) {
      if (type == 'image') {
        this.fileLimitNum = 10;
        this.showPictureOfArticle = true;
      } else if (type == 'transcodeVideo') {
        this.materialFrom = 'notSave';
      }
      this.type = type;
      this.modalKey = true;
    },
    handleModalOk(list) {
      this.choosedMaterials = list;
      this.modalKey = false;
    },
    handleModalCancle() {
      this.modalKey = false;
    },
    chooseVideoOk(list) {
      console.log('chooseVideo', list);
      this.videoUrl = list[0].url;
      // this.modalKey = false;
    },
    chooseCoverOk(list) {
      console.log('chooseCover', list);
      this.coverUrl = list[0].url;
      this.modalKey = false;
    },
  },
};
</script>

<style scoped>
.video-test {
  width: 700px;
  height: 700px;
}
.video-test video {
  width: 100%;
  height: auto;
}
</style>
