<template>
  <a-upload accept=".png,.jpg,.gif,.jpeg,.bmp,.webp" :custom-request="onUpload" :show-file-list="false">
      <template #upload-button>
          <a-button size="mini" type="text">
              <template #icon>
                  <icon-image style="font-size: 20px"></icon-image>
              </template>
          </a-button>
      </template>
  </a-upload>
</template>

<script setup lang="ts">
import {apiFile} from "../../../request/request";
import {compressImage} from "../../../util/helper";
import {Message} from "@arco-design/web-vue";

const emit=defineEmits<{
    (e:"updateStart"):void,
    (e:"updateEnd",fileId:string):void,
    (e:"updateError"):void
}>()
const onUpload=async (option)=>{
    const {onProgress, onError, onSuccess, fileItem, name} = option
    let file:File=fileItem.file
    handleUpload(file)
}

const handleUpload=async (file:File)=>{
    if(file.size>5*1024*1024) {
        Message.error("file size overflow")
    } else if(file.size>1024*1024) {
        emit("updateStart")
        let reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = (e) => {
            let result = e.target.result
            let image = new Image()
            image.src = result as string
            image.onload = async () => {
                let width = image.width
                let height = image.height
                let dataUrl = compressImage(image, width, height, 0.7)
                let blob=await fetch(dataUrl).then(item=>item.blob())
                let fileTemp=new File([blob],file.name,{type:"image/jpeg",lastModified:Date.now()})
                let ret=await apiFile.upload({
                    file:fileTemp as any
                })
                if(ret?.code==0) {
                    emit("updateEnd",ret.data.id)
                } else {
                    emit("updateError")
                }
            }
        }
    } else {
        emit("updateStart")
        let ret=await apiFile.upload({
            file:file as any
        })
        if(ret?.code==0) {
            emit("updateEnd",ret.data.id)
        } else {
            emit("updateError")
        }
    }
}

defineExpose({
    handleUpload
})
</script>

<style scoped>

</style>