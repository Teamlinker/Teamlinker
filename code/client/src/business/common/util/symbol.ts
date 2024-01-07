import {InjectionKey, Ref} from "vue";
import {ICommon_Model_Calendar_Setting} from "../../../../../common/model/calendar_setting";

export const injectProjectInfo=Symbol() as InjectionKey<{
    id:string,
    permission:Ref<number>,
    key:Ref<string>
}>

export const injectCalendarSetting=Symbol() as InjectionKey<Ref<ICommon_Model_Calendar_Setting & {
    followDevice:boolean
}>>