<!--
 * @Author: your name
 * @Date: 2020-08-18 14:33:28
 * @LastEditTime: 2020-08-24 11:02:01
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \ym-sucai-modal\src\components\coverList.vue
-->
<template>
  <div>
      <div class="coverDom">
        <div span='6' v-for="(item, index) of coverList" :key="index" class="coverItem">
          <div class="materialItemBox" @click="chooseItemCheck(index)">
            <i class="materialItemThumb" :style="getThumb(item)"></i>
            <img src="../assets/choosed.png" class="choosed_logo" v-if="item.choosed">
            <img src="../assets/noChoosed.png" class="choosed_logo" v-else>
          </div>
          <div class="materialItemInfo">
            <div class="materialItemTitle">{{item.name}}</div>
            <div class="materialItemMore">
              <span>{{item.width}}*{{item.height}}</span>
              <span>{{getSize(item.size)}}</span>
            </div>
          </div>
        </div>
      </div>
  </div>
</template>

<script>
import {renderSize} from '@/libs/util.js';
import config from '@/config'
import Bus from '../libs/bus'
import { Message } from 'view-design'
import 'view-design/dist/styles/iview.css';
  export default {
    name: 'CoverList',
    props: {
      list: {
        type: Array,
        default: []
      },
    },
    components: {
      Message,
    },
    watch: {
      list() {
        this.coverList = this.list
      },
      
    },
    mounted () {
      Bus.$on('closeModal', () => {
        this.choosedCover = []
        this.list = []
      });
    },
    data() {
      return {
        coverList: this.list,
        choosedCover: []
      }
    },
    computed: {
      chooseNum(){
        return this.choosedCover.length
      }
    },
    methods: {
      getSize: item => renderSize(item),
      getThumb(item) {
        return 'backgroundImage:url(' + item.url + ')'
      },
      chooseItemCheck(index) {
        let item = this.coverList[index]
        console.log(item)
        let _this = this;
        let choosed = _this.coverList[index].choosed? true: false
        if(!choosed) {
          console.log(_this.chooseNum)
          if(_this.chooseNum >= 1){
            Message.error("已选封面已超过1张！")
          } else {
            _this.$set(_this.coverList[index], 'choosed', true)
            _this.choosedCover.push(item)
            Bus.$emit('doMaterials', _this.choosedCover)
          }
        } else {
          _this.$set(_this.coverList[index], 'choosed', false)
          _this.choosedCover = []
          Bus.$emit('doMaterials', _this.choosedCover)
        }
      },
    },
  }
</script>

<style lang="less" scoped>
.coverDom{
  height: 400px;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  .coverItem{
    width: 19%;
    .materialItemBox{
    background-color: #f1f3f5;
    height: 130px;
    position: relative;
    .choosed_logo{
      width: 20px;
      height: 20px;
      position: absolute;
      right: 10px;
      top: 10px;
    }
    .materialItemThumb{
      display: block;
      height: 0;
      padding-bottom: 80%;
      background-size: contain;
      background-position: center center;
      background-repeat: no-repeat;
      border-radius: 3px;
      overflow: hidden;
    }
  }
  .materialItemInfo{
    width: 100%;
    margin-bottom: 15px;
    .materialItemTitle{
      width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      word-break: none;
      font-size: 16px;
      margin-top: 5px;
    }
    .materialItemMore{
      color: #999;
      font-size: 14px;
      span{
        margin-right: 10px;
      }
    }
  }
  }
}

</style>