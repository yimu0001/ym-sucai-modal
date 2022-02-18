<!--
 * @Author: your name
 * @Date: 2020-07-23 10:38:24
 * @LastEditTime: 2022-02-18 16:51:28
 * @LastEditors: 赵婷婷
 * @Description: In User Settings Edit
 * @FilePath: \sucai-modal\src\components\sucai-modal.vue
-->
<template>
  <Modal
    v-model="modal"
    :title="sucaiTypeObj[type] || '文件上传'"
    width="970px"
    :mask-closable="false"
    :closable="false"
    @on-visible-change="changeShow"
  >
    <all-tabs
      ref="allTabs"
      :modalKey="modal"
      :tabOptions="tabOptions"
      :type="materialType"
      :fileLimit="fileLimit"
      :from="from"
      :highLimit="highLimit"
      :articleImages="articleImages"
      @start_transcode="start_transcode"
      @beforeStore="beforeStore"
      @afterStore="afterStore"
    />
    <div slot="footer">
      <Button @click="handleCancel">取消</Button>
      <Button type="primary" @click="handleOk" :loading="storeLoading">{{ confirmBtnText }}</Button>
    </div>
  </Modal>
</template>

<script>
import AllTabs from './AllTabs';
import Bus from '@/libs/bus';
import { SUCAI_TYPE_MAP } from '@/libs/constant';
import { checkIsTranscode } from '@/api/data';
import Cookies from 'js-cookie';

export default {
  name: 'sucaiModal',
  props: {
    modalKey: {
      type: Boolean,
      default: false,
    },
    tabOptions: {
      type: Array,
      default: ['library', 'local'],
    },
    type: {
      type: String,
      default: 'image',
    },
    env: {
      type: String,
      default: 'prod', // prod | test
    },
    fileLimit: {
      type: Number,
      default: 1,
    },
    from: {
      type: String,
      default: 'article',
    },
    high_code_rate_limit: {
      type: String | Number,
      default: '0',
    },
    articleImages: {
      type: Array,
      default: [],
    },
    // type===video时生效
    withCover: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      modal: false,
      choosedMaterials: [],
      materialType: this.type,
      showComs: false,
      storeLoading: false,
      sucaiTypeObj: SUCAI_TYPE_MAP,
      highLimit: this.high_code_rate_limit,
    };
  },
  components: {
    AllTabs,
  },
  watch: {
    modalKey() {
      this.modal = this.modalKey;
    },
    high_code_rate_limit() {
      this.highLimit = String(this.high_code_rate_limit);
    },
    type() {
      this.materialType = this.type;
    },
    env: {
      immediate: true,
      handler(val) {
        Bus.$emit('setEnv', val);
      },
    },
  },
  computed: {
    confirmBtnText() {
      let text = '确定';
      if (this.materialType == 'video' && this.withCover) {
        text = '添加封面';
      }

      return text;
    },
  },
  mounted() {
    // 各个不同tab下 选中的素材列表
    Bus.$on('doMaterials', (list) => {
      this.choosedMaterials = list;
    });
  },
  methods: {
    handleOk() {
      if (this.choosedMaterials.length === 0) {
        this.$Message.error('请选择素材！');
        return false;
      }

      if (this.materialType == 'video') {
        if (this.withCover) {
          this.$emit('chooseVideoOk', this.choosedMaterials);
          this.handleCheckTranscode(this.choosedMaterials[0].id);
          this.materialType = 'coverImg';
          this.choosedMaterials = [];
          this.$refs.allTabs.onOpenModal('image');
          return;
        }

        this.$emit('chooseVideoOk', this.choosedMaterials);
      } else if (this.materialType == 'coverImg') {
        this.$emit('chooseCoverOk', this.choosedMaterials);
        this.choosedMaterials = [];
      } else {
        this.$emit('handleMaterialModalOk', this.choosedMaterials);
        this.choosedMaterials = [];
      }
    },
    handleCancel() {
      this.$emit('handleMaterialModalCancle');
    },
    changeShow(status) {
      if (status) {
        this.materialType = this.type;
        this.$refs.allTabs.onOpenModal(this.type);
      } else {
        this.$refs.allTabs.onCloseModal();
      }
    },
    start_transcode(id) {},
    //判断是否需要转码
    handleCheckTranscode(id) {
      checkIsTranscode()
        .then((res) => {
          let mSwitch = res.data.data.switch;
          if (mSwitch) {
            // 不规范
            let orgId = Cookies.get('orgId');
            if (orgId && orgId == '10339' && this.highLimit === '0') {
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
    beforeStore() {
      this.storeLoading = true;
    },
    afterStore() {
      this.storeLoading = false;
    },
  },
};
</script>

<style lang="less" scoped></style>
