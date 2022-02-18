<!--
 * @文件描述: 
 * @公司: 广电信通
 * @作者: 赵婷婷
 * @Date: 2022-02-16 17:32:26
 * @LastEditors: 赵婷婷
 * @LastEditTime: 2022-02-18 16:49:50
-->
<template>
  <div class="home-page">
    <Button @click="openModal('image')">打开图片modal</Button>&ensp;
    <Button @click="openModal('video')">打开视频modal</Button>&ensp;
    <Button @click="openModal('voice')">打开音频modal</Button>&ensp;
    <Button @click="openModal('coverImg')">打开封面modal</Button>&ensp;
    <Button @click="openModal('transcodeVideo')">打开转码modal</Button>&ensp;

    <br /><br />
    <div>
      <Checkbox v-model="videoHighLimit">素材可在电视播出</Checkbox>
    </div>
    <br />
    <h2>已选选项</h2>
    <div class="formItem">
      <div v-for="(item, index) of choosedMaterials" :key="index">{{ item.url }}</div>
    </div>
    <div v-if="videoUrl !== '' && coverUrl !== ''" class="video-test">
      视频预览
      <video :poster="coverUrl" :src="videoUrl" controls="controls"></video>
    </div>

    <sucai-modal
      :modalKey="modalKey"
      :tabOptions="tabOptions"
      :type="type"
      :env="env"
      :fileLimit="fileLimit"
      :from="materialFrom"
      :high_code_rate_limit="highLimit"
      :articleImages="articleImages"
      :withCover="withCover"
      @chooseVideoOk="chooseVideoOk"
      @chooseCoverOk="chooseCoverOk"
      @handleMaterialModalOk="handleModalOk"
      @handleMaterialModalCancle="handleModalCancle"
    ></sucai-modal>
  </div>
</template>

<script>
// @ is an alias to /src
import { Checkbox } from 'iview';
import SucaiModal from '@/components/SucaiModal.vue';

export default {
  name: 'Home',
  components: {
    Checkbox,
    SucaiModal,
  },
  data() {
    return {
      modalKey: false,
      tabOptions: ['library'], // , 'local'
      type: '',
      env: 'test',
      choosedMaterials: [],
      fileLimit: 1,
      videoHighLimit: false,
      articleImages: [
        'https://img12.shandian8.com/1/sucaiku/202202/16/c33806fae0de4c1b88fc6269c8490c6d.jpg',
      ],
      withCover: true,
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
        this.fileLimit = 10;
        this.showPictureInArticle = true;
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
.home-page {
  padding: 50px 0;
}
.video-test {
  width: 700px;
  height: 700px;
}
.video-test video {
  width: 100%;
  height: auto;
}
</style>
