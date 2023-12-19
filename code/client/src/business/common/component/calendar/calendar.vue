<template>
  <div style="width: 100%;display: flex;flex-direction: column;height: 100%" onselectstart="return false" ref="rootEle">
    <template v-if="mode=='day'">
      <div style="width: 100%;display: flex;flex: 1 0 60px">
        <div style="height: 100%;flex:0 0 50px;position: relative">
          <div style="position: absolute;bottom: 0px;color: gray;font-size: smaller;overflow: hidden;text-overflow: ellipsis;max-width: 51px" v-if="utcOffset!==undefined" :style="{right:Number.isInteger(utcOffset)?'2px':'0px'}">
            {{"GMT"+(utcOffset>=0?"+":"-")+Math.abs(utcOffset)}}
          </div>
        </div>
        <div style="height: 100%;flex:1 1 auto;display: flex;flex-direction: column">
          <div style="width: 100%;display: flex">
            <div v-for="(item,index) in days" :key="index" style="flex: 1 1 0%;display: flex;flex-direction: column;text-align: center;height: 60px;justify-content: center">
              <span style="color: gray;font-size: small">{{item.format('dddd')}}</span>
              <span style="color: gray;margin-top: 5px">{{item.format('MM-DD')}}</span>
            </div>
          </div>
          <div style="width: 100%">
            <template v-if="crossEventList && crossEventList.data.length>0">
              <div :style="{height:crossEventList.height}" style="width: 100%;position: relative;display: flex">
                <div v-for="item in crossEventList.data" :key="item.id" style="position: absolute;display: flex;padding-right: 15px;margin-bottom: 5px" :style="{left:item.left,top:item.top,right:item.right,height:item.height}" @mouseup="onMouseUp">
                  <div style="flex: 0 0 6px;border-radius: 5px 0 0 5px" :style="{backgroundColor:item.color}"></div>
                  <div style="flex: 1 1 auto;padding: 2px 5px;border-radius: 0 5px 5px 0;overflow: hidden;text-overflow: ellipsis;word-wrap: break-word;color: white;display: flex;align-items: center" @mouseup="onMouseUp($event,item)" :data-id="item.id" :style="{backgroundColor:handleColorAlpha(item.color)}">
                    {{item.name}}
                  </div>
                </div>
                <div v-for="(item,index) in days" :key="index" style="flex: 1 1 0%;border-left: 1px lightgray solid;height: 100%;">
                </div>
              </div>
            </template>
          </div>
        </div>
        <div style="height: 100%;flex: 0 0 15px" v-if="isScrollVisible"></div>
      </div>
      <div style="width: 100%;flex:1 1 calc(100% - 60px);display: flex;overflow-y: auto;" ref="contentRef" tabindex="-1" @mousemove="onMouseMove" @mousedown="onMouseDown" @mouseup="onMouseUp" @mouseleave="onMouseLeave" @keydown="onKeyDown">
        <div style="height: 100%;flex:0 0 50px;display: flex;flex-direction: column">
          <div v-for="n in 24" :key="n" style="flex: 0 0 60px;width: 100%;">
            <div style="position: relative;top: -8px;left: 12px;color: gray;font-size: small" v-if="n>1">
              {{n-1>=10?n-1:`0${n-1}`}}:00
            </div>
          </div>
        </div>
        <div style="height: auto;flex: 1 1 auto;display: flex;position: relative" ref="eventListRef">
          <div v-for="(item,index) in days" :key="index" style="flex: 1 1 auto;display: flex;flex-direction: column;position: relative">
            <div style="position: absolute;right: 15px;left:0px;top:0px;bottom:0px;height: 1440px;">
              <div style="position: absolute;height: 2px;background-color: red;z-index: 100;width: 100%" v-if="now.isSame(item,'days')" :style="{top:todayTop()}"></div>
              <div style="position: absolute;color: white;display: flex;" v-for="item in eventList[index]" :key="item.id" :style="{left:item.left,top:item.top,right:item.right,bottom:item.bottom}">
                <div style="flex: 0 0 6px;border-radius: 5px 0 0 5px" :style="{backgroundColor:item.color}"></div>
                <div style="flex: 1 1 auto;border-radius: 0 5px 5px 0;display: flex;flex-direction: column;overflow: hidden" :style="{backgroundColor:handleColorAlpha(item.color)}">
                  <div style="overflow: hidden;text-overflow: ellipsis;word-break: break-all;flex: 1 1 auto;padding: 2px 5px;cursor:move" :data-id="item.id" :data-index="JSON.stringify(item.index)" data-type="move">{{item.name}}</div>
                  <div style="flex: 0 0 8px;width: 100%;cursor: ns-resize" :data-id="item.id" :data-index="JSON.stringify(item.index)" data-type="resize"></div>
                </div>
              </div>
            </div>
            <div v-for="n in 24" :key="n" style="flex: 0 0 60px;width: 100%;border-left: 1px solid lightgray;box-sizing: border-box" :style="{borderBottom:n<24?'1px solid lightgray':'',borderTop:n==1?'1px solid lightgray':''}">

            </div>
          </div>
        </div>
      </div>
    </template>
    <template v-if="mode=='month'">
      <div style="flex:0 0 40px;display: flex;">
        <div style="flex: 1 1 0px;display: flex;align-items: center;justify-content: center;color: gray" v-for="(item,index) in weekDays" :style="{borderLeft:index>0?'1px solid lightgray':''}">{{item}}</div>
      </div>
      <div style="flex: 1 1 auto;display: flex;flex-direction: column;position: relative" ref="eventListRef" tabindex="-1" @mousemove="onMouseMove" @mousedown="onMouseDown" @mouseup="onMouseUp" @mouseleave="onMouseLeave" @keydown="onKeyDown" name="eventListMonth">
        <div style="position: absolute;display: none;flex-direction: column;background-color: white;z-index: 100;border-radius: 5px;box-shadow: 0px 0px 3px 3px rgba(169, 169, 169, 0.2);padding: 10px" ref="moreEle" tabindex="-1" @blur="onBlur" name="more">
          <div v-for="item in moreColumn" style="line-height:20px;border-radius: 5px;padding-left: 5px;color: white;overflow: hidden;text-overflow: ellipsis;white-space: nowrap;flex: 0 0 20px;margin-bottom: 5px;cursor: pointer" :style="{backgroundColor:objManage.checkCrossEvent(item)?item.color:'',color:objManage.checkCrossEvent(item)?'white':item.color}" name="more" :data-id="item.id">
            {{moment.tz({hour:item.startDate.hour,minute:item.startDate.minute},props.timeZone).format("HH:mm")+" "+item.name}}
          </div>
        </div>
        <div v-for="index in days.length/7" style="flex: 1 1 0px;display: flex;position: relative;border-top: 1px solid lightgray">
          <div v-for="(item,index1) in days.slice((index-1)*7,(index-1)*7+7)" style="flex: 1 1 0px;display: flex;flex-direction: column" :style="{borderLeft:index1>0?'1px lightgray solid':''}">
            <div style="flex: 0 0 30px;display: flex;justify-content: center;align-items: center" :style="{color:now.isSame(item,'day')?'blue':'gray'}">
              {{item.format("MM-DD")}}
            </div>
          </div>
          <template v-for="(item,index1) in monthEventList[index-1]">
            <div style="position: absolute;line-height:20px;border-radius: 5px;padding-left: 5px;color: white;overflow: hidden;text-overflow: ellipsis;white-space: nowrap;cursor: move" :style="{left:item.left,top:item.top,right:item.right,height:item.height,backgroundColor:objManage.checkCrossEvent(item)?item.color:'',color:objManage.checkCrossEvent(item)?'white':item.color}" :data-id="item.id" :data-index="JSON.stringify(item.index)" data-type="move" v-if="parseInt(item.top)+parseInt(item.height)<monthDayHeight-30">
              {{moment.tz({hour:item.startDate.hour,minute:item.startDate.minute},props.timeZone).format("HH:mm")+" "+item.name}}
            </div>
            <div class="eventMore" style="position: absolute;line-height:20px;border-radius: 5px;padding-left: 5px;font-weight: bold;color: rgb(3,155,229)" :style="{left:item.left,top:item.top,right:item.right,height:item.height}" v-else-if="check(index,index1)" @click="onMore(index-1,$event)" name="more">{{$t("util.more")}}</div>
          </template>
        </div>
      </div>
    </template>
  </div>
	<div style="height: 100%;width: 100%;position: absolute;left: 0;top: 0;z-index: 100" v-if="isMask" @click="$event.target===$event.currentTarget && (isMask=false)">
		<slot name="shortView" :timeZone="timeZone" :selectedEvent="selectedEvent" :maskInfoTop="maskInfoTop" :maskInfoLeft="maskInfoLeft" :onClose="()=>{isMask=false}"></slot>
	</div>
</template>

<script setup lang="ts">
import {IClient_Calendar_Date, IClient_Calendar_Info} from "./type";
import {CalendarManage} from "./calendarManage";
import {nextTick, onBeforeUnmount, onMounted, ref, watchEffect} from "vue";
import moment from "moment";
import "moment-timezone"

const emit=defineEmits<{
  (e:"changeEventDate", event:IClient_Calendar_Info, originalDateRange:{
    start:IClient_Calendar_Date,
    end:IClient_Calendar_Date
  }, type:"resize"|"move"):void
  (e:"blankClick",date:moment.Moment,point:{
    x:number,
    y:number
  }):void
}>()
const props=defineProps<{
  eventList:IClient_Calendar_Info[],
  startDate?:string,
  endDate?:string,
  mode:"day"|"month",
  month?:string,
  utcOffset?:number,
	timeZone:string
}>()
const isMask=ref(false)
const maskInfoLeft=ref("")
const maskInfoTop=ref("")
const selectedEvent=ref<IClient_Calendar_Info>()
const rootEle=ref<HTMLElement>()
const weekDays=ref(moment.weekdays())
const objManage=new CalendarManage()
const days=ref<moment.Moment[]>([])
const eventList=ref<(IClient_Calendar_Info & {
  left:string,
  top:string,
  bottom:string,
  right:string,
  index:[number,number,number]
})[][]>([])
const crossEventList=ref<{
  data:(IClient_Calendar_Info & {
    left:string,
    top:string,
    height:string,
    right:string
  })[],
  height:string
}>()
const monthEventList=ref<(IClient_Calendar_Info & {
  left:string,
  top:string,
  height:string,
  right:string,
  index:[number,number,number]
})[][]>()
const isScrollVisible=ref(false)
const contentRef=ref<HTMLElement>()
const eventListRef=ref<HTMLElement>()
const eventResizeStartRowIndex=ref<[number,number,number]>(null)
const eventResizeStartY=ref<number>(null)
const eventResizeEndDate=ref<IClient_Calendar_Date>(null)
const eventResizeStartDate=ref<IClient_Calendar_Date>(null)
const eventActionEvent=ref<IClient_Calendar_Info>(null)
const eventActionType=ref<"resize"|"move">()
const monthDayHeight=ref(0)
const moreEle=ref<HTMLElement>()
const moreColumn=ref<IClient_Calendar_Info[]>([])
let resizeObserver:ResizeObserver
const now=ref<moment.Moment>(moment().tz(props.timeZone))
const isMouseMove=ref(false)
let nowInterval
watchEffect(()=>{
	objManage.setTimeZone(props.timeZone)
	now.value=moment().tz(props.timeZone)
  if(props.mode=="day") {
    objManage.initByDay(props.startDate,props.endDate,props.eventList)
    days.value=objManage.getDays()
    eventList.value=objManage.calculateEventPosition()
    crossEventList.value=objManage.calculateCrossEventPosition()
    nextTick(()=>{
      isScrollVisible.value=contentRef.value.scrollHeight>contentRef.value.clientHeight
    })
  } else if(props.mode=="month"){
    objManage.initByMonth(props.month,props.eventList)
    days.value=objManage.getWeekDaysInMonth()
    monthEventList.value=objManage.calculateMonthEventPosition()
    if(eventListRef.value) {
      nextTick(()=>{
        if(resizeObserver) {
          resizeObserver.disconnect()
        }
        let ele=rootEle.value.querySelector("[name='eventListMonth']")
        resizeObserver=new ResizeObserver((entries, observer)=>{
          for(let entry of entries) {
            monthDayHeight.value=entry.contentRect.height/monthEventList.value.length
          }
        })
        resizeObserver.observe(ele)
        monthDayHeight.value=eventListRef.value.offsetHeight/monthEventList.value.length
      })
    }
  }

})

const onMouseDown=(event:MouseEvent)=>{
  let ele=event.target as HTMLElement
  isMouseMove.value=false
  if(ele.dataset.id) {
    if(ele.dataset.index) {
      eventResizeStartRowIndex.value=JSON.parse(ele.dataset.index)
      eventActionEvent.value=objManage.getEventFromPosition(eventResizeStartRowIndex.value)
    } else {
      eventActionEvent.value=moreColumn.value.filter(item=>{
        return item.id==ele.dataset.id
      })[0]
    }
    if(ele.dataset.type=="resize") {
      let rect=ele.parentElement.getBoundingClientRect()
      eventResizeStartY.value=rect.top
	    eventResizeStartDate.value=JSON.parse(JSON.stringify(eventActionEvent.value.startDate))
      eventResizeEndDate.value=JSON.parse(JSON.stringify(eventActionEvent.value.endDate))
      eventActionType.value="resize"
    } else if(ele.dataset.type=="move") {
      eventActionType.value="move"
      eventResizeStartY.value=event.clientY
      eventResizeStartDate.value=JSON.parse(JSON.stringify(eventActionEvent.value.startDate))
      eventResizeEndDate.value=JSON.parse(JSON.stringify(eventActionEvent.value.endDate))
    }
  }
}
const onMouseMove=(event:MouseEvent)=>{
  if(eventResizeStartRowIndex.value) {
    isMouseMove.value=true
    if(eventActionType.value=="resize") {
      let offset=event.clientY-eventResizeStartY.value
      objManage.adjustEventRange(eventResizeStartRowIndex.value,offset)
    } else if(eventActionType.value=="move") {
      if(props.mode=="day") {
        let offset=event.clientY-eventResizeStartY.value
        let dayWidth=eventListRef.value.offsetWidth/days.value.length
        let dayIndex=Math.floor((event.clientX-eventListRef.value.getBoundingClientRect().left)/dayWidth)
        objManage.adjustEventMove(eventActionEvent.value,eventResizeStartDate.value,eventResizeEndDate.value,dayIndex,offset)
      } else if(props.mode=="month") {
        let dayHeight=eventListRef.value.offsetHeight/monthEventList.value.length
        let weekRow=Math.floor((event.clientY-eventListRef.value.getBoundingClientRect().top)/dayHeight)
        let dayWidth=eventListRef.value.offsetWidth/7
        let dayIndex=Math.floor((event.clientX-eventListRef.value.getBoundingClientRect().left)/dayWidth)
        objManage.adjustEventMoveByMonth(eventActionEvent.value,eventResizeStartRowIndex.value,eventResizeStartDate.value,eventResizeEndDate.value,dayIndex,weekRow)
      }
    }
  }
}
const onMouseUp=(event:MouseEvent,item?:IClient_Calendar_Info)=>{
  let element=event.target as HTMLElement
  if(!isMouseMove.value && element.dataset.id) {
    if(item) {
      event.stopPropagation()
    }
    selectedEvent.value=item??eventActionEvent.value
    isMask.value=true
    while (element.style.position!="absolute") {
      element=element.parentElement
    }
    let offset=element.getBoundingClientRect().left-rootEle.value.getBoundingClientRect().left
    if(offset>300) {
      maskInfoLeft.value=offset-300+"px"
    } else {
      maskInfoLeft.value=offset+5+"px"
    }
    offset=event.y-rootEle.value.getBoundingClientRect().top
    if(offset>125) {
      maskInfoTop.value=offset-130+"px"
    } else {
      maskInfoTop.value=offset+"px"
    }
  } else if(isMouseMove.value) {
    if(eventResizeStartRowIndex.value) {
      emit("changeEventDate",eventActionEvent.value,{
        start:eventResizeStartDate.value,
        end:eventResizeEndDate.value
      },eventActionType.value)
    }
  } else {
    let currentTarget=event.currentTarget as HTMLElement
    let offsetLeft=event.clientX-currentTarget.getBoundingClientRect().left
    if(offsetLeft>currentTarget.clientWidth || element.getAttribute("name")=="more") {
      return
    }
    let date:moment.Moment
    if(props.mode=="day") {
      let minute=event.clientY-eventListRef.value.getBoundingClientRect().top
      let hour=Math.floor(minute/60)
      minute=Math.ceil(minute-hour*60)
      date=days.value[0].clone()
      date.set({
        hour,
        minute
      })
      let dayIndex=Math.floor((event.clientX-eventListRef.value.getBoundingClientRect().left)/(eventListRef.value.clientWidth/days.value.length))
      date.add(dayIndex,"days")
    } else if(props.mode=="month") {
      let indexDay=Math.floor((event.clientX-eventListRef.value.getBoundingClientRect().left)/(eventListRef.value.offsetWidth/7))
      let weekRow=Math.floor((event.clientY-eventListRef.value.getBoundingClientRect().top)/(eventListRef.value.offsetHeight/monthEventList.value.length))
      date=days.value[0].clone()
      date.add(weekRow*7+indexDay,"days")
    }
    emit("blankClick",date,{
      x:event.clientX,
      y:event.clientY
    })
  }
  eventResizeStartRowIndex.value=null;
  isMouseMove.value=false
  eventActionEvent.value=null;
}
const onMouseLeave=(event:MouseEvent)=>{
  eventResizeStartRowIndex.value=null;
  eventActionEvent.value=null;
}
const onKeyDown=(event:KeyboardEvent)=>{
  if(eventResizeStartRowIndex.value && event.key=="Escape") {
    if(eventActionType.value=="resize") {
      let event=objManage.getEventFromPosition(eventResizeStartRowIndex.value)
      event.endDate=eventResizeEndDate.value
    } else if(eventActionType.value=="move") {
      eventActionEvent.value.endDate=eventResizeEndDate.value
      eventActionEvent.value.startDate=eventResizeStartDate.value
      eventActionEvent.value=null;
    }
    eventResizeStartRowIndex.value=null;
  }
}
onMounted(()=>{
  if(props.mode=="month") {
    resizeObserver=new ResizeObserver((entries, observer)=>{
      for(let entry of entries) {
        monthDayHeight.value=entry.contentRect.height/monthEventList.value.length
      }
    })
    resizeObserver.observe(eventListRef.value)
    monthDayHeight.value=eventListRef.value.offsetHeight/monthEventList.value.length
  }
  function assignMoment() {
    now.value=moment().tz(props.timeZone)
    nowInterval=setTimeout(assignMoment,1000*60)
  }
  nowInterval=setTimeout(assignMoment,1000*60)
})
onBeforeUnmount(()=>{
  if(props.mode=="month") {
    resizeObserver.unobserve(eventListRef.value)
    resizeObserver.disconnect()
  }
  clearTimeout(nowInterval)
})
const check=(index:number,index1:number)=>{
  return monthEventList.value[index-1][index1-1] && parseInt(monthEventList.value[index-1][index1-1].top)+parseInt(monthEventList.value[index-1][index1-1].height)<monthDayHeight.value-30
}
const onMore=(weekRow:number,event:MouseEvent)=>{
  event.stopPropagation()
  let dayIndex=Math.floor((event.clientX-eventListRef.value.getBoundingClientRect().left)/(eventListRef.value.offsetWidth/7))
  moreColumn.value=objManage.getEventListFromDay(weekRow,dayIndex)
  moreEle.value.style.display="flex"
  moreEle.value.style.left="calc("+dayIndex/7*100+"% - 30px)"
  moreEle.value.style.right="calc("+(7-dayIndex-1)/7*100+"% - 30px)"
  moreEle.value.style.top="calc("+weekRow/monthEventList.value.length*100+"% + 30px)"
  moreEle.value.focus()
}
const onBlur=()=>{
  moreEle.value.style.display="none"
}
const todayTop=()=>{
  let ret=(now.value.hour()*60+now.value.minute())/(60*24)*100+'%'
  return ret;
}
const handleColorAlpha=(color:string)=>{
  let regex=color.match(/(\d+).*?(\d+).*?(\d+)/)
  return `rgba(${regex[1]},${regex[2]},${regex[3]},0.6)`
}
</script>

<style scoped>
.eventMore:hover {
  background-color: #efefef;
  cursor: pointer;
}
.svg {
  fill: rgb(95,99,104);
}
.svg:hover {
  background-color: #efefef;
  cursor: pointer;
}
</style>