<template>
	<div style="width: 100%;height: 100%;">
		<a-row style="height: 30px;align-items: center;padding-left: 20px;border-bottom: 1px lightgray solid;box-sizing: border-box">
			<a-space>
				<span style="font-size: 24px;font-weight: bold">
					{{projectInfo?.name}}
				</span>
				<span style="color: grey">
					{{projectInfo?.description}}
				</span>
			</a-space>
		</a-row>
		<a-row style="height: calc(100% - 30px);overflow-y: auto;background-color: rgb(241,241,241)">
			<Card :data="data" type="calculate" :gap="10" :column="2" :rect="{
			height:300
		}" style="width: 100%;height: 100%" readonly>
				<template #header="props">
					<a-row style="height: 100%;width: 100%;padding-left: 10px;align-items: center;font-weight: bold;font-size: medium;background-color: white;box-sizing: border-box">
						{{props.item.name}}
					</a-row>
				</template>
				<template #body="props">
					<a-row style="height: 100%;width: 100%;padding: 10px;background-color: white;box-sizing: border-box;overflow-y: auto">
						<template v-if="props.item.id==='statics'">
							<a-space wrap size="large">
								<template #split>
									|
								</template>
								<a-statistic :title="$t('controller.app.project.home.projectHome.issueTotal')" :value="staticInfo?.issueCount" show-group-separator :value-style="{
								color:'blue'
							}"/>
								<a-statistic :title="$t('controller.app.project.home.projectHome.unResolvedIssueTotal')" :value="staticInfo?.issueUnDoneCount" show-group-separator :value-style="{
								color:'blue'
							}"/>
								<a-statistic :title="$t('controller.app.project.home.projectHome.releaseTotal')" :value="staticInfo?.releaseCount" show-group-separator :value-style="{
								color:'blue'
							}"/>
								<a-statistic :title="$t('controller.app.project.home.projectHome.sprintTotal')" :value="staticInfo?.sprintCount" show-group-separator :value-style="{
								color:'blue'
							}"/>
							</a-space>
						</template>
						<template v-else-if="props.item.id==='myRecentIssueList'">
							<a-list style="width: 100%" size="small">
								<a-list-item v-for="item in (staticInfo?.myRecentIssueList as ICommon_Model_Project_Issue[])">
									<a-space>
										<FieldPriority :priority="item.priority" only-icon></FieldPriority>
										<a-link @click="eventBus.emit(EClient_EVENTBUS_TYPE.OPEN_PROJECT_ISSUE_PROFILE,projectId,item.id)">
											{{key+"-"+item.unique_id}}&nbsp;
											{{item.name}}
										</a-link>
									</a-space>
								</a-list-item>
							</a-list>
						</template>
						<template v-else-if="props.item.id==='userIssueList'">
							<div ref="userIssueListEle" style="width: 100%;height: 100%">
							</div>
						</template>
						<template v-else-if="props.item.id==='userUnDoneIssueList'">
							<div ref="userUnDoneIssueEle" style="width: 100%;height: 100%">
							</div>
						</template>
						<template v-else-if="props.item.id==='recentReleaseList'">
							<a-list style="width: 100%" size="small">
								<a-list-item v-for="item in (staticInfo?.recentReleaseList as ICommon_Model_Project_Release[])">
									<a-space>
										<a-link @click="eventBus.emit(EClient_EVENTBUS_TYPE.OPEN_PROJECT_RELEASE_PROFILE,projectId,item.id)">
											{{item.name}}
										</a-link>
										<span style="color: grey;font-size: small">
                      {{item.start_time+" - "+item.release_time}}
                    </span>
									</a-space>
								</a-list-item>
							</a-list>
						</template>
					</a-row>
				</template>
			</Card>
		</a-row>
	</div>
</template>

<script setup lang="ts">
import {inject, onBeforeMount, onBeforeUnmount, ref} from "vue";
import {injectProjectInfo} from "@/business/common/util/symbol";
import Card from "@/business/common/component/card/card.vue";
import {apiProject} from "@/business/common/request/request";
import {ICommon_Route_Res_Project_Statics} from "../../../../../../../common/routes/response";
import {ICommon_Model_Project} from "../../../../../../../common/model/project";
import * as echarts from 'echarts/core';
import {EChartsType} from 'echarts/core';
import {BarChart} from 'echarts/charts';
import {
	DatasetComponent,
	GridComponent,
	TitleComponent,
	TooltipComponent,
	TransformComponent
} from 'echarts/components';
import {LabelLayout, UniversalTransition} from 'echarts/features';
import {CanvasRenderer} from 'echarts/renderers';
import FieldPriority from "@/business/common/component/field/fieldPriority.vue";
import {ICommon_Model_Project_Issue} from "../../../../../../../common/model/project_issue";
import {EClient_EVENTBUS_TYPE, eventBus} from "@/business/common/event/event";
import {ICommon_Model_Project_Release} from "../../../../../../../common/model/project_release";
import {useI18n} from "vue-i18n";
import {DCSType} from "../../../../../../../common/types";

echarts.use([
	TitleComponent,
	TooltipComponent,
	GridComponent,
	DatasetComponent,
	TransformComponent,
	BarChart,
	LabelLayout,
	UniversalTransition,
	CanvasRenderer
]);

const userIssueListEle=ref(),userUnDoneIssueEle=ref()
let userIssueListChart:EChartsType,userUnDoneIssueChart:EChartsType
const projectId=inject(injectProjectInfo).id
const key=inject(injectProjectInfo).key
const permission=inject(injectProjectInfo).permission
const {t}=useI18n()
const data = [
	{
		id: "statics",
		name: t("controller.app.project.home.projectHome.statics"),
		data: null
	},
	{
		id: "myRecentIssueList",
		name: t("controller.app.project.home.projectHome.myRecentIssueList"),
		data: null
	},
	{
		id: "userIssueList",
		name: t("controller.app.project.home.projectHome.userIssueList"),
		data: null
	},
	{
		id: "userUnDoneIssueList",
		name: t("controller.app.project.home.projectHome.userUnDoneIssueList"),
		data: null
	},
	{
		id: "recentReleaseList",
		name: t("controller.app.project.home.projectHome.recentReleaseList"),
		data: null
	},
]
const staticInfo=ref<DCSType<ICommon_Route_Res_Project_Statics>>()
const projectInfo=ref<DCSType<ICommon_Model_Project>>()
const getInfo=async ()=>{
	let res=await apiProject.statics({
		projectId:projectId
	})
	if(res?.code==0) {
		staticInfo.value=res.data
		initCharts()
	}
}

const getProjectInfo=async ()=>{
	let res=await apiProject.basic({
		projectId:projectId
	})
	if(res?.code==0) {
		projectInfo.value=res.data
	}
}

const initCharts=()=>{
	userIssueListChart=echarts.init(userIssueListEle.value)
	userIssueListChart.setOption({
		grid:{
			left:60
		},
		dataset:{
			source:[
				["count","name"],
				...staticInfo.value.userIssueList.map(item=>{
					return [item.count,item.user.name]
				}).reverse()
			]
		},
    xAxis: {
	    nameLocation:"center",
	    nameGap:30,
			name:"Issue Count"
    },
    yAxis: {
			name:"User",
	    type: 'category',
	    axisLabel:{
		    show:true,
		    overflow:"breakAll",
		    width:40
	    }
    },
    series: [
      {
        type: 'bar',
	      barWidth:"8%",
        encode:{
					x:"count",
	        y:"name"
        }
      }
    ]
	})
	userUnDoneIssueChart=echarts.init(userUnDoneIssueEle.value)
	userUnDoneIssueChart.setOption({
		grid:{
			left:60
		},
		dataset:{
			source:[
				["count","name"],
				...staticInfo.value.userUnDoneIssueList.map(item=>{
					return [item.count,item.user.name]
				}).reverse()
			]
		},
		xAxis: {
			nameLocation:"center",
			nameGap:30,
			name:"UnResolved Issue Count"
		},
		yAxis: {
			name:"User",
			type: 'category',
			axisLabel:{
				show:true,
				overflow:"breakAll",
				width:40
			}
		},
		series: [
			{
				type: 'bar',
				barWidth:"8%",
				encode:{
					x:"count",
					y:"name"
				}
			}
		]
	})
}

onBeforeMount(()=>{
	getInfo()
	getProjectInfo()
})

onBeforeUnmount(()=>{
	userIssueListChart?.dispose()
	userUnDoneIssueChart?.dispose()
})
</script>

<style scoped>

</style>