<template>
  <a-upload :custom-request="onUpload" :show-file-list="false" :accept="types" :class="fill?'fill':''">
    <template #upload-button>
      <div :class="`arco-upload-list-item`" style="justify-content: center">
        <div class="arco-upload-list-picture custom-upload-avatar" v-if="uri">
          <img :src="uri" />
          <div class="arco-upload-list-picture-mask">
            <IconEdit />
          </div>
        </div>
        <div class="arco-upload-picture-card" v-else>
          <div class="arco-upload-picture-card-text">
            <IconPlus />
            <div style="margin-top: 10px; font-weight: 600">{{$t("util.upload")}}</div>
          </div>
        </div>
      </div>
    </template>
  </a-upload>
</template>

<script setup lang="ts">

import {ref, watchEffect} from "vue";
import {apiFile} from "../request/request";

const props=defineProps<{
  defaultUri?:string,
  types?:string,
	fill?:boolean
}>()
const emit=defineEmits<{
  (e:'upload',id:string):void
}>()
let uri=ref("");
watchEffect(()=>{
  uri.value=props.defaultUri;
})
const onUpload=async (option)=>{
  const {onProgress, onError, onSuccess, fileItem, name} = option
  uri.value=URL.createObjectURL(fileItem.file);
  let ret=await apiFile.upload({
    file:fileItem.file
  })
  if(ret?.code==0) {
    onProgress(100)
    emit("upload",ret.data.id);
  }
}
</script>

<style scoped>
.fill :deep span {
	width: 100%;
	height: 100%;
	display: inline-block;
}
.fill :deep .arco-upload-list-item {
	margin: 0;
	height: 100%;
}
.fill :deep .arco-upload-list-picture {
	width: 100%;
	height: 100%;
	margin: 0;
}
</style>