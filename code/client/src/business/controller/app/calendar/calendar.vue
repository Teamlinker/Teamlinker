<template>
  <a-layout style="height: 100%">
    <a-layout-sider style="width: 260px">
      <div style="padding: 10px;">
        <a-date-picker
            v-model="datePickerModel"
            hide-trigger
            style="border: 0px;box-shadow: 0px 0px 0px transparent"
            :show-now-btn="false"
            :day-start-of-week="setting?.start_week_day??0"
        />
        <a-divider :margin="1"></a-divider>
        <a-row style="display: flex;justify-content: space-between;margin-top: 10px;align-items: center">
          <span style="font-size: small;color: grey">{{$t("controller.app.calendar.calendar.myCalendars")}}</span>
          <a-button size="mini" type="text" @click="onAddCalendar">
            <template #icon>
              <icon-plus style="color: grey"></icon-plus>
            </template>
          </a-button>
        </a-row>
        <a-checkbox-group direction="vertical" v-model="selectedCalendar">
          <a-checkbox v-for="item in calendarList" :value="item.id" @mouseenter="$event.currentTarget.querySelector('[name=\'setting\']').style.visibility='visible'" @mouseleave="$event.currentTarget.querySelector('[name=\'setting\']').style.visibility='hidden'">
            <span :style="{color:item.color}">{{item.name}}</span>&nbsp;&nbsp;
            <div size="mini" name="setting" style="visibility: hidden;display: inline-block">
              <a-button type="text" size="mini" @click="onEditCalendar($event,item)">
                <template #icon>
                  <icon-edit style="color: grey"></icon-edit>
                </template>
              </a-button>
              <a-button type="text" size="mini" @click="onDeleteCalendar($event,item)">
                <template #icon>
                  <icon-delete style="color: grey"></icon-delete>
                </template>
              </a-button>
            </div>
          </a-checkbox>
        </a-checkbox-group>
      </div>
    </a-layout-sider>
    <a-layout-content style="flex-direction: column;display: flex;padding: 10px;">
      <a-row style="flex: 0 0 40px;display: flex;justify-content: space-between;justify-items: center;flex-wrap: nowrap">
        <a-space size="mini">
          <a-button type="primary" size="mini" @click="onToday">{{$t("controller.app.calendar.calendar.today")}}</a-button>
          <a-button type="text" @click="onPrevious">
            <template #icon>
              <icon-left style="color: rgb(95,99,104);font-size: large"></icon-left>
            </template>
          </a-button>
          <a-button type="text" @click="onNext">
            <template #icon>
              <icon-right style="color: rgb(95,99,104);font-size: large"></icon-right>
            </template>
          </a-button>
          <span style="font-weight: bold">
            {{calendarType=="day"?pickerValue.format("YYYY-MM-DD"):pickerValue.format("YYYY-MM")}}
          </span>
        </a-space>
	      <a-input style="width: 40%" :placeholder="$t('placeholder.typeEventName')" v-model="searchForm.keyword" allow-clear @input="onSearch">
					<template #append>
						<a-popover position="br" @popup-visible-change="visible => !visible && onSearch()">
							<icon-arrow-down style="margin-left: 10px;cursor: pointer"></icon-arrow-down>
							<template #content>
								<a-form :model="{}" layout="vertical">
									<a-form-item :label="$t('util.calendar')">
										<a-select size="small" v-model="searchForm.calendarId">
											<a-option :value="''">{{$t("util.all")}}</a-option>
											<a-option v-for="item in calendarList" :value="item.id">{{item.name}}</a-option>
										</a-select>
									</a-form-item>
									<a-form-item :label="$t('util.startDate')">
										<a-date-picker v-model="searchForm.startDate"></a-date-picker>
									</a-form-item>
									<a-form-item :label="$t('util.endDate')">
										<a-date-picker v-model="searchForm.endDate"></a-date-picker>
									</a-form-item>
									<a-form-item :label="$t('util.location')">
										<a-input size="small" v-model="searchForm.location"></a-input>
									</a-form-item>
								</a-form>
							</template>
						</a-popover>
					</template>
	      </a-input>
        <a-space size="mini">
          <a-radio-group type="button" v-model="calendarType" size="small">
            <a-radio value="day">{{$t("controller.app.calendar.calendar.day")}}</a-radio>
            <a-radio value="week">{{$t("controller.app.calendar.calendar.week")}}</a-radio>
            <a-radio value="month">{{$t("controller.app.calendar.calendar.month")}}</a-radio>
          </a-radio-group>
          <a-button type="text" @click="onShowSetting">
            <template #icon>
              <icon-settings style="color: grey;font-size: large"></icon-settings>
            </template>
          </a-button>
        </a-space>
      </a-row>
      <a-row style="flex: 1 1 auto;border-top: 1px solid lightgray;overflow-y: auto;position: relative">
        <Calendar :mode="calendarType=='month'?'month':'day'" :start-date="startDay" :end-date="endDay" :month="month" :utc-offset="timezoneOffset" :time-zone="setting.timezone" :event-list="calendarEventList" @blank-click="onAddCalendarEvent" @change-event-date="onChangeCalendarEventDate"  v-if="setting?.timezone && !searchForm.keyword && selectedCalendar.length>0">
	        <template #shortView="{timeZone,selectedEvent,maskInfoTop,maskInfoLeft,onClose}">
		        <CalendarEventShortView :time-zone="timeZone" :selected-event="selectedEvent" :mask-info-left="maskInfoLeft" :mask-info-top="maskInfoTop" @edit="(event)=>{onClose();onEditCalendarEvent(event)}" @delete="(event)=>{onClose();onDeleteCalendarEvent(event)}" @close="onClose"></CalendarEventShortView>
	        </template>
        </Calendar>
	      <CalendarEventSearch :list="searchResultList" :timezone="setting.timezone" v-else-if="searchForm.keyword" style="width: 100%;height: 100%" @edit="onEditCalendarEvent" @delete="onDeleteCalendarEvent"></CalendarEventSearch>
      </a-row>
    </a-layout-content>
    <a-drawer :popup-container="root" :visible="settingVisible" @ok="onSetting" unmount-on-close :title="$t('controller.app.calendar.calendar.calendarGlobalSetting')" :closable="false" @cancel="settingVisible=false" :width="400" id="calendarSetting" :drawer-style="{zIndex:100}">
      <a-form :model="{}" layout="vertical">
        <a-form-item :label="$t('controller.app.calendar.calendar.followDeviceTimeZone')">
          <a-switch v-model="settingEdit.followDevice"></a-switch>
        </a-form-item>
        <a-form-item :label="$t('util.timeZone')" v-if="!settingEdit.followDevice">
          <a-select v-model="settingEdit.timezone">
            <a-option v-for="item in timezones" :value="item.id">{{item.label}}</a-option>
          </a-select>
        </a-form-item>
        <a-form-item :label="$t('controller.app.calendar.calendar.startWeekDay')">
          <a-select v-model="settingEdit.start_week_day">
            <a-option v-for="item in ECommon_Calendar_WeekDay" :value="item">{{calendarWeekDayName[item]?$t("util."+calendarWeekDayName[item].toLowerCase()):undefined}}</a-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-drawer>
    <CalendarEventAddSimple style="position: absolute" v-if="isCalendarEventAddSimple" :style="{left:calendarEventAddSimpleLeft,top:calendarEventAddSimpleTop}" :start="calendarEventAddSimpleStartDate" ref="eventAddSimpleEle" @close="isCalendarEventAddSimple=false" @save="saveCalendarEvent" :resource-list="calendarList.map(item=>({id:item.id,name:item.name})).filter(item=>selectedCalendar.includes(item.id))" @more="onShowCalendarEventDetail" :timezone="setting.timezone"></CalendarEventAddSimple>
  </a-layout>
</template>

<script setup lang="ts">
import {
	computed,
	getCurrentInstance,
	markRaw,
	nextTick,
	onBeforeMount,
	onBeforeUnmount,
	provide,
	reactive,
	ref,
	watch
} from "vue";
import moment from "moment";
import "moment-timezone"
import {
	calendarWeekDayName,
	ECommon_Calendar_WeekDay,
	ICommon_Model_Calendar_Setting
} from "../../../../../../common/model/calendar_setting";
import {apiCalendar} from "../../../common/request/request";
import {ICommon_Model_Calendar} from "../../../../../../common/model/calendar";
import {Dialog} from "../../../common/component/dialog/dialog";
import {getRootNavigatorRef} from "../../../../teamOS/common/component/navigator/navigator";
import CalendarEdit from "./calendarEdit.vue";
import {Message} from "@arco-design/web-vue";
import Calendar from "../../../common/component/calendar/calendar.vue"
import CalendarEventAddSimple from "./calendarEventAddSimple.vue";
import {CalendarEventModelType} from "./calendarEventDateEdit.vue";
import {IClient_Calendar_Date, IClient_Calendar_Info} from "../../../common/component/calendar/type";
import {ECommon_Calendar_Recurring_Type} from "../../../../../../common/model/calendar_event";
import CalendarEventEdit from "./calendarEventEdit.vue";
import {injectCalendarSetting} from "../../../common/util/symbol";
import {EClient_EVENTBUS_TYPE, eventBus} from "../../../common/event/event";
import CalendarEventShortView from "./calendarEventShortView.vue";
import {SessionStorage} from "../../../common/storage/session";
import {ICommon_Route_Res_Calendar_ListEvent_Item} from "../../../../../../common/routes/response";
import CalendarEventSearch from "./calendarEventSearch.vue";
import {debounce} from "../../../common/util/helper";
import calendar from "../../../../../../common/routes/calendar";
import {useI18n} from "vue-i18n";
import {DCSType} from "../../../../../../common/types";

const props=defineProps<{
	calendarEventId?:string
}>()
const {t}=useI18n()
const appContext=getCurrentInstance().appContext
const root=getRootNavigatorRef()
const isCalendarEventAddSimple=ref(false)
const calendarEventAddSimpleLeft=ref("0px")
const calendarEventAddSimpleTop=ref("0px")
const calendarEventAddSimpleStartDate=ref<moment.Moment>()
const pickerValue=ref(moment())
const selectedCalendar=ref<string[]>([])
const setting=ref<ICommon_Model_Calendar_Setting & {
  followDevice:boolean
}>()
const settingEdit=ref<ICommon_Model_Calendar_Setting & {
  followDevice:boolean
}>()
const eventAddSimpleEle=ref<InstanceType<typeof CalendarEventAddSimple>>()
const calendarList=ref<DCSType<ICommon_Model_Calendar>[]>([])
const calendarType=ref<"week"|"day"|"month">("week")
const settingVisible=ref(false)
const timezoneOffset=ref(0)
const calendarEventList=ref<IClient_Calendar_Info[]>([])
const organizationUserId=SessionStorage.get("organizationUserId")
const searchForm=reactive({
	keyword:"",
	calendarId:"",
	startDate:null,
	endDate:null,
	location:""
})
const searchResultList=ref<DCSType<ICommon_Route_Res_Calendar_ListEvent_Item>[]>([])
let searchDebounce=null

provide(injectCalendarSetting,setting)
const startDay=computed(()=>{
  let start_week_day=setting.value?.start_week_day
  if(calendarType.value=="day" && start_week_day!==undefined) {
    let ret=pickerValue.value.format("YYYY-MM-DD")
    return ret;
  } else {
    let ret=pickerValue.value.clone().startOf("weeks").format("YYYY-MM-DD")
    return ret;
  }

})

const datePickerModel=computed({
	get() {
		return pickerValue.value.format('YYYY-MM-DD')
	},
	set(newValue) {
		pickerValue.value=moment.tz(newValue,setting.value.timezone)
	}
})
const endDay=computed(()=>{
  let start_week_day=setting.value?.start_week_day
  if(calendarType.value=="day" && start_week_day!==undefined) {
    return pickerValue.value.format("YYYY-MM-DD")
  } else {
    return pickerValue.value.clone().endOf("weeks").format("YYYY-MM-DD")
  }
})
watch([selectedCalendar,calendarType,pickerValue,timezoneOffset],()=>{
  listCalendarEvent()
})
const month=computed(()=>{
  return pickerValue.value.format("YYYY-MM")
})
const getSetting=async ()=>{
  let res=await apiCalendar.getCalendarSetting()
  if(res?.code==0) {
	  moment.updateLocale("en",{
		  week:{
			  dow:res.data.start_week_day
		  }
	  })
    setting.value={
      ...res.data,
      followDevice:res.data.timezone?false:true
    }
    if(setting.value.followDevice) {
      setting.value.timezone=moment.tz.guess()
    }
	  pickerValue.value=moment().tz(setting.value.timezone)
    timezoneOffset.value=moment.tz(setting.value.timezone).utcOffset()/60
  }
}
const timezones=ref(moment.tz.names().map(item=>{
  return {
    label:"(GMT"+moment.tz(item).format('Z')+") " + item,
    value:moment.tz(item).utcOffset(),
    id:item
  }
}).filter(item=>{
  if(!item.id.startsWith("Etc/") && !item.id.startsWith("GMT")) {
    return true
  } else {
    return false
  }
}).sort((a, b) => {
  if(a.value>b.value) {
    return 1
  } else {
    return -1
  }
}))
const listCalendar=async ()=>{
  let res=await apiCalendar.listCalendar()
  if(res?.code==0) {
    calendarList.value=[...res.data.filter(item=>{
      return item.reserved
    }),...res.data.filter(item=>{
      return !item.reserved
    }).sort((a, b) => {
      if(a<b) {
        return -1
      } else {
        return 1
      }
    })]
    selectedCalendar.value=calendarList.value.filter(item=>{
      return !props.calendarEventId && item.reserved
    }).map(item=>item.id)
  }
}
const onAddCalendar=async ()=>{
  let ret=await Dialog.open(root.value,appContext,t("controller.app.calendar.calendar.addCalendar"),markRaw(CalendarEdit),{
    type:"add",
  })
  if(ret) {
    listCalendar()
  }
}
const onEditCalendar=async (event:MouseEvent,item)=>{
	event.stopPropagation()
	event.preventDefault()
  let ret=await Dialog.open(root.value,appContext,t("controller.app.calendar.calendar.editCalendar"),markRaw(CalendarEdit),{
    type:"edit",
    item
  })
  if(ret) {
    listCalendar()
  }
}
const onDeleteCalendar=async (event:MouseEvent,item)=>{
	event.stopPropagation()
	event.preventDefault()
  let ret=await Dialog.confirm(root.value,appContext,t("tip.deleteCalendar"))
  if(ret) {
    let res=await apiCalendar.removeCalendar({
      calendarId:item.id
    })
    if(res?.code==0) {
      Message.success(t("tip.deleteSuccess"))
      if(selectedCalendar.value.includes(item.id)) {
        selectedCalendar.value=selectedCalendar.value.splice(selectedCalendar.value.indexOf(item.id),1)
      }
      listCalendar()
    } else {
      Message.error(res.msg)
    }
  }
}
const onSetting=async ()=>{
  let res=await apiCalendar.editCalendarSetting({
    timezone:settingEdit.value.followDevice?"":settingEdit.value.timezone,
    startWeekDay:settingEdit.value.start_week_day
  })
  if(res?.code==0) {
    Message.success(t("tip.updateSuccess"))
    settingVisible.value=false
    getSetting()
  }
}
const onPrevious=()=>{
  if(calendarType.value=="day") {
    pickerValue.value=pickerValue.value.clone().add(-1,"days")
  } else if(calendarType.value=="week") {
    pickerValue.value=pickerValue.value.clone().add(-1,"weeks")
  } else if(calendarType.value=="month") {
    pickerValue.value=pickerValue.value.clone().add(-1,"months")
  }
}
const onNext=()=>{
  if(calendarType.value=="day") {
    pickerValue.value=pickerValue.value.clone().add(1,"days")
  } else if(calendarType.value=="week") {
    pickerValue.value=pickerValue.value.clone().add(1,"weeks")
  } else if(calendarType.value=="month") {
    pickerValue.value=pickerValue.value.clone().add(1,"months")
  }
}
const onToday=()=>{
  pickerValue.value=moment().tz(setting.value.timezone)
}
const onShowSetting=async ()=>{
  settingVisible.value=true
  settingEdit.value={
    ...setting.value
  }
}
const onAddCalendarEvent=async (date:moment.Moment, point:{
  x:number,
  y:number
})=>{
  if(isCalendarEventAddSimple.value) {
    isCalendarEventAddSimple.value=false
  } else {
    isCalendarEventAddSimple.value=true
    let rect=root.value.getBoundingClientRect()
    let offsetLeft=point.x-rect.left
    if(offsetLeft>410) {
      calendarEventAddSimpleLeft.value=offsetLeft-5-400+"px"
    } else {
      calendarEventAddSimpleLeft.value=offsetLeft+5+"px"
    }
    let offsetTop=point.y-rect.top
    if(offsetTop>360) {
      calendarEventAddSimpleTop.value=offsetTop-5-350+"px"
    } else {
      calendarEventAddSimpleTop.value=offsetTop+5+"px"
    }
    calendarEventAddSimpleStartDate.value=date
    nextTick(()=>{
      eventAddSimpleEle.value.$el.focus()
    })
  }
}
const saveCalendarEvent=async (title:string, dateInfo:CalendarEventModelType, calendarId:string)=>{
  if(dateInfo.end<dateInfo.start) {
    Message.error(t("tip.endDateLess"))
    return
  }
  let res=await apiCalendar.addCalendarEvent({
    calendarId,
    name:title,
    startTime:dateInfo.start,
    endTime:dateInfo.end,
    all_day:dateInfo.isAllDay,
    recurring:dateInfo.recurring,
    recurring_day:dateInfo.recurring_day,
	  meeting:false
  })
  if(res?.code==0) {
    listCalendarEvent()
    isCalendarEventAddSimple.value=false
  }
}

const listCalendarEvent=async ()=>{
  calendarEventList.value=[]
  if(selectedCalendar.value.length>0) {
    let start:number,end:number
    if(calendarType.value=="day" || calendarType.value=="week") {
      start=moment.tz(startDay.value,setting.value.timezone).set({
        hour:0,
        minute:0,
        second:0
      }).toDate().getTime()
      end=moment.tz(endDay.value,setting.value.timezone).set({
        hour:23,
        minute:59,
        second:59
      }).toDate().getTime()
    } else {
      start=moment.tz(month.value,setting.value.timezone).startOf("month").startOf("week").toDate().getTime()
      end=moment.tz(month.value,setting.value.timezone).endOf("month").endOf("week").toDate().getTime()
    }
    let arrPromise=selectedCalendar.value.map(item=>{
      return apiCalendar.listCalendarEvent({
        calendarId:item,
        start,
        end
      })
    })
    let arr=await Promise.all(arrPromise)
    for(let res of arr) {
      if(res?.code==0) {
        calendarEventList.value=calendarEventList.value.concat(res.data.map(item=>{
          let objStart=moment(item.start_time).tz(setting.value.timezone)
          let objEnd=moment(item.end_time).tz(setting.value.timezone)
          return {
            id:item.id,
            resource:{
              id:item.calendar.id,
              name:item.calendar.name
            },
            reminder:item.reminder_minutes,
            isAllDay:!!item.all_day,
            color:item.color,
            startDate:{
              year:objStart.year(),
              month:objStart.month()+1,
              day:objStart.date(),
              hour:objStart.hour(),
              minute:objStart.minute()
            },
            endDate:{
              year:objEnd.year(),
              month:objEnd.month()+1,
              day:objEnd.date(),
              hour:objEnd.hour(),
              minute:objEnd.minute()
            },
            name:item.name,
	          created_by:item.created_by,
	          fixed:item.created_by?.organizationUserId!=organizationUserId
          }
        }))
      }
    }
  }
}
const onDeleteCalendarEvent=async (event:IClient_Calendar_Info)=>{
  let ret=await Dialog.confirm(root.value,appContext,t("tip.deleteEvent"))
  if(ret) {
    let res=await apiCalendar.removeCalendarEvent({
      calendarEventId:event.id
    })
    if(res?.code==0) {
      Message.success(t("tip.deleteSuccess"))
      listCalendarEvent()
    }
  }
}
const onChangeCalendarEventDate=async (event:IClient_Calendar_Info, originalDateRange:{
  start:IClient_Calendar_Date,
  end:IClient_Calendar_Date
}, type:"resize"|"move")=>{
	if(event.fixed) {
		event.startDate=originalDateRange.start
		event.endDate=originalDateRange.end
		return
	}
  let res=await apiCalendar.editCalendarEventDate({
    calendarEventId:event.id,
    startTime:momentFromCalendarInfoDate(event.startDate).toDate().getTime(),
    endTime:momentFromCalendarInfoDate(event.endDate).toDate().getTime()
  })
  if(res?.code==0) {
    if(res.data.recurring!==ECommon_Calendar_Recurring_Type.NONE) {
      listCalendarEvent()
    }
  }
}
const onEditCalendarEvent=async (event:IClient_Calendar_Info)=>{
  let ret=await Dialog.open(root.value,appContext,t("controller.app.calendar.calendar.editEvent"),markRaw(CalendarEventEdit),{
    type:"edit",
    calendarEventId:event.id,
    resourceList:calendarList.value.map(item=>({id:item.id,name:item.name})).filter(item=>selectedCalendar.value.includes(item.id)),
	  timezone:setting.value.timezone
  })
  if(ret) {
    listCalendarEvent()
  }
}

const onShowCalendarEventDetail=async (title:string,dateInfo:CalendarEventModelType,calendarId:string)=>{
  isCalendarEventAddSimple.value=false
  let ret=await Dialog.open(root.value,appContext,t("controller.app.calendar.calendar.addEvent"),markRaw(CalendarEventEdit),{
    type:"add",
    calendarId:calendarId,
    resourceList:calendarList.value.map(item=>({id:item.id,name:item.name})).filter(item=>selectedCalendar.value.includes(item.id)),
    name:title,
    date:dateInfo,
	  timezone:setting.value.timezone
  })
  if(ret) {
    listCalendarEvent()
  }
}

const onSearch=async ()=>{
	if(!searchDebounce) {
		searchDebounce=debounce(async ()=>{
			if(!searchForm.keyword) {
				return
			}
			let res=await apiCalendar.searchCalendarEvent({
				location:searchForm.location,
				keyword:searchForm.keyword,
				...(searchForm.calendarId!=="" && {
					calendarId:searchForm.calendarId
				}),
				...(searchForm.startDate && {
					start:moment.tz(searchForm.startDate,setting.value.timezone).startOf("day").toDate().getTime()
				}),
				...(searchForm.endDate && {
					end:moment.tz(searchForm.endDate,setting.value.timezone).endOf("day").toDate().getTime()
				})
			})
			if(res?.code==0) {
				searchResultList.value=res.data
			}
		},300)
	}
	searchDebounce()
}

const momentFromCalendarInfoDate=(date:IClient_Calendar_Date)=>{
  let obj=moment.tz({
    year:date.year,
    month:date.month-1,
    date:date.day,
    hour:date.hour,
    minute:date.minute
  },setting.value.timezone)
  return obj;
}
const handlePropsCalendarEventId=async (calendarEventId:string)=>{
	let res=await apiCalendar.getCalendarEvent({
		calendarEventId:calendarEventId
	})
	if(res?.code==0) {
		selectedCalendar.value=[res.data.calendar_id]
		datePickerModel.value=res.data.start_time
		calendarType.value="day"
	} else {
		Message.error(res.msg)
	}
}
onBeforeUnmount(()=>{
	eventBus.off(EClient_EVENTBUS_TYPE.OPEN_CALENDAR_EVENT,handlePropsCalendarEventId)
})
onBeforeMount(async ()=>{
	eventBus.on(EClient_EVENTBUS_TYPE.OPEN_CALENDAR_EVENT,handlePropsCalendarEventId)
	await Promise.all([
		getSetting(),
		listCalendar()
	])
	if(props.calendarEventId) {
		handlePropsCalendarEventId(props.calendarEventId)
	}
})

</script>

<style scoped>

</style>