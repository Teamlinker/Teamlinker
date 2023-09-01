<template>
	<a-popover position="left" :content-style="{backgroundColor:'rgb(249,249,249)',padding:'0px'}" :id="id" @popup-visible-change="onPopup">
		<a-link href="javascript:void(0)">{{name}}</a-link>
		<template #content>
			<a-row style="width: 250px;padding: 10px">
				<a-row style="width: 100%;align-items: center">
					{{info?.name}}&nbsp;&nbsp;
					<span :style="{color: info?.status!==ECommon_Model_Board_Sprint_Status.COMPLETED?'dodgerblue':'rgb(0,180,42)'}">
						{{info?.status===ECommon_Model_Board_Sprint_Status.NOTSTART?"Not Start":info?.status===ECommon_Model_Board_Sprint_Status.STARTING?"Starting":"Completed"}}
					</span>
				</a-row>
				<a-row style="margin-top: 15px;">
					<a-space>
						<icon-calendar></icon-calendar>
						{{moment(info?.start_time).format("YYYY-MM-DD")}}
						-
						<icon-calendar></icon-calendar>
						{{moment(info?.end_time).format("YYYY-MM-DD")}}
					</a-space>
				</a-row>
				<a-row style="width: 100%;margin-top: 15px;justify-content: space-between;align-items: center">
					<a-space style="color: dodgerblue">
						<span>
							Swim Lanes:{{info?.swimLanes.length}}
						</span>
						<span>
							Issues:{{info?.issues.length}}
						</span>
					</a-space>
					<a-button type="outline" size="mini" style="margin-left: 20px" @click="onProfile">Profile</a-button>
				</a-row>
			</a-row>
		</template>
	</a-popover>
</template>

<script setup lang="ts">
import {ref} from "vue";
import {apiBoard, DCSType} from "../../../../common/request/request";
import {EClient_EVENTBUS_TYPE, eventBus} from "../../../../common/event/event";
import {ICommon_Route_Res_Board_Sprint_Info} from "../../../../../../../common/routes/response";
import {v4} from "uuid";
import moment from "moment";
import {ECommon_Model_Board_Sprint_Status} from "../../../../../../../common/model/board_sprint";


const loading=ref(true)
const props=defineProps<{
	boardSprintId:string
	name:string
}>()
const root=ref(null);
const id=ref(v4())
const info=ref<DCSType<ICommon_Route_Res_Board_Sprint_Info>>(null)
const onProfile=()=>{
	eventBus.emit(EClient_EVENTBUS_TYPE.OPEN_PROJECT_SPRINT_KANBAN_PROFILE,info.value.board.project_id,info.value.board_id,props.boardSprintId);
	let ele=document.getElementById(id.value)
	ele.parentElement.removeChild(ele);
}
const onPopup=async (visible:boolean)=>{
	if(!info.value && visible) {
		let res=await apiBoard.sprintInfo({
			boardSprintId:props.boardSprintId
		})
		if(res?.code==0) {
			info.value=res.data
			loading.value=false
		}
	}
}
</script>

<style scoped>

</style>