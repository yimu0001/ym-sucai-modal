<!--
 * @Author: your name
 * @Date: 2020-07-23 09:48:43
 * @LastEditTime: 2020-12-01 10:56:12
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \sucai-modal\src\views\Home.vue
--> 
<template>
  <div class="home">
    <button @click="openModal1('image')">打开图片modal</button>
    <button @click="openModal1('video')">打开视频modal</button>
    <button @click="openModal1('voice')">打开音频modal</button>
    <h2>已选选项</h2>
    <div class="formItem">
      <div v-for="(item, index) of choosedMaterials" :key="index">{{item.url}}</div>
    </div>
    <sucai-modal :modalKey = 'modalKey' @handleMaterialModalOk= 'handleModalOk' :fileLimitNum='fileLimitNum' @handleMaterialModalCancle = 'handleModalCancle' :type='type' 
    @chooseVideoOk="chooseVideoOk" :baseUrl='material_baseUrl'
    @chooseCoverOk = "chooseCoverOk" :high_code_rate_limit='highLimit'
    ></sucai-modal>
  </div>
</template>

<script>
// @ is an alias to /src
import SucaiModal from '@/components/sucai-modal.vue'
export default {
  name: 'Home',
  components: {
    SucaiModal
  },
  data() {
    return {
      modalKey: false,
      type: 'image',
      choosedMaterials: [],
      fileLimitNum: 1,
      baseUrl: 'https://sucai.shandian.design/',
      material_baseUrl: '',
      highLimit: '0'
    }
  },
  mounted () {
    if(process.env.NODE_ENV === 'development'){
      this.material_baseUrl = 'https://sucai.shandian.design/'
    } else {
      this.material_baseUrl = 'https://shandianyun-sck.iqilu.com/'
    };
  },
  methods: {
    openModal1(type) {
      this.baseUrl = 'https://sucai.shandian.design/'
      if(type == 'image'){
        this.fileLimitNum = 3
      }
      this.type = type
      this.modalKey = true
    },
    handleModalOk(list) {
      this.choosedMaterials = list
      this.modalKey = false
    },
    handleModalCancle() {
      this.modalKey = false
    },
    chooseVideoOk(list) {
      console.log('chooseVideo',list)
    },
    chooseCoverOk(list) {
      console.log('chooseCover', list)
      this.modalKey = false
    }
  },
}
</script>
