<!--
 * @Author: your name
 * @Date: 2020-07-23 14:51:28
 * @LastEditTime: 2022-02-18 16:19:04
 * @LastEditors: 赵婷婷
 * @Description: In User Settings Edit
 * @FilePath: \sucai-modal\src\components\sucaiList.vue
-->
<template>
  <div>
    <Row :gutter="20">
      <Col span="5">
        <Tree
          class="folder-tree"
          :data="foldersMenu"
          :load-data="getTreeFolders"
          @on-select-change="chooseFolder"
        ></Tree>
      </Col>
      <Col span="18">
        <div class="count-show">已选{{ choosedItems.length }} 张</div>
        <Row :gutter="20" style="height: 400px">
          <Col span="6" v-for="(item, index) in materialList" :key="index" class="item-col">
            <div class="item-col-box" @click="chooseItemCheck(item, index)">
              <i class="item-image" :style="getThumb(item)"></i>
              <img src="../assets/choosed.png" class="icon-choose" v-if="item.choosed" />
              <img src="../assets/noChoosed.png" class="icon-choose" v-else />
            </div>
            <div class="info-show">
              <div class="info-title" :title="item.name">{{ item.name }}</div>
              <div class="info-desc">
                <span>{{ item.width }}*{{ item.height }}</span>
                <span>{{ getSize(item.size) }}</span>
              </div>
            </div>
          </Col>
        </Row>
        <div class="page-box">
          <Page :total="total" show-elevator @on-change="changePage" :page-size="8" />
        </div>
      </Col>
    </Row>
  </div>
</template>

<script>
import { getFolders } from '@/api/data';
import { renderSize } from '@/libs/util';
import { getFileList } from '@/api/data';

import Bus from '../libs/bus';

export default {
  name: 'libraryList',
  props: {
    fileLimit: {
      type: Number,
      default: 1,
    },
    highLimit: {
      type: String,
      default: '0',
    },
    materialType: {
      type: String,
      default: 'image',
    },
  },
  data() {
    return {
      path_id: 0,
      page: 1,
      total: 0,
      materialList: [],
      foldersMenu: [
        {
          id: 0,
          title: '素材',
          loading: false,
          children: [],
          selected: true,
          expand: false,
        },
      ],
      choosedItems: [],
    };
  },
  watch: {
    materialType() {
      this.path_id = 0;
      this.getTreeFolders();
      this.getSucaiList();
    },
  },
  methods: {
    getTreeFolders(item, callback) {
      let id = item ? item.id : 0;
      getFolders(this.materialType, id)
        .then((res) => {
          let foldersMenu = res.data.data.map((folder) => {
            let folderItem = {
              title: folder.file_name,
              loading: false,
              children: [],
              id: folder.id,
            };
            return folderItem;
          });

          if (id === 0) {
            this.foldersMenu[0].children = foldersMenu;
            this.foldersMenu[0].expand = true;
          } else {
            callback(foldersMenu);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    },
    chooseFolder(array, attr) {
      this.path_id = attr.id;
      this.page = 1;
      this.getSucaiList();
    },
    getSucaiList() {
      getFileList(this.materialType, this.path_id, this.highLimit, this.page)
        .then((res) => {
          let { rows, total } = res.data.data;
          rows.forEach((item) => {
            item.choosed = false;
          });
          this.materialList = rows;
          this.total = Number(total);
        })
        .catch((err) => {
          console.log(err);
        });
    },
    changePage(currentPage) {
      this.page = currentPage;
      this.clearChoosed();
      this.getSucaiList();
    },

    chooseItemCheck(item, index) {
      let chooseStatus = !item.choosed;
      if (chooseStatus) {
        if (this.choosedItems.length > this.fileLimit - 1) {
          this.$Message.error(`已选素材已超过${this.fileLimit}张！`);
          return;
        }

        if (this.materialType === 'video') {
          this.$emit('startFrame', 'file_id', item.id);
        }

        this.$set(this.materialList[index], 'choosed', chooseStatus);
        this.choosedItems.push(item);
        Bus.$emit('doMaterials', this.choosedItems);
      } else {
        // 取消选中 要不要终止抽帧socket ???
        this.$set(this.materialList[index], 'choosed', chooseStatus);
        this.choosedItems = this.choosedItems.filter(({ id }) => id !== item.id);
      }
    },
    // 工具
    getThumb(item) {
      if (this.materialType === 'image') {
        return 'backgroundImage:url(' + item.thumb + ')';
      } else if (this.materialType === 'video') {
        return 'backgroundImage:url(' + item.cover + ')';
      } else if (this.materialType === 'voice') {
        return 'backgroundImage:url("https://shandianyun-sck.iqilu.com/icon-huatong.png"); background-size: 40% 50%';
      }
    },
    getSize: (item) => renderSize(item),
    clearChoosed() {
      this.choosedItems = [];
    },
  },
};
</script>

<style lang="less" scoped>
.count-show {
  margin: 2px 10px 10px 0;
}
.item-col {
  .item-col-box {
    background-color: #f1f3f5;
    height: 130px;
    position: relative;
    .icon-choose {
      width: 20px;
      height: 20px;
      position: absolute;
      right: 10px;
      top: 10px;
    }
    .item-image {
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
  .info-show {
    width: 100%;
    margin-bottom: 15px;
    margin-top: 10px;
    .info-title {
      width: 100%;
      height: 24px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: 16px;
      margin-top: 5px;
    }
    .info-desc {
      color: #999;
      font-size: 14px;
      span {
        margin-right: 10px;
      }
    }
  }
}
.page-box {
  margin-top: 5px;
  width: 100%;
  text-align: center;
}
.folder-tree ::v-deep .ivu-tree-children {
  overflow: hidden;
}
</style>
