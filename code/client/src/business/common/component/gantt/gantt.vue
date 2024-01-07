<template>
	<a-split min="700px" v-model:size="size" style="width: 100%;height: 100%;border: 1px solid lightgrey;box-sizing: border-box">
		<template #first>
			<div style="width: 100%;height: 100%;overflow: auto" ref="tableEle">
				<a-table :columns="column" v-model:expanded-keys="expandedKeys" show-empty-tree hide-expand-button-on-empty :data="data" row-class="ganttRow" ref="dataEle" :bordered="{
					headerCell:true,
					bodyCell:true
				}" :pagination="false" :scroll="{
					y:'100%'
				}" column-resizable stripe  @cell-dblclick="onCellDbClick">
					<template #type="{record}">
						<slot name="type" :record="record as GanttDataItem"></slot>
					</template>
					<template #name="{record}">
						<slot name="name" :record="record as GanttDataItem"></slot>
					</template>
					<template #manDay="{record}">
						<slot name="manDay" :record="record as GanttDataItem"></slot>
					</template>
					<template #progress="{record}">
						<slot name="progress" :record="record as GanttDataItem"></slot>
					</template>
					<template #depend="{record}">
						<slot name="depend" :record="record as GanttDataItem"></slot>
					</template>
					<template #delay="{record}">
						<slot name="delay" :record="record as GanttDataItem"></slot>
					</template>
					<template #startDate="{record}">
						<slot name="startDate" :record="record as GanttDataItem"></slot>
					</template>
					<template #endDate="{record}">
						<slot name="endDate" :record="record as GanttDataItem"></slot>
					</template>
					<template #operation="{record}">
						<slot name="operation" :record="record as GanttDataItem"></slot>
					</template>
				</a-table>
			</div>
		</template>
		<template #second>
			<a-scrollbar style="width: 100%;height: 100%;overflow-x:auto;" :outer-style="{
				height:'100%'
			}" ref="scrollEle">
        <div style="height: 82px;display: flex;">
          <template v-if="type==='day'">
            <div style="height: 100%;" v-for="item in monthList">
              <div style="height: 41px;position: sticky;left: 0px;z-index: 1;display: flex;align-items: center;justify-content: center;width: 500px">
                {{item.year()}}.{{item.month()+1}}
              </div>
              <div style="height: 41px;display: flex;box-sizing: border-box;border-top: 1px lightgrey solid;">
                <div v-for="item1 in item.daysInMonth()" style="display: flex;justify-content: center;align-items: center;box-sizing: border-box" :style="{
									borderRight:item1==item.daysInMonth()?'1px lightgray solid':'',
									width:dayWidth+'px'
								}">
                  {{item1}}
                </div>
              </div>
            </div>
          </template>
          <template v-else-if="type==='month'">
            <div style="height: 100%;" v-for="item in yearList">
              <div style="height: 41px;position: sticky;left: 0px;z-index: 1;display: flex;align-items: center;justify-content: center;width: 500px">
                {{item.year()}}
              </div>
              <div style="height: 41px;display: flex;box-sizing: border-box;border-top: 1px lightgrey solid;">
                <div v-for="n in 12" style="display: flex;justify-content: center;align-items: center;box-sizing: border-box" :style="{
									borderRight:n<12?'1px lightgray solid':'',
									width:dayWidth*item.clone().set('month',n-1).daysInMonth()+'px'
								}">
                  {{n}}
                </div>
              </div>
            </div>
          </template>
        </div>
        <div style="height: 1px;background-color: lightgrey" :style="{
						width:width+'px'
					}"></div>
        <div style="height: calc(100% - 83px);overflow-y:auto;position: relative" :style="{
						width:width+'px'
					}" ref="linesEle" @scroll="onScroll" @mousemove="onMouseMove" @mouseup="onLineMouseUp">
          <div v-for="(line,index) in lines" style="width: 100%;position: relative;box-sizing: border-box;border-bottom: 1px lightgrey solid;height: 41px" :style="{
							backgroundColor:index%2==0?'':'rgb(247,248,250)'
						}" class="line">
            <template v-if="line.type===ECommon_Model_Plan_Table.STAGE || line.type===ECommon_Model_Plan_Table.ISSUE">
	            <a-popover position="bottom">
		            <div style="height: 15px;top:13px;position: absolute;border-radius: 3px;z-index: 1;overflow: hidden;" :id="line.key" :style="{
								left:line.left+'px',
								width:line.width+'px',
								resize: (line.type===ECommon_Model_Plan_Table.ISSUE && !line.hasChild)?'horizontal':'none',
								cursor:'move',
								...(line.showProgress!=null?{
                  background:`linear-gradient(to right,${line.color} 0,${line.color} ${line.showProgress.toFixed(0)+'%'},${line.colorUndone} ${line.showProgress.toFixed(0)+'%'},${line.colorUndone} 100%)`
								}:{
                  backgroundColor:line.color
								})
							}" @mousedown="onLineMouseDown(line,$event)" ></div>
		            <template #content>
			            <slot name="shortView" :data="findObj(data,line.key)"></slot>
		            </template>
	            </a-popover>
            </template>
            <template v-else-if="line.type===ECommon_Model_Plan_Table.MILESTONE">
              <div style="top:13px;position: absolute;border-radius: 3px;transform: rotate(45deg)" :style="{
								left:line.left+(type==='day'?30:10)/4+'px',
								width:type==='day'?'15px':'10px',
								backgroundColor:line.color,
								height: type==='day'?'15px':'10px'
							}" :id="line.key"></div>
            </template>
          </div>
          <div v-for="item in lines.filter(item=>item.type===ECommon_Model_Plan_Table.MILESTONE)" style="position: absolute;width: 3px;" :style="{
							top:(item.parentKey?((lines.findIndex(obj=>obj.key===item.parentKey)+1)*41):0)+'px',
							backgroundColor:item.color,
							left:item.left+(type==='day'?30:10)-3+'px',
							height:((lines.findIndex(obj=>obj.key===item.key)-(item.parentKey?lines.findIndex(obj=>obj.key===item.parentKey):-1))*41)+'px'
						}"></div>
          <div style="position: absolute;width: 1px;top: 0px;background-color: purple" :style="{
							left:moment(startDate).startOf('day').diff(startDay,'day')*dayWidth+'px',
							height:(lines.length*41)+'px'
						}"></div>
        </div>
			</a-scrollbar>
		</template>
	</a-split>
</template>

<script setup lang="ts">

import {computed, nextTick, onBeforeUnmount, onMounted, ref, watch} from "vue";
import {GanttDataItem, GanttLine} from "./types";
import moment from "moment";
import {TableData} from "@arco-design/web-vue";
import {ECommon_Model_Plan_Table} from "../../../../../../common/model/plan_table";
import {useI18n} from "vue-i18n";

const emit=defineEmits<{
	change:[item:GanttDataItem,originalStartDate:number,originalEndDate:number,originalDalay:number],
	move:[key:string,destKey:string,type:"in"|"top"|"bottom"]
}>()
const props=defineProps<{
	data:GanttDataItem[]
	startDate:number,
	type:"day"|"month"
}>()
const tableEle=ref<HTMLElement>()
const tableScrollEle=ref<HTMLElement>()
const scrollEle=ref()
const linesEle=ref<HTMLElement>()
const isRightScrollByCode=ref(true)
const isLeftScrollByCode=ref(true)
let selectedItem:GanttDataItem=null
let selectType:"move"|"adjust"
let selectedElement:HTMLElement
let selectedStartDate:number,selectedDependEndDate:number
let originalStartDate:number,originalEndDate:number,originalDalay:number
let offsetX=0
const dayWidth=ref(0)
let tipElement:HTMLElement=null
const {t}=useI18n()
let dragInfo:{
	dropAction:"in"|"top"|"bottom",
	containerElement:HTMLElement,
	key:string,
	type:ECommon_Model_Plan_Table,
	parentKey:string
}=null
const startMonth=computed(()=>{
	return moment(props.startDate).startOf("month")
})

const startYear = computed(()=>{
  return startMonth.value.clone().startOf("year")
})

const startDay=computed(()=>{
  if(props.type==="day") {
    return startMonth.value
  } else if(props.type==="month") {
    return startYear.value
  }
})

const endYear=computed(()=>{
  return endMonth.value.clone().endOf("year")
})

const yearList=computed(()=>{
  let ret=[startYear.value]
  while (1) {
    let obj=ret.at(-1).clone().add(1,"year")
    if(obj.year()<=endYear.value.year()) {
      ret.push(obj)
    } else {
      break
    }
  }
  return ret;
})

const endMonth=computed(()=>{
	let max=0;
	function _max(data:GanttDataItem[]) {
		for(let obj of data) {
			if(obj.endDate>max) {
				max=obj.endDate
			}
			if(obj.children?.length>0) {
				_max(obj.children)
			}
		}
	}
	if(props.data?.length>0) {
		_max(props.data)
		return moment(max).add(1,"month").endOf("month")
	} else {
		return moment(props.startDate).endOf("date")
	}
})

const width=computed(()=>{
  if(props.type==="day") {
    return monthList.value.reduce((previousValue, currentValue) => {
      return previousValue+currentValue.daysInMonth()*dayWidth.value
    },0)
  } else if(props.type==="month") {
    return yearList.value.reduce((previousValue, currentValue) => {
      return previousValue+currentValue.clone().endOf("year").dayOfYear()*dayWidth.value
    },0)
  }
})

const monthList=computed(()=>{
	let ret=[startMonth.value]
	let obj=ret.at(-1)
	while(true) {
		obj=obj.clone().add(1,"month")
		if(obj.year()<endMonth.value.year() || (obj.year()==endMonth.value.year() && obj.month()<=endMonth.value.month())) {
			ret.push(obj)
		} else {
			break
		}
	}
	return ret;

})
const expandedKeys=ref([])

const column=[
	{
		title:t("util.name"),
		slotName:"name",
		headerCellStyle:{
			height:"82px",
			width:"200px",
			overflow:"hidden",
			textOverflow: "ellipsis"
		},
    bodyCellStyle:{
      overflow:"hidden",
	    width:"200px",
	    textOverflow:"ellipsis"
    }
	},
  {
    title:t("util.type"),
    slotName:"type",
    headerCellStyle:{
      height:"82px",
	    overflow:"hidden",
	    textOverflow: "ellipsis"
    },
  },
	{
		title:t("util.manDay"),
		slotName: "manDay",
		headerCellStyle:{
			width:"60px",
			height:"82px",
			overflow:"hidden",
			textOverflow: "ellipsis"
		},
		bodyCellStyle:{
			width:"60px",
		}
	},
	{
		title:t("util.progress"),
		slotName: "progress",
		headerCellStyle:{
			height:"82px",
			width:"80px",
			wordBreak:"break-all",
			overflow:"hidden",
			textOverflow: "ellipsis"
		},
		bodyCellStyle:{
			width:"80px",
			overflow:"hidden",
			textOverflow:"ellipsis"
		}
	},
	{
		title:t("util.depend"),
		slotName: "depend",
		headerCellStyle:{
			height:"82px",
			overflow:"hidden",
			textOverflow: "ellipsis"
		},
		bodyCellStyle:{
			overflow:"hidden",
			textOverflow:"ellipsis",
		}
	},
	{
		title:t("util.delay"),
		slotName: "delay",
		headerCellStyle:{
			height:"82px",
			overflow:"hidden",
			textOverflow: "ellipsis"
		}
	},
	{
		title:t("util.startDate"),
		slotName: "startDate",
		headerCellStyle:{
			height:"82px",
			overflow:"hidden",
			textOverflow: "ellipsis"
		}
	},
	{
		title: t("util.endDate"),
		slotName: "endDate",
		headerCellStyle:{
			height:"82px",
			overflow:"hidden",
			textOverflow: "ellipsis"
		}
	},
	{
		title: t("util.operation"),
		slotName: "operation",
		headerCellStyle:{
			height:"82px",
			overflow:"hidden",
			textOverflow: "ellipsis"
		}
	}
]
const size=ref(0.3)

const lines=ref<GanttLine[]>([])
watch(()=>props.type,()=>{
	nextTick(()=>{
		setTimeout(()=>{
			if(lines.value.length>0) {
				let ele=document.getElementById(lines.value[0].key)
				if(ele) {
					ele.scrollIntoView({
						behavior:"smooth",
						inline:"center"
					})
				}
			}
		},100)
	})
})
watch(()=>[expandedKeys,props.data,props.type],()=>{
	function _handle(data:GanttDataItem[],parentKey:string,startDate:number) {
		for(let i=0;i<data.length;i++) {
			let obj=data[i]
			if(obj.type===ECommon_Model_Plan_Table.STAGE || obj.type===ECommon_Model_Plan_Table.ISSUE) {
				lines.value.push({
					key:obj.key,
					left:moment(obj.startDate).endOf("day").diff(startDay.value,"day")*dayWidth.value,
					width:(moment(obj.endDate).endOf("day").diff(obj.startDate,"day")+1)*dayWidth.value,
					color:obj.type===ECommon_Model_Plan_Table.ISSUE?"rgb(85,171,251)":"green",
					colorUndone:obj.type===ECommon_Model_Plan_Table.ISSUE?"rgba(85,171,251,0.5)":"rgb(156,215,176)",
					type:obj.type,
					depend:obj.depend,
					parentKey,
					progress:obj.progress,
					showProgress:obj.showProgress,
					hasChild:obj.children?.length>0,
				})
				if(obj.children?.length>0) {
					if(expandedKeys.value.includes(obj.key)) {
						_handle(obj.children,obj.key,obj.startDate)
					}
				}
			} else if(obj.type===ECommon_Model_Plan_Table.MILESTONE) {
				let maxEndDate=0;
				for(let j=0;j<i;j++) {
					maxEndDate=Math.max(data[j].endDate,maxEndDate)
				}
				lines.value.push({
					key:obj.key,
					left:moment(maxEndDate==0?startDate:maxEndDate).endOf("day").diff(startDay.value,"day")*dayWidth.value,
					color:obj.completed?"#03ad03":"orange",
					type:obj.type,
					parentKey,
				})
			}
		}
	}
	if(props.type==="day") {
		dayWidth.value=30
	} else if(props.type==="month") {
		dayWidth.value=10
	}
	lines.value=[]
	_handle(props.data,null,props.startDate)
	nextTick(()=>{
		if(tableEle.value) {
			let rows=document.querySelectorAll(".ganttRow")
			if(rows.length>0) {
				rows.forEach((value, key, parent) => {
					let ele=value as HTMLElement
					ele.draggable=true
					let id=lines.value[key].key
					let type=lines.value[key].type
					let parentKey=lines.value[key].parentKey
					ele.setAttribute("type",String(type))
					ele.ondragstart=ev => {
						dragInfo={} as any
						dragInfo.containerElement=document.createElement("div")
						dragInfo.containerElement.style.position="absolute"
						dragInfo.containerElement.style.pointerEvents="none"
						dragInfo.containerElement.style.zIndex="1000"
						document.body.appendChild(dragInfo.containerElement)
						dragInfo.key=id
						dragInfo.type=type
						dragInfo.parentKey=parentKey
						ev.dataTransfer.setDragImage(ele,0,0)
					}
					ele.ondragover=ev => {
						dragInfo.dropAction=null
						dragInfo.containerElement.style.display="none"
						if(id===dragInfo.key) {
							return
						}
						let tempKey=parentKey
						while (tempKey) {
							if(tempKey===dragInfo.key) {
								return;
							}
							tempKey=lines.value.find(item=>item.key===tempKey)?.parentKey
						}
						ev.preventDefault()
						ev.stopPropagation()
						let currentEle=ev.currentTarget as HTMLElement
						let rect=currentEle.getBoundingClientRect()
						let tempEle=currentEle.querySelector(".arco-table-td-content") as HTMLElement
						let firstTdRect=tempEle.getBoundingClientRect()
						dragInfo.containerElement.style.backgroundColor=""
						dragInfo.containerElement.style.border=""
						if(dragInfo.type===ECommon_Model_Plan_Table.ISSUE) {
							let isDragChildIssue=lines.value.find(item=>item.key===dragInfo.parentKey)?.type===ECommon_Model_Plan_Table.ISSUE
							if(isDragChildIssue) {
								if(type===ECommon_Model_Plan_Table.ISSUE && parentKey===dragInfo.parentKey) {
									dragInfo.containerElement.style.backgroundColor="dodgerblue"
									dragInfo.containerElement.style.height="2px"
									dragInfo.containerElement.style.width=rect.width-(firstTdRect.left-rect.left)+"px"
									dragInfo.containerElement.style.left=firstTdRect.left+"px"
									dragInfo.containerElement.style.display="block"
									if(ev.y-rect.top<10) {
										dragInfo.dropAction="top"
										dragInfo.containerElement.style.top=rect.top+"px"
									} else if(rect.top+rect.height-ev.y<10) {
										dragInfo.dropAction="bottom"
										dragInfo.containerElement.style.top=rect.top+rect.height+"px"
									} else {
										return;
									}
								}
								return;
							}
						}
						dragInfo.containerElement.style.display="block"
						if(type===ECommon_Model_Plan_Table.STAGE) {
							if(ev.y-rect.top<10) {
								dragInfo.dropAction="top"
								dragInfo.containerElement.style.top=rect.top+"px"
								dragInfo.containerElement.style.backgroundColor="dodgerblue"
								dragInfo.containerElement.style.height="2px"
								dragInfo.containerElement.style.width=rect.width-(firstTdRect.left-rect.left)+"px"
								dragInfo.containerElement.style.left=firstTdRect.left+"px"
							} else if(rect.top+rect.height-ev.y<10) {
								dragInfo.dropAction="bottom"
								dragInfo.containerElement.style.top=rect.top+rect.height+"px"
								dragInfo.containerElement.style.backgroundColor="dodgerblue"
								dragInfo.containerElement.style.height="2px"
								dragInfo.containerElement.style.width=rect.width-(firstTdRect.left-rect.left)+"px"
								dragInfo.containerElement.style.left=firstTdRect.left+"px"
							} else {
								let tempKey=dragInfo.parentKey
								while (tempKey) {
									if(tempKey===id) {
										return;
									}
									tempKey=lines.value.find(item=>item.key===tempKey)?.parentKey
								}
								dragInfo.dropAction="in"
								dragInfo.containerElement.style.top=rect.top+"px"
								dragInfo.containerElement.style.border="2px solid dodgerblue"
								dragInfo.containerElement.style.height=rect.height+"px"
								dragInfo.containerElement.style.width=rect.width+"px"
								dragInfo.containerElement.style.left=rect.left+"px"
							}
						} else if(type===ECommon_Model_Plan_Table.ISSUE) {
							let isChildIssue=lines.value.find(item=>item.key===parentKey)?.type===ECommon_Model_Plan_Table.ISSUE
							if(isChildIssue) {
								return;
							}
							dragInfo.containerElement.style.backgroundColor="dodgerblue"
							dragInfo.containerElement.style.height="2px"
							dragInfo.containerElement.style.width=rect.width-(firstTdRect.left-rect.left)+"px"
							dragInfo.containerElement.style.left=firstTdRect.left+"px"
							if(ev.y-rect.top<10) {
								dragInfo.dropAction="top"
								dragInfo.containerElement.style.top=rect.top+"px"
							} else if(rect.top+rect.height-ev.y<10) {
								dragInfo.dropAction="bottom"
								dragInfo.containerElement.style.top=rect.top+rect.height+"px"
							} else {
								dragInfo.containerElement.style.display="none"
							}
						} else if(type===ECommon_Model_Plan_Table.MILESTONE) {
							dragInfo.containerElement.style.backgroundColor="dodgerblue"
							dragInfo.containerElement.style.height="2px"
							dragInfo.containerElement.style.width=rect.width-(firstTdRect.left-rect.left)+"px"
							dragInfo.containerElement.style.left=firstTdRect.left+"px"
							if(ev.y-rect.top<10) {
								dragInfo.dropAction="top"
								dragInfo.containerElement.style.top=rect.top+"px"
							} else if(rect.top+rect.height-ev.y<10) {
								dragInfo.dropAction="bottom"
								dragInfo.containerElement.style.top=rect.top+rect.height+"px"
							} else {
								dragInfo.containerElement.style.display="none"
							}
						}
					}
					ele.ondrop=ev => {
						if(dragInfo.dropAction) {
							emit("move",dragInfo.key,id,dragInfo.dropAction)
						}
						if(dragInfo?.containerElement) {
							dragInfo.containerElement.remove()
							dragInfo.containerElement=null
						}
						dragInfo=null;
					}
					ele.ondragend=ev => {
						if(dragInfo?.containerElement) {
							dragInfo.containerElement.remove()
							dragInfo.containerElement=null
						}
						dragInfo=null;
					}
				})
			}
		}
	})
},{
	immediate:true,
	deep:true
})

const findObj=(data:GanttDataItem[],key:string):GanttDataItem=>{
	for(let obj of data) {
		if(obj.key===key) {
			return obj
		}
		if(obj.children?.length>0) {
			let ret=findObj(obj.children,key)
			if(ret) {
				return ret;
			}
		}
	}
}

const onScroll=(ev:MouseEvent)=>{
	if(isRightScrollByCode.value) {
		isRightScrollByCode.value=false
		return
	}
	let ele=ev.currentTarget as HTMLElement
	if(tableScrollEle.value) {
		isLeftScrollByCode.value=true
		tableScrollEle.value.scrollTo({
			top:ele.scrollTop,
			behavior:"smooth"
		})
	}
}

const onCellDbClick=(record:TableData)=>{
	if(lines.value.length>0) {
		let ele=document.getElementById(record.key)
		if(ele) {
			ele.scrollIntoView({
				behavior:"smooth",
				inline:"start"
			})
		}
	}
}

const onLineMouseDown=(line:GanttLine,event:MouseEvent)=>{
  let ele=event.currentTarget as HTMLElement
  let obj=findObj(props.data,line.key)
  selectedItem=obj
  selectedElement=ele
  if(ele.offsetWidth-event.offsetX<20 && ele.style.resize!=="none") {
    selectType="adjust"
  } else {
    selectType="move"
    offsetX=event.offsetX
  }
	originalStartDate=selectedItem.startDate
	originalEndDate=selectedItem.endDate
	originalDalay=selectedItem.delay
	if(line.parentKey) {
		let obj=findObj(props.data,line.parentKey)
		selectedStartDate=obj.startDate
		if(line.depend) {
			let obj=findObj(props.data,line.depend)
			selectedDependEndDate=obj.endDate
		} else {
			selectedDependEndDate=obj.startDate
		}
	} else {
		selectedStartDate=props.startDate
		selectedDependEndDate=props.startDate
	}
}

const onLineMouseUp=(event:MouseEvent)=>{
	if(selectedItem) {
    if(selectType==="adjust") {
      let rect=selectedElement.getBoundingClientRect()
      let days=Math.floor(rect.width/dayWidth.value)
      let endDate=moment(selectedItem.startDate).clone().add(days,"day").toDate().getTime()
      selectedItem.endDate=endDate
	    selectedItem.manDay=moment(endDate).endOf("day").diff(selectedItem.startDate,"day")+1
    }
    selectedElement=null
		offsetX=0
		emit("change",selectedItem,originalStartDate,originalEndDate,originalDalay)
		selectedItem=null
		originalStartDate=null
		originalEndDate=null
    if(tipElement) {
      tipElement.remove()
      tipElement=null
    }
	}
}

const onMouseMove=(event:MouseEvent)=>{
	if(selectedItem) {
    if(selectType==="move") {
      let ele=event.currentTarget as HTMLElement
      let rect=ele.getBoundingClientRect()
      let left=event.x-offsetX-rect.x
      let realLeft=left+ele.offsetLeft
      let days=Math.floor(realLeft/dayWidth.value)
      let startDate=startDay.value.clone().add(days,"day").startOf("day")
      days=moment(selectedItem.endDate).endOf("day").diff(selectedItem.startDate,"day")
      if(startDate.diff(selectedStartDate,"days")>=0) {
        selectedItem.startDate=startDate.toDate().getTime()
      }
      selectedItem.endDate=moment(selectedItem.startDate).add(days,"days").toDate().getTime()
	    if(selectedItem.depend) {
				selectedItem.delay=moment(selectedItem.startDate).endOf("day").diff
				(moment(selectedDependEndDate).endOf("day"),"day")-1
	    } else {
		    selectedItem.delay=moment(selectedItem.startDate).endOf("day").diff
		    (selectedDependEndDate,"day")
	    }
      let rectScroll=scrollEle.value.$el.getBoundingClientRect()
      left=event.x-rectScroll.left
      if(left<20) {
        scrollEle.value.$el.children[0].scrollBy(-10,0)
      } else if(left>rectScroll.width-20) {
        scrollEle.value.$el.children[0].scrollBy(10,0)
      }
    }
		if(props.type=="month") {
      if(!tipElement) {
        tipElement=document.createElement("div")
        tipElement.style.position="absolute"
        tipElement.style.background="rgba(0,0,255,0.1)"
        tipElement.style.height=Math.floor(selectedElement.parentElement.offsetTop/41+1)*41+"px"
        tipElement.style.top="0px"
        linesEle.value.appendChild(tipElement)
        let left=document.createElement("div")
        left.style.paddingRight="10px"
        left.setAttribute("start_date","")
        left.style.boxSizing="border-box"
        left.style.position="absolute"
        left.style.height="20px"
        left.style.left="-70px"
        left.style.bottom="10px"
        left.style.width="70px"
        left.style.zIndex="100"
        left.style.overflow="visible"
        left.style.color="blue"
        left.style.textAlign="right"
        left.style.zIndex="1000"
        tipElement.appendChild(left)
        let right=document.createElement("div")
        right.style.boxSizing="border-box"
        right.style.paddingLeft="10px"
        right.setAttribute("end_date","")
        right.style.position="absolute"
        right.style.height="20px"
        right.style.right="-70px"
        right.style.bottom="10px"
        right.style.width="70px"
        right.style.zIndex="100"
        right.style.overflow="visible"
        right.style.color="blue"
        right.style.textAlign="left"
        tipElement.appendChild(right)
      }
      nextTick(()=>{
        tipElement.style.left=selectedElement.offsetLeft+"px";
        tipElement.style.width=selectedElement.offsetWidth+"px";
        (tipElement.querySelector("[start_date]") as HTMLElement).innerText=moment(selectedItem.startDate).format("MM-DD");
        if(selectType==="move") {
          (tipElement.querySelector("[end_date]") as HTMLElement).innerText=moment(selectedItem.endDate).format("MM-DD");
        } else if(selectType==="adjust") {
          (tipElement.querySelector("[end_date]") as HTMLElement).innerText=moment(selectedItem.startDate).add(Math.floor(selectedElement.offsetWidth/dayWidth.value),"day").format("MM-DD")
        }
      })
    }
	}
}

const tableScrollFunc=(ev:MouseEvent) => {
	if(isLeftScrollByCode.value) {
		isLeftScrollByCode.value=false
		return
	}
	let ele = ev.currentTarget as HTMLElement
	isRightScrollByCode.value=true
	linesEle.value.scrollTo({
		top: ele.scrollTop,
		behavior: "smooth"
	})
}

onMounted(()=>{
	tableScrollEle.value=tableEle.value.querySelectorAll(".arco-scrollbar-container.arco-table-body").item(0) as HTMLElement
	if(tableScrollEle.value) {
		tableScrollEle.value.addEventListener("scroll",tableScrollFunc)
	}
	if(lines.value.length>0) {
		let ele=document.getElementById(lines.value[0].key)
		if(ele) {
			setTimeout(()=>{
				ele.scrollIntoView({
					behavior:"smooth",
					inline:"center"
				})
			},100)
		}
	}
})

onBeforeUnmount(()=>{

})

</script>

<style scoped>
:global(.ganttRow) {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
	cursor: move;
	height: 41px;
}
.line:hover {
	background-color: #f8f8f8;
}
:deep thead span {
	padding: 0px 5px!important;
}
</style>