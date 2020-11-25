<template>
	<div class="upload"></div>
</template>

<script>
import '@/assets/css/webuploader.css'
import WebUploader from '@/assets/js/webupload.js'
import store from '@/store/index'
import { getToken } from "@/libs/util";
import Cookies from 'js-cookie'
// import { uploadMD5 } from "@/api/common";
import { uploadInit, uploadProcess, uploadFinish } from '@/api/webupload'
export default {
  name: 'WebUpload',
  props: {
    accept: {
      type: String,
      default: null
    },
    // 上传地址
    url: {
      type: String,
      default: ''
    },
    baseUrl: {
      type: String,
      // default: 'https://shandianyun-sck.iqilu.com/'
    },
    // 上传最大数量 默认为100
    fileNumLimit: {
      type: Number,
      default: 100
    },
    // 大小限制 默认2M
    fileSingleSizeLimit: {
      type: Number,
      default: 2048000
    },
    // 上传时传给后端的参数，一般为token，key等
    formData: {
      type: Object,
      default: null
    },
    // 生成formData中文件的key，下面只是个例子，具体哪种形式和后端商议
    keyGenerator: {
      type: Function,
      default (file) {
        const currentTime = new Date().getTime()
        const key = `${currentTime}`
        return key
      }
    },
    multiple: {
      type: Boolean,
      default: false
    },
    // 上传按钮ID
    uploadButton: {
      type: String,
      default: ''
    },
    highLimit: {
      type: String | Number,
      default: '0'
    }
  },
  data () {
    return {
      uploader: null,
      md5: '',
      uuid: '',
       uploadId: '',
      current_chunk: 0,
      current_finish: false,
      uploader_index: 1
    }
  },
  mounted () {
    this.uploader_index = sessionStorage.getItem('sc_uploader_index') ? sessionStorage.getItem('sc_uploader_index') : 1
    this.initWebUpload()
  },
  methods: {
    initWebUpload () {
      let that = this
      new WebUploader.Uploader.register(
        {
          'before-send-file': 'beforeSendFile',
          'before-send': 'beforeSend',
          'after-send-file': 'afterSendFile'
        },
        {
          beforeSendFile: async function (file) {
            let deferred = WebUploader.Base.Deferred()
            let file_md5 = ''
            that.$emit('getMd5', file)
            let current_uploader_index = sessionStorage.getItem('sc_uploader_index') ? sessionStorage.getItem('sc_uploader_index') : 1
             if (that.uploader.options.index != current_uploader_index - 1) {
              return false
            }
            await that.uploader.md5File(file).then(val => {
              file_md5 = val
            })
            let { ext, type } = file
            console.log(that.highLimit)
            let args = {
              ext,
              MIME_type: type,
              file_md5,
              high_code_rate_limit: that.highLimit
            }

            await uploadInit(that.baseUrl, args).then(res => {
              if (res.status == 200) {
                let { current_chunk, extra, status } = res.data.data
                if (status === '1') {
                  file.current_chunk = res.data.data.current_chunk
                  that.uploadId = res.data.data.uuid
                } else if (status === '2') {
                  // that.stop(file)
                  that.uploader.skipFile(file)
                  deferred.resolve()
                  that.current_finish = true
                  let file_responent = {
                    status: 200,
                    data: {
                      data: {
                        ...extra
                      },
                      msg: ''
                    }
                  }
                  that.$emit('success', file, file_responent)
                }
              } else {
                this.$emit('uploadError', file, res)
              }
            }).catch(err => {
              console.log(err)
            })
          },
          // 开始上传分片触发
          beforeSend: function (block) {
            // 分片验证是否已传过，用于断点续传
            var task = new $.Deferred()
            let { chunk, file, start, end } = block
            if (chunk <= file.current_chunk) { // 若当前分片小于已传分片,表明，返回失败给WebUploader，表明该分块不需要上传
              task.reject()
            } else {
              task.resolve()
            }
            task.resolve()
            return task.promise()
          },
          // 上传文件完成触发
          afterSendFile: function (file) {
            let task = new $.Deferred()
            if(that.current_finish) {
              that.current_finish = false
              task.resolve()
            } else{
              let current_uploader_index = sessionStorage.getItem('sc_uploader_index') ? sessionStorage.getItem('sc_uploader_index') : 1
              if (that.uploader.options.index != current_uploader_index - 1) {
                return false
              }
              that.uploader.md5File(file).then(val => {
                let params = {
                  uuid: that.uploadId,
                  file_MD5: val
                }
                uploadFinish(that.baseUrl, params).then(res => {
                  let { data, status } = res
                  if (status === 200) {
                    console.log(res)
                    that.$emit('success', file, res)
                  } else {
                    that.$Message.error(data.msg)
                  }
                  task.resolve()
                }).catch(err => {
                  task.resolve()
                  that.$Message.error(err)
                })
              })
            }
            return $.when(task)
          }
        })
      that.uploader = WebUploader.create({
        sendMd5: true,
        auto: true, // 选完文件后，是否自动上传
        swf: '/static/lib/webuploader/Uploader.swf', // swf文件路径
        server: that.url, // 文件接收服务端
        pick: {
          id: that.uploadButton, // 选择文件的按钮
          multiple: that.multiple, // 是否多文件上传 默认false
          label: ''
        },
        accept: that.getAccept(that.accept), // 允许选择文件格式。
        threads: 1,
        fileNumLimit: that.fileNumLimit, // 限制上传个数
        // fileSingleSizeLimit: that.fileSingleSizeLimit, // 限制单个上传图片的大小
        formData: that.formData, // 上传所需参数
        chunked: true, // 分片上传
        chunkSize: 5 * 1024 * 1024, // 分片大小5 * 1024 * 1024
        duplicate: true, // 去重， 根据文件名字、文件大小和最后修改时间来生成hash Key.
        chunkRetry: 2, // 重试次数
        index: that.uploader_index
      })

      sessionStorage.setItem('sc_uploader_index', Number(that.uploader_index) + 1)

      // 当有文件被添加进队列的时候，添加到页面预览
      that.uploader.on('fileQueued', file => {
        that.$emit('fileChange', file)
        // that.uploader.options.formData["key"] = that.keyGenerator(file);
      })

      that.uploader.on('uploadStart', file => {
        // 在这里可以准备好formData的数据
        // that.uploader.options.formData.key = 1;
        // let uuid = new Date().getTime() + Math.floor(Math.random() * 1000)
        // that.uploader.options.formData = { uuid }
        console.log('file', file)
      })

      that.uploader.on('uploadBeforeSend', (object, data, headers) => {
        // console.log(object);
        // data.uid = that.$store.state.userId
        let JWT = 'jwt-token'
        headers[JWT] = Cookies.get('jwt_token')? Cookies.get('jwt_token'): ''
        data.token = getToken()
        headers.token = getToken()
        headers.platform = 'PC'
        // headers.FileType = object.blob.type
        data.uuid = this.uploadId
      })

      that.uploader.on('uploadgetMd5Before', file => {
        console.log('getmd5开始：', new Date())
        that.$emit('getMd5Before', file)
      })
      that.uploader.on('uploadgetMd5Done', md5 => {
        console.log('getmd5结束：', md5)
        that.$emit('getMd5Done', md5)
      })

      that.uploader.on('uploadAccept', (obj, res) => {
        // console.log(obj,res)
      })

      // 文件上传过程中创建进度条实时显示。
      that.uploader.on('uploadProgress', (file, percentage) => {
        that.$emit('progress', file, percentage)
      })

      that.uploader.on('uploadSuccess', (file, response) => {
        // that.$emit('success', file, response)
      })

      that.uploader.on('uploadError', (file, reason) => {
        that.$emit('uploadError', file, reason)
      })

      that.uploader.on('error', type => {
        let errorMessage = ''
        if (type === 'F_EXCEED_SIZE') {
          errorMessage = `文件大小不能超过${that.fileSingleSizeLimit /
						(1024 * 1000)}M`
        } else if (type === 'Q_EXCEED_NUM_LIMIT') {
          errorMessage = '文件上传已达到最大上限数'
        } else if (type === 'Q_TYPE_DENIED') {
          errorMessage = `上传出错！请检查上传类型`
        } else if (type === 'F_DUPLICATE' ){
          errorMessage = `文件重复`
        } else {
          errorMessage = `上传出错！请检查后重新上传！错误代码${type}`
        }

        that.$emit('error', errorMessage)
      })

      that.uploader.on('uploadComplete', (file, response) => {
        that.$emit('complete', file, response)
      })
    },

    upload (file) {
      this.uploader.upload(file)
    },
    stop (file) {
      this.uploader.stop(file)
    },
    // 取消并中断文件上传
    cancelFile (file) {
      this.uploader.cancelFile(file)
    },
    // 在队列中移除文件
    removeFile (file, bool) {
      this.uploader.removeFile(file, bool)
    },
    destroy() {
      this.uploader.destroy()
    },
    concat (array, str) {
      let arr = str.split(',')
      arr.map(function (value) {
        array = array.concat(value)
      })
      return array
    },

    getAccept (accept) {
      let title = []
      let extensions = []
      let mimeTypes = []
      if (accept.search('image') != -1) {
        title = title.concat('image')
        extensions = this.concat(extensions, 'gif,jpg,jpeg,png')
        mimeTypes = this.concat(mimeTypes, 'image/gif,image/jpeg,image/png')
      }
      if (accept.search('video') != -1) {
        title = title.concat('Videos')
        extensions = this.concat(extensions, 'mp4')
        mimeTypes = this.concat(mimeTypes, 'video/mp4')
      }
      if (accept.search('text') != -1) {
        title = title.concat('texts')
        extensions = this.concat(extensions, 'txt')
        mimeTypes = this.concat(mimeTypes, 'text/plain')
      }
      if (accept.search('voice') != -1) {
        title = title.concat('Voicess')
        extensions = this.concat(extensions, 'mp3')
        mimeTypes = this.concat(mimeTypes, 'voice/mp3')
      }
      return {
        title: title.join(','),
        extensions: extensions.join(','),
        mimeTypes: mimeTypes.join(',')
      }
    }
  }
}
</script>

<style lang="less">
.webuploader-container {
	position: relative;
}
.webuploader-element-invisible {
	position: absolute !important;
	clip: rect(1px 1px 1px 1px); /* IE6, IE7 */
	clip: rect(1px, 1px, 1px, 1px);
}
.webuploader-pick {
	position: relative;
	display: inline-block;
	cursor: pointer;
	background: #00b7ee;
	padding: 10px 15px;
	color: #fff;
	text-align: center;
	border-radius: 3px;
	overflow: hidden;
}
.webuploader-pick-hover {
	background: #00a2d4;
}

.webuploader-pick-disable {
	opacity: 0.6;
	pointer-events: none;
}
</style>
