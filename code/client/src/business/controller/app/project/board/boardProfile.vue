<template>
	<div style="width: 100%;height: 100%;">
		<a-row style="width: 100%;font-size: 30px;align-items: center;justify-content: space-between;padding: 0px 10px;box-sizing: border-box;height: 35px">
			{{info?.name}}
			<a-button type="primary" size="small" @click="onEdit">
				{{$t("util.edit")}}
			</a-button>
		</a-row>
		<a-row style="width: 100%;margin-top: 20px;padding:0px 10px;box-sizing: border-box;height: 20px">
			{{info?.description}}
		</a-row>
		<a-tabs style="width: 100%;margin-top: 20px;height: calc(100% - 95px);" @scroll="$event.currentTarget.scrollTop=0" :default-active-key="boardSprintId?'kanban':'sprint'">
			<a-tab-pane key="sprint" :title="$t('util.sprint')">
				<BoardSprintList :board-id="boardId"></BoardSprintList>
			</a-tab-pane>
			<a-tab-pane key="kanban" :title="$t('util.kanban')">
				<BoardKanban :board-id="boardId" :board-sprint-id="boardSprintId"></BoardKanban>
			</a-tab-pane>
			<a-tab-pane key="config" :title="$t('util.config')">
				<BoardConfig :board-id="boardId"></BoardConfig>
			</a-tab-pane>
		</a-tabs>
	</div>
</template>

<script setup lang="ts">
import {getCurrentInstance, inject, markRaw, onBeforeMount, ref} from "vue";
import {apiBoard} from "@/business/common/request/request";
import {ICommon_Model_Board} from "../../../../../../../common/model/board";
import {getCurrentNavigator, getRootNavigatorRef} from "@/teamOS/common/component/navigator/navigator";
import {Dialog} from "@/business/common/component/dialog/dialog";
import BoardEdit from "@/business/controller/app/project/board/boardEdit.vue";
import {injectProjectInfo} from "@/business/common/util/symbol";
import BoardConfig from "@/business/controller/app/project/board/boardConfig.vue";
import BoardSprintList from "@/business/controller/app/project/board/boardSprintList.vue";
import BoardKanban from "@/business/controller/app/project/board/boardKanban.vue";
import {useI18n} from "vue-i18n";
import {DCSType} from "../../../../../../../common/types";

const props=defineProps<{
	boardId:string,
	boardSprintId?:string
}>()
const root=getRootNavigatorRef()
const appContext=getCurrentInstance().appContext
const info=ref<DCSType<ICommon_Model_Board>>()
const navigator=getCurrentNavigator()
const objInject=inject(injectProjectInfo)
const projectId=objInject.id
const {t}=useI18n()
const getBoardInfo=async ()=>{
	let res=await apiBoard.board({
		boardId:props.boardId
	})
	if(res?.code==0) {
		info.value=res.data
		navigator.setCurrentPath(info.value.name)
	}
}

const onEdit=async ()=>{
	let ret=await Dialog.open(root.value,appContext,t("util.edit"),markRaw(BoardEdit),{
		type:"edit",
		projectId:projectId,
		item:info.value
	})
	if(ret) {
		getBoardInfo()
	}
}

onBeforeMount(()=>{
	getBoardInfo()
})
</script>

<style scoped>

</style>