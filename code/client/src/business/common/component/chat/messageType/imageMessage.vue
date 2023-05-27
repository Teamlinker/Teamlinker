<template>
    <div>
        <a-image :src="path" show-loader @load="onLoad($event)"></a-image>
    </div>
</template>

<script setup lang="ts">
import {onBeforeMount, ref} from "vue";
import {apiFile} from "../../../request/request";

const emit=defineEmits<{
    (e:"complete",width:number,height:number)
}>()
const props=defineProps<{
    fileId:string
}>()
const path=ref("")
const getPath=async ()=>{
    let ret=await apiFile.getPath({
        fileId:props.fileId
    })
    if(ret?.code==0) {
        path.value=ret?.data.uri
    }
}

const onLoad=(event:Event)=>{
    let ele=event.currentTarget as HTMLImageElement
    emit("complete",ele.width,ele.height)
}

onBeforeMount(()=>{
    getPath()
})
</script>

<style scoped>
:deep .arco-image-img {
    max-width: 300px;
}
</style>