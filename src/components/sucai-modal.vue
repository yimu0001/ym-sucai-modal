<!--
 * @Author: your name
 * @Date: 2020-07-23 10:38:24
 * @LastEditTime: 2020-08-19 16:52:09
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \sucai-modal\src\components\sucai-modal.vue
--> 
<template>
  <div>
    <Modal
        v-model="modal"
        :title= "`${typeName}`"
        width='970px'
        :mask-closable='false'
        :closable='false'
        @on-visible-change='changeShow'
        >
        <div>
           <material-tabs :type='materialType' :fileLimitNum='fileLimitNum' :modalKey='modal' :baseUrl='baseUrl' :from='from' :websocketUrl='websocketUrl' @start_transcode='start_transcode'> </material-tabs>
        </div>
        <div slot="footer">
          <Button @click="cancel">取消</Button>
          <Button type='primary' @click="ok">{{materialType == "video"? "添加封面":"确定"}}</Button>
        </div>
    </Modal>
  </div>
</template>

<script>
import MaterialTabs from './material-tabs'
import { Button, Modal, Message } from 'view-design';
import 'view-design/dist/styles/iview.css';
import config from '@/config'
import Bus from '../libs/bus'
  export default {
    name: 'sucaiModal',
    props: {
      type: {
        type: String,
        default: 'image' 
      },
      modalKey: {
        type: Boolean,
        default: false
      },
      fileLimitNum: {
        type: Number,
        default: 1
      },
      baseUrl: {
        type: String,
        default: ''
      },
      from: {
        type: String,
        default: 'article'
      },
      websocketUrl: {
        type: String,
        default: 'wss://sucai.shandian.design/'
      }
    },
    watch: {
      modalKey() {
        this.modal = this.modalKey
      },
      type() {
        this.materialType = this.type
      },
      baseUrl() {
        config.baseUrl.pro = this.baseUrl
      }
    },
    components: {
      MaterialTabs,
      Button,
      Modal,
      Message
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
          ]
        },
        choosedMaterials: [],
        materialType: this.type,
      }
    },
    computed: {
      typeName() {
        let mtypeName = ''
        switch (this.materialType) {
          case 'image': 
            mtypeName = '图片素材选择'
            break
          case 'video':
            mtypeName = '视频素材选择'
            break
          case 'voice':
            mtypeName = '音频素材选择'
            break
          case 'coverImg': 
            mtypeName = '封面选择'
            break
        }
        return mtypeName
      }
    },
    mounted () {
      let vm = this
      Bus.$on('doMaterials', (list) => {
        this.choosedMaterials = list
      })
      config.baseUrl.pro = vm.baseUrl
    },
    methods: {
      ok() {
        if(this.materialType == 'video') {
          if(this.choosedMaterials.length == 0){
            Message.error('请选择视频!')
          } else {
            this.$emit('chooseVideoOk', this.choosedMaterials)
            this.materialType = 'coverImg'
            Bus.$emit('openModal', 'image')
          }
        } else if(this.materialType == 'coverImg'){
          this.$emit('chooseCoverOk', this.choosedMaterials)
        } else {
          this.$emit('handleMaterialModalOk', this.choosedMaterials)
        }
      },
      cancel() {
        this.$emit('handleMaterialModalCancle')
      },
      changeShow(status) {
        if(status) {
          this.materialType  = this.type;
          Bus.$emit('openModal', this.type)
        } else {
          Bus.$emit('closeModal')
        }
      },
      start_transcode(id){
        this.$emit('start_transcode', id)
      }
    },
  }
</script>

<style lang="less" scoped>

</style>