<template>
	<div style="width: 100%;height: 100%;overflow-y: auto;background-color: rgb(241,241,241)">
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
						<a-space wrap size="large" class="statics">
							<template #split>
								|
							</template>
							<a-statistic :title="$t('controller.app.setting.home.settingHome.projectTotal')" :value="staticInfo?.projectCount" show-group-separator :value-style="{
								color:'blue'
							}"/>
							<a-statistic :title="$t('controller.app.setting.home.settingHome.issueTotal')" :value="staticInfo?.issueCount" show-group-separator :value-style="{
								color:'blue'
							}"/>
							<a-statistic :title="$t('controller.app.setting.home.settingHome.wikiSpaceTotal')" :value="staticInfo?.wikiSpaceCount" show-group-separator :value-style="{
								color:'blue'
							}"/>
							<a-statistic :title="$t('controller.app.setting.home.settingHome.wikiItemTotal')" :value="staticInfo?.wikiItemCount" show-group-separator :value-style="{
								color:'blue'
							}"/>
							<a-statistic :title="$t('controller.app.setting.home.settingHome.userTotal')" :value="staticInfo?.userCount" show-group-separator :value-style="{
								color:'blue'
							}"/>
							<a-statistic :title="$t('controller.app.setting.home.settingHome.teamTotal')" :value="staticInfo?.teamCount" show-group-separator :value-style="{
								color:'blue'
							}"/>
						</a-space>
					</template>
					<template v-else-if="props.item.id==='projectWithIssueList'">
						<div ref="projectWithIssueEle" style="width: 100%;height: 100%">
						</div>
					</template>
					<template v-else-if="props.item.id==='projectWithUnDoneIssueList'">
						<div ref="projectWithUnDoneIssueEle" style="width: 100%;height: 100%">
						</div>
					</template>
					<template v-else-if="props.item.id==='wikiSpaceWithWikiItemList'">
						<div ref="wikiSpaceWithWikiItemEle" style="width: 100%;height: 100%">
						</div>
					</template>
					<template v-else-if="props.item.id==='teamWithUserList'">
						<div ref="teamWithUserEle" style="width: 100%;height: 100%">
						</div>
					</template>
				</a-row>
			</template>
		</Card>
	</div>
</template>

<script setup lang="ts">
import {onBeforeMount, onBeforeUnmount, ref} from "vue";
import Card from "@/business/common/component/card/card.vue";
import {apiOrganization} from "@/business/common/request/request";
import {ICommon_Route_Res_Organization_Statics} from "../../../../../../../common/routes/response";
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

const projectWithIssueEle=ref(),projectWithUnDoneIssueEle=ref(),wikiSpaceWithWikiItemEle=ref(),teamWithUserEle=ref()
let projectWithIssueChart:EChartsType,projectWithUnDoneIssueChart:EChartsType,wikiSpaceWithWikiItemChart:EChartsType,teamWithUserChart:EChartsType
const {t}=useI18n()
const data = [
	{
		id: "statics",
		name: t("controller.app.setting.home.settingHome.statics"),
		data: null
	},
	{
		id: "projectWithIssueList",
		name: t("controller.app.setting.home.settingHome.projectWithIssueList"),
		data: null
	},
	{
		id: "projectWithUnDoneIssueList",
		name: t("controller.app.setting.home.settingHome.projectWithUnDoneIssueList"),
		data: null
	},
	{
		id: "wikiSpaceWithWikiItemList",
		name: t("controller.app.setting.home.settingHome.wikiSpaceWithWikiItemList"),
		data: null
	},
	{
		id: "teamWithUserList",
		name: t("controller.app.setting.home.settingHome.teamWithUserList"),
		data: null
	},
]
const staticInfo=ref<DCSType<ICommon_Route_Res_Organization_Statics>>()
const getInfo=async ()=>{
	let res=await apiOrganization.statics()
	if(res?.code==0) {
		staticInfo.value=res.data
		initCharts()
	}
}

const initCharts=()=>{
	projectWithIssueChart=echarts.init(projectWithIssueEle.value)
	projectWithIssueChart.setOption({
		grid:{
			left:60
		},
		dataset:{
			source:[
				["count","name"],
				...staticInfo.value.projectWithIssueList.map(item=>{
					return [item.issueCount,item.project.name]
				}).reverse()
			]
		},
		xAxis: {
			nameLocation:"center",
			nameGap:30,
			name:"Issue Count"
		},
		yAxis: {
			name:"Project",
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
	projectWithUnDoneIssueChart=echarts.init(projectWithUnDoneIssueEle.value)
	projectWithUnDoneIssueChart.setOption({
		grid:{
			left:60
		},
		dataset:{
			source:[
				["count","name"],
				...staticInfo.value.projectWithUnDoneIssueList.map(item=>{
					return [item.issueCount,item.project.name]
				}).reverse()
			]
		},
		xAxis: {
			nameLocation:"center",
			nameGap:30,
			name:"UnResolved Issue Count"
		},
		yAxis: {
			name:"Project",
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
	wikiSpaceWithWikiItemChart=echarts.init(wikiSpaceWithWikiItemEle.value)
	wikiSpaceWithWikiItemChart.setOption({
		grid:{
			left:60
		},
		dataset:{
			source:[
				["count","name"],
				...staticInfo.value.wikiSpaceWithWikiItemList.map(item=>{
					return [item.wikiItemCount,item.wikiSpace.name]
				}).reverse()
			]
		},
		xAxis: {
			nameLocation:"center",
			nameGap:30,
			name:"Wiki Item Count"
		},
		yAxis: {
			name:"Wiki Space",
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
	teamWithUserChart=echarts.init(teamWithUserEle.value)
	teamWithUserChart.setOption({
		grid:{
			left:60
		},
		dataset:{
			source:[
				["count","name"],
				...staticInfo.value.teamWithUserList.map(item=>{
					return [item.userCount,item.team.name]
				}).reverse()
			]
		},
		xAxis: {
			nameLocation:"center",
			nameGap:30,
			name:"User Count"
		},
		yAxis: {
			name:"Team",
			type: 'category',
			axisLabel:{
				show:true,
				overflow:"breakAll",
				width:50
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
})

onBeforeUnmount(()=>{
	projectWithUnDoneIssueChart?.dispose()
	projectWithIssueChart?.dispose()
	wikiSpaceWithWikiItemChart?.dispose()
	teamWithUserChart?.dispose()
})
</script>

<style scoped>
.statics :deep .arco-space-item {
	margin-bottom: 12px!important;
}
</style>