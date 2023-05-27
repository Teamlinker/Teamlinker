<template>
    <div style="width: 100%;height: 100%;display: flex;flex-direction: column" ref="root">
        <div style="flex: 0 0 36px;display: flex;align-items: center;justify-content: space-between;padding:0 10px;border-bottom: 1px solid lightgray">
            <div style="height: 24px;display: flex;align-items: center">
                <a-avatar :size="24" :image-url="info.photo">
                    {{calculateShortName(info.name)}}
                </a-avatar>&nbsp;
                {{ info.name }}
            </div>
            <div v-if="type===ECommon_IM_Message_EntityType.TEAM">
                <a-button type="text" size="large" @click="isInfoVisible=!isInfoVisible">
                    <template #icon>
                        <icon-info-circle></icon-info-circle>
                    </template>
                </a-button>
            </div>
        </div>
        <div style="flex: 1 1 auto;height: calc(100% - 37px)">
            <a-split direction="vertical" style="height: 100%" :default-size="0.8">
                <template #first>
                    <div style="height: 100%;overflow-y: auto;padding: 10px;box-sizing: border-box" @wheel="onWheel" ref="contentRef">
                        <div v-for="(item,index) in messageList" :key="item.date" style="margin-bottom: 10px">
                            <div v-if="index===0" style="height: 20px;text-align: center;color: gray">
                                {{moment(item.date).format("MM-DD")}}
                            </div>
                            <div v-else-if="moment(item.date).date()!=moment(messageList[index-1].date).date()" style="height: 20px;text-align: center;color: gray">
                                {{moment(item.date).format("MM-DD")}}
                            </div>
                            <div style="height: 30px;display: flex">
                                <div style="flex:0 0 30px;display: flex;justify-content: center;align-items: center">
                                    <div style="height: 24px;width:24px;border-radius: 100%;overflow: hidden;margin-right: 10px">
                                        <a-avatar :image-url="item.photo" :size="24" style="cursor: pointer" @click="onClickPhoto($event,item)">
                                            {{calculateShortName(item.name)}}
                                        </a-avatar>
                                    </div>
                                </div>
                                <div style="flex: 1 1 auto;display: flex;align-items: center;">
                                    {{item.id===organizationUserId?"Me":item.name}}&nbsp;
                                    <span style="color: gray;font-size: smaller">{{moment(item.date).format("HH:mm")}}</span>
                                </div>
                            </div>
                            <div style="display: flex">
                                <div style="flex:0 0 30px;display: flex;justify-content: center;align-items: center">
                                </div>
                                <div style="flex: 1 1 auto;display: flex;align-items: center;">
                                    <div style="background-color: #e5e3e3;padding: 5px;border-radius: 5px">
                                        <template v-if="item.type===ECommon_IM_Message_ContentType.TEXT">
                                            {{item.content}}
                                        </template>
                                        <ImageMessage :file-id="item.content" v-else-if="item.type===ECommon_IM_Message_ContentType.IMAGE" style="max-width: 100%" @complete="onImageComplete"></ImageMessage>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </template>
                <template #second>
                    <div style="height: 100%;box-sizing: border-box;display: flex;flex-direction: column">
                        <div style="flex:0 0 30px;padding: 2px;box-sizing: border-box;background-color: rgb(249,249,249);">
                            <Image @update-start="loading=true" @update-end="onUpdateImage" @update-error="loading=false" ref="imageRef"></Image>
                        </div>
                        <a-spin :loading="loading" style="flex: 1 1 auto;display: flex;margin-top: 2px;height: auto;">
                            <a-textarea style="flex:1 1 auto;border: 0;background-color: transparent;" v-model="content" @paste="onPaste"></a-textarea>
                            <a-button type="primary" style="margin-top: 2px;height: auto;flex: 0 0 60px;border-radius: 5px" tabindex="-1" @click="onSend">
                                <template #icon>
                                    <icon-send style="color: white;font-size: x-large"></icon-send>
                                </template>
                            </a-button>
                        </a-spin>
                    </div>
                </template>
            </a-split>
        </div>
        <a-drawer v-model:visible="isInfoVisible" :popup-container="root" unmountOnClose :header="false" :footer="false">
            <slot name="info" :info="info" v-if="isInfoVisible">

            </slot>
        </a-drawer>
    </div>
</template>

<script setup lang="ts">
import {IClient_Chat_Message_Item} from "./type";
import {nextTick, ref, watch} from "vue";
import {ECommon_IM_Message_EntityType} from "../../../../../../common/model/im_unread_message";
import {ECommon_IM_Message_ContentType} from "../../../../../../common/model/im_user_message";
import {SessionStorage} from "../../storage/session";
import Image from "./operation/image.vue"
import moment from "moment";
import ImageMessage from "./messageType/imageMessage.vue";
import {calculateShortName} from "../../util/helper";

const root=ref()
const emit=defineEmits<{
    (e:"updateMore", lastItem:IClient_Chat_Message_Item, type: ECommon_IM_Message_EntityType, info: {
        name: string,
        photo: string,
        id: string
    })
    (e:"clickPhoto", item:IClient_Chat_Message_Item, x:number, y:number)
    (e:"send",content:string,contentType:ECommon_IM_Message_ContentType,chatType:ECommon_IM_Message_EntityType,toOrganizationUserId?:string,teamId?:string)
}>()
const props = defineProps<{
    data: IClient_Chat_Message_Item[],
    type: ECommon_IM_Message_EntityType,
    info: {
        name: string,
        photo: string,
        id: string
    }
}>()
const loading=ref(false)
const contentRef=ref<HTMLDivElement>()
const content=ref("")
const isInfoVisible=ref(false)
const messageList = ref<IClient_Chat_Message_Item[]>([])
const organizationUserId=SessionStorage.get("organizationUserId")
const imageRef=ref<InstanceType<typeof Image>>()
let isWheel=false
let preId=""
watch(() => props.data, () => {
    messageList.value = JSON.parse(JSON.stringify(props.data))
    messageList.value.sort((a, b) => {
        if (a.date > b.date) {
            return 1
        } else {
            return -1
        }
    })
    if(preId!==props.info.id) {
        nextTick(()=>{
            contentRef.value.scrollTop=contentRef.value.scrollHeight
        })
    }
    preId=props.info.id
}, {
    deep:true,
    immediate: true
})
watch(()=>props.info,()=>{
    isWheel=false
    isInfoVisible.value=false
})
const onWheel=(event:WheelEvent)=>{
    isWheel=true;
    let ele=event.currentTarget as HTMLDivElement
    if(event.deltaY<0 && ele.scrollTop<=0) {
       emit("updateMore",messageList.value[0],props.type,props.info)
    }
}

const onClickPhoto=(event:MouseEvent,item:IClient_Chat_Message_Item)=>{
    emit("clickPhoto",item,event.x,event.y)
}
const onSend=()=>{
    if(content.value.trim().length>0) {
        emit("send",content.value,ECommon_IM_Message_ContentType.TEXT,props.type,props.type===ECommon_IM_Message_EntityType.USER?props.info.id:null,props.type===ECommon_IM_Message_EntityType.TEAM?props.info.id:null)
    }
    content.value=""
}
const scrollToBottom=()=>{
    contentRef.value.scrollTop=contentRef.value.scrollHeight
}

const onUpdateImage=(fileId:string)=>{
    loading.value=false
    emit("send",fileId,ECommon_IM_Message_ContentType.IMAGE,props.type,props.type===ECommon_IM_Message_EntityType.USER?props.info.id:null,props.type===ECommon_IM_Message_EntityType.TEAM?props.info.id:null)
}
const onPaste=async (event:ClipboardEvent)=>{
    let items=event.clipboardData.items
    for(let i=0;i<items.length;i++) {
        let obj=items[i]
        if(obj.type.includes("image")) {
            let file=obj.getAsFile()
            event.stopPropagation()
            event.preventDefault()
            imageRef.value.handleUpload(file)
        }
    }
}

const onImageComplete=()=>{
    if(!isWheel) {
        contentRef.value.scrollTop=contentRef.value.scrollHeight
    }
}

defineExpose({
    scrollToBottom
})
</script>

<style scoped>
:deep .arco-split-pane-second {
    overflow: hidden;
}
:deep .arco-split-pane-second textarea {
    resize: none;
}
</style>