<!--
 * @Author: your name
 * @Date: 2020-08-18 14:33:28
 * @LastEditTime: 2022-02-18 16:51:44
 * @LastEditors: 赵婷婷
 * @Description: In User Settings Edit
 * @FilePath: \ym-sucai-modal\src\components\coverList.vue
-->
<template>
  <div>
    <div class="coverDom">
      <div span="6" v-for="(item, index) of infoList" :key="index" class="coverItem">
        <div
          class="materialItemBox"
          @click="chooseItemCheck(item, index)"
          @dblclick="previewImg(item)"
        >
          <i class="materialItemThumb" :style="getThumb(item)"></i>
          <img src="../assets/choosed.png" class="choosed_logo" v-if="item.choosed" />
          <img src="../assets/noChoosed.png" class="choosed_logo" v-else />
        </div>
        <div class="materialItemInfo">
          <div class="materialItemTitle">{{ item.name }}</div>
        </div>
      </div>
    </div>
    <div class="cutPageDom">
      <Page :total="total" show-elevator @on-change="handlePageChange" :page-size="pageSize" />
    </div>

    <Modal v-model="preview_value" width="60" class="preview-modal" title="抽帧封面预览">
      <img :src="preview_cover" />
    </Modal>
  </div>
</template>

<script>
import { renderSize } from '@/libs/util.js';
import Bus from '@/libs/bus';
import { BIG_PAGE_SIZE } from '@/libs/constant';

export default {
  name: 'CoverList',
  props: {
    articleImages: {
      type: Array,
      default: [],
    },
  },
  data() {
    return {
      choosedCover: [],
      preview_value: false,
      preview_cover: '',
      page: 1,
      pageSize: BIG_PAGE_SIZE,
      total: 0,
      allImageList: [],
      pageInfoObj: {},
      infoList: [],
    };
  },
  watch: {
    articleImages: {
      immediate: true,
      handler(arr) {
        this.allImageList = arr;
        this.setPicturesOfArticle();
      },
    },
  },
  computed: {
    chooseNum() {
      return this.choosedCover.length;
    },
  },
  mounted() {
    Bus.$on('closeModal', () => {
      this.choosedCover = [];
    });
  },
  methods: {
    getSize: (item) => renderSize(item),
    getThumb(item) {
      return 'backgroundImage:url(' + item.url + ')';
    },

    // 获取文章内图片总数
    setPicturesOfArticle() {
      this.page = 1;
      this.total = this.allImageList.length;
      this.pageInfoObj = this.cutPages();
      this.handlePageChange(this.page);
    },
    // 文章内图片页码改变
    handlePageChange(page = 1) {
      this.infoList = this.pageInfoObj[page] || [];
    },
    // 图片分页
    cutPages() {
      let info = {};
      this.allImageList.forEach((url, index) => {
        let page = parseInt(index / this.pageSize) + 1;
        if (!info[page]) {
          info[page] = [];
        }

        info[page].push({ name: `文章内图片${index + 1}`, choosed: false, url });
      });

      return info;
    },

    chooseItemCheck(item, index) {
      let chooseStatus = !item.choosed;
      if (chooseStatus && this.choosedCover.length >= 1) {
        this.$Message.error('已选封面已超过1张！');
        return;
      }

      this.$set(this.infoList[index], 'choosed', chooseStatus);
      if (chooseStatus) {
        this.choosedCover.push(item);
      } else {
        this.choosedCover = [];
      }

      Bus.$emit('doMaterials', this.choosedCover);
    },
    previewImg(item) {
      console.log(item);
      this.preview_cover = item.url;
      this.preview_value = true;
    },
    //清除选中态
    clearChoosed() {
      this.choosedCover = [];
    },
  },
};
</script>

<style lang="less" scoped>
.coverDom {
  // height: 400px;
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  .coverItem {
    width: 20%;
    padding: 0 1%;
    box-sizing: border-box;
    .materialItemBox {
      background-color: #f1f3f5;
      height: 130px;
      position: relative;
      .choosed_logo {
        width: 20px;
        height: 20px;
        position: absolute;
        right: 10px;
        top: 10px;
      }
      .materialItemThumb {
        display: block;
        height: 0;
        padding-bottom: 130px;
        background-size: contain;
        background-position: center center;
        background-repeat: no-repeat;
        border-radius: 3px;
        overflow: hidden;
      }
    }
    .materialItemInfo {
      width: 100%;
      margin: 10px 0;
      .materialItemTitle {
        width: 100%;
        height: 24px;
        overflow: hidden;
        text-overflow: ellipsis;
        word-break: none;
        font-size: 16px;
        margin-top: 5px;
      }
      .materialItemMore {
        color: #999;
        font-size: 14px;
        span {
          margin-right: 10px;
        }
      }
    }
  }
}
.cutPageDom {
  text-align: center;
  margin-top: 15px;
}
.preview-modal {
  text-align: center;
  img {
    width: 90%;
  }
}
</style>
