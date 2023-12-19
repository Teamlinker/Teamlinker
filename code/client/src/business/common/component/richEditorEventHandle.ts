import {ECommon_Content_Line_Config_Type, ICommon_Content_Line_Config} from "../../../../../common/model/content";
import {
    apiBoard,
    apiCalendar,
    apiFile,
    apiFinder,
    apiIssue,
    apiMeeting,
    apiOrganization,
    apiProject,
    apiRelease,
    apiWiki
} from "../request/request";
import {Dialog} from "./dialog/dialog";
import {AppContext, markRaw, Ref} from "vue";
import ProjectFilter from "../../controller/app/wiki/popMenu/projectFilter.vue";
import ProjectIssueFilter from "../../controller/app/wiki/popMenu/projectIssueFilter.vue";
import ProjectReleaseFilter from "../../controller/app/wiki/popMenu/projectReleaseFilter.vue";
import WikiFilter from "../../controller/app/wiki/popMenu/wikiFilter.vue";
import WikiItemFilter from "../../controller/app/wiki/popMenu/wikiItemFilter.vue";
import CalendarEventFilter from "../../controller/app/wiki/popMenu/calendarEventFilter.vue";
import MeetingRoomFilter from "../../controller/app/wiki/popMenu/meetingRoomFilter.vue";
import {EClient_EVENTBUS_TYPE, eventBus} from "../event/event";
import {SessionStorage} from "../storage/session";
import {DropParam} from "../../../teamOS/common/directive/drop";
import {EClient_Drag_Type, IClient_Drag_Element} from "../../../teamOS/common/directive/drag";
import {ECommon_Model_Finder_Shortcut_Type} from "../../../../../common/model/finder_item";
import BoardSprintFilter from "@/business/controller/app/wiki/popMenu/boardSprintFilter.vue";
import i18n from "@/business/common/i18n/i18n";
import {Message} from "@arco-design/web-vue";

export class RichEditorEventHandle {
    static popMenuList=[
        {
            type: ECommon_Content_Line_Config_Type.IMAGE,
            title: "Image"
        },
        {
            type: ECommon_Content_Line_Config_Type.FILE,
            title: "File"
        },
        {
            type: ECommon_Content_Line_Config_Type.PROJECT,
            title: "Project"
        },
        {
            type: ECommon_Content_Line_Config_Type.PROJECT_ISSUE,
            title: "Project Issue"
        },
        {
            type: ECommon_Content_Line_Config_Type.PROJECT_RELEASE,
            title: "Project Release"
        },
        {
            type: ECommon_Content_Line_Config_Type.BOARD_SPRINT,
            title: "Board Sprint"
        },
        {
            type: ECommon_Content_Line_Config_Type.WIKI,
            title: "Wiki Space"
        },
        {
            type: ECommon_Content_Line_Config_Type.WIKI_ITEM,
            title: "Wiki Item"
        },
        {
            type: ECommon_Content_Line_Config_Type.CALENDAR_EVENT,
            title: "Calendar Event"
        },
        {
            type: ECommon_Content_Line_Config_Type.MEETING_ROOM,
            title: "Meeting Room"
        },
    ]
    static async onUploadFile(file, handleFunc) {
        let res=await apiFile.upload({
            file:file
        })
        if(res?.code==0) {
            handleFunc(res.data.id,res.data.path)
        }
    }
    static async onPopMenuClick(type:ECommon_Content_Line_Config_Type,root:Ref<any>,appContext:AppContext,loading:Ref<boolean>,handleFunc:(item:ICommon_Content_Line_Config)=>void) {
        const {t}=i18n.global
        if(type===ECommon_Content_Line_Config_Type.IMAGE || type===ECommon_Content_Line_Config_Type.FILE) {
            let input = document.createElement('input');
            input.type = 'file';
            if(type===ECommon_Content_Line_Config_Type.IMAGE) {
                input.accept=".png,.jpg,.gif,.jpeg,.bmp,.webp"
            }
            input.onchange=async (ev:InputEvent) => {
                let files=Array.from((ev.target as HTMLInputElement).files)
                if(files.length>0) {
                    if(loading) {
                        loading.value=true
                    }
                    let res=await apiFile.upload({
                        file:files[0] as any
                    })
                    if(loading) {
                        loading.value=false
                    }
                    if(res?.code==0) {
                        let fileId=res.data.id
                        let path=res.data.path
                        let objImageItem:ICommon_Content_Line_Config=type===ECommon_Content_Line_Config_Type.IMAGE?{
                            value:fileId,
                            link:path,
                            type:ECommon_Content_Line_Config_Type.IMAGE,
                            width:200
                        }:{
                            value:fileId,
                            link:path,
                            type:ECommon_Content_Line_Config_Type.FILE,
                            label:files[0].name
                        }
                        handleFunc(objImageItem)
                    }
                }
            }
            input.click();
        } else if(type===ECommon_Content_Line_Config_Type.PROJECT) {
            let ret:any=await Dialog.open(root.value.$el?root.value.$el:root.value,appContext,t("util.project"),markRaw(ProjectFilter))
            if(ret) {
                let item:ICommon_Content_Line_Config={
                    type:ECommon_Content_Line_Config_Type.PROJECT,
                    value:ret.id,
                    label:ret.name
                }
                handleFunc(item)
            }
        } else if(type===ECommon_Content_Line_Config_Type.PROJECT_ISSUE) {
            let ret:any=await Dialog.open(root.value.$el?root.value.$el:root.value,appContext,t("util.issue"),markRaw(ProjectIssueFilter))
            if(ret) {
                let item:ICommon_Content_Line_Config={
                    type:ECommon_Content_Line_Config_Type.PROJECT_ISSUE,
                    value:ret.id,
                    label:ret.name,
                    link:ret.project.id
                }
                handleFunc(item)
            }
        } else if(type===ECommon_Content_Line_Config_Type.PROJECT_RELEASE) {
            let ret:any=await Dialog.open(root.value.$el?root.value.$el:root.value,appContext,t("util.release"),markRaw(ProjectReleaseFilter))
            if(ret) {
                let item:ICommon_Content_Line_Config={
                    type:ECommon_Content_Line_Config_Type.PROJECT_RELEASE,
                    value:ret.id,
                    label:ret.name,
                    link:ret.project.id
                }
                handleFunc(item)
            }
        } else if(type===ECommon_Content_Line_Config_Type.BOARD_SPRINT) {
            let ret:any=await Dialog.open(root.value.$el?root.value.$el:root.value,appContext,t("util.sprint"),markRaw(BoardSprintFilter))
            if(ret) {
                let item:ICommon_Content_Line_Config={
                    type:ECommon_Content_Line_Config_Type.BOARD_SPRINT,
                    value:ret.id,
                    label:ret.name,
                    link:ret.project.id+"_"+ret.board.id
                }
                handleFunc(item)
            }
        } else if(type===ECommon_Content_Line_Config_Type.WIKI) {
            let ret:any=await Dialog.open(root.value.$el?root.value.$el:root.value,appContext,t("util.wikiSpace"),markRaw(WikiFilter))
            if(ret) {
                let item:ICommon_Content_Line_Config={
                    type:ECommon_Content_Line_Config_Type.WIKI,
                    value:ret.id,
                    label:ret.name,
                }
                handleFunc(item)
            }
        } else if(type===ECommon_Content_Line_Config_Type.WIKI_ITEM) {
            let ret:any=await Dialog.open(root.value.$el?root.value.$el:root.value,appContext,t("util.wikiItem"),markRaw(WikiItemFilter))
            if(ret) {
                let item:ICommon_Content_Line_Config={
                    type:ECommon_Content_Line_Config_Type.WIKI_ITEM,
                    value:ret.id,
                    label:ret.name,
                    link:ret.wiki.id
                }
                handleFunc(item)
            }
        } else if(type===ECommon_Content_Line_Config_Type.CALENDAR_EVENT) {
            let ret:any=await Dialog.open(root.value.$el?root.value.$el:root.value,appContext,t("util.calendarEvent"),markRaw(CalendarEventFilter))
            if(ret) {
                let item:ICommon_Content_Line_Config={
                    type:ECommon_Content_Line_Config_Type.CALENDAR_EVENT,
                    value:ret.id,
                    label:ret.name,
                }
                handleFunc(item)
            }
        } else if(type===ECommon_Content_Line_Config_Type.MEETING_ROOM) {
            let ret:any=await Dialog.open(root.value.$el?root.value.$el:root.value,appContext,t("util.meeting"),markRaw(MeetingRoomFilter))
            if(ret) {
                let item:ICommon_Content_Line_Config={
                    type:ECommon_Content_Line_Config_Type.MEETING_ROOM,
                    value:ret.id,
                    label:ret.name,
                    link:ret.password
                }
                handleFunc(item)
            }
        }
    }

    static async onCustomAnchorClick(type:ECommon_Content_Line_Config_Type,value:string,link:string,label:string) {
        if(type===ECommon_Content_Line_Config_Type.PROJECT) {
            eventBus.emit(EClient_EVENTBUS_TYPE.OPEN_PROJECT_PROFILE,value)
        } else if(type===ECommon_Content_Line_Config_Type.PROJECT_ISSUE) {
            eventBus.emit(EClient_EVENTBUS_TYPE.OPEN_PROJECT_ISSUE_PROFILE,link,value)
        } else if(type===ECommon_Content_Line_Config_Type.PROJECT_RELEASE) {
            eventBus.emit(EClient_EVENTBUS_TYPE.OPEN_PROJECT_RELEASE_PROFILE,link,value)
        } else if(type===ECommon_Content_Line_Config_Type.BOARD_SPRINT) {
            let arr=link.split("_")
            eventBus.emit(EClient_EVENTBUS_TYPE.OPEN_PROJECT_SPRINT_KANBAN_PROFILE,arr[0],arr[1],value)
        } else if(type===ECommon_Content_Line_Config_Type.WIKI) {
            eventBus.emit(EClient_EVENTBUS_TYPE.OPEN_WIKI_PROFILE,value)
        } else if(type===ECommon_Content_Line_Config_Type.WIKI_ITEM) {
            eventBus.emit(EClient_EVENTBUS_TYPE.OPEN_WIKI_ITEM,link,value)
        } else if(type===ECommon_Content_Line_Config_Type.CALENDAR_EVENT) {
            eventBus.emit(EClient_EVENTBUS_TYPE.OPEN_CALENDAR_EVENT,value)
        } else if(type===ECommon_Content_Line_Config_Type.MEETING_ROOM) {
            let res=await apiMeeting.checkOwner({
                meetingRoomId:value
            })
            if(res?.code==0) {
                eventBus.emit(EClient_EVENTBUS_TYPE.OPEN_MEETING,value,res.data.password)
            } else {
                Message.error(res.msg)
            }
        }
    }

    static async onQuoteList(keyword:string,handleFunc:(list:{
        value:string,
        label:string,
        photo:string
    }[])=>void) {
        const organizationId=SessionStorage.get("organizationId")
        let res=await apiOrganization.listUser({
            page:0,
            size:20,
            keyword:keyword,
            organizationId
        })
        if(res?.code==0) {
            handleFunc(res.data.data.map(item=>{
                return {
                    value:item.organizationUser.id,
                    label:item.organizationUser.nickname,
                    photo:item.user.photo
                }
            }))
        }
    }
    
    static async onDrop(objEditor:any,data?:DropParam,loading?:Ref<boolean>) {
        if(data.type==="internal") {
            if(loading) {
                loading.value=true
            }
            let arrPromise=await Promise.allSettled((data.data as IClient_Drag_Element[]).map(obj=>{
                if(obj.type===EClient_Drag_Type.FILE) {
                    if(obj.from==="content") {
                        return apiFile.getPath({
                            fileId:obj.value
                        }).then(res=>{
                            let ret:ICommon_Content_Line_Config
                            if(res?.code==0) {
                                let isImg=false
                                let arr=[".png",".jpg",".gif",".jpeg",".bmp",".webp"]
                                if(obj.element.tagName==="IMG") {
                                    isImg=true
                                } else {
                                    for(let ext of arr) {
                                        if(obj.element.innerText.trim().toLowerCase().endsWith(ext)) {
                                            isImg=true
                                            break
                                        }
                                    }
                                }
                                if(isImg) {
                                    ret={
                                        type:ECommon_Content_Line_Config_Type.IMAGE,
                                        value:obj.value,
                                        link:res.data.uri
                                    }
                                } else {
                                    ret={
                                        type:ECommon_Content_Line_Config_Type.FILE,
                                        value:obj.value,
                                        link:res.data.uri,
                                        label:obj.element.innerText
                                    }
                                }
                            }
                            return ret;
                        })
                    } else {
                        return apiFinder.info({
                            finderItemId:obj.value
                        }).then(res=>{
                            let ret:ICommon_Content_Line_Config
                            if(res?.code==0) {
                                let isImg=false
                                let arr=[".png",".jpg",".gif",".jpeg",".bmp",".webp"]
                                if(obj.element.tagName==="IMG") {
                                    isImg=true
                                } else {
                                    for(let ext of arr) {
                                        if(obj.element.innerText.trim().toLowerCase().endsWith(ext)) {
                                            isImg=true
                                            break
                                        }
                                    }
                                }
                                if(isImg) {
                                    ret={
                                        type:ECommon_Content_Line_Config_Type.IMAGE,
                                        value:res.data.file.id,
                                        link:res.data.file.path
                                    }
                                } else {
                                    ret={
                                        type:ECommon_Content_Line_Config_Type.FILE,
                                        value:res.data.file.id,
                                        link:res.data.file.path,
                                        label:obj.element.title
                                    }
                                }
                            }
                            return ret;
                        })
                    }
                } else if(obj.type===EClient_Drag_Type.SHORTCUT) {
                    switch (obj.shortcutType) {
                        case ECommon_Model_Finder_Shortcut_Type.PROJECT:{
                            return apiProject.basic({
                                projectId:obj.shortcutRefId
                            }).then(res=>{
                                let ret:ICommon_Content_Line_Config
                                if(res?.code==0) {
                                    ret={
                                        type:ECommon_Content_Line_Config_Type.PROJECT,
                                        value:obj.shortcutRefId,
                                        label:["content","entity"].includes(obj.from)?obj.shortcutName:obj.element.title
                                    }
                                }
                                return ret;
                            })
                            break
                        }
                        case ECommon_Model_Finder_Shortcut_Type.PROJECT_ISSUE:{
                            return apiIssue.basicInfo({
                                projectIssueId:obj.shortcutRefId
                            }).then(res=>{
                                let ret:ICommon_Content_Line_Config
                                if(res?.code==0) {
                                    ret={
                                        type:ECommon_Content_Line_Config_Type.PROJECT_ISSUE,
                                        value:obj.shortcutRefId,
                                        label:["content","entity"].includes(obj.from)?obj.shortcutName:obj.element.title,
                                        link:res.data.project.id
                                    }
                                }
                                return ret;
                            })
                            break
                        }
                        case ECommon_Model_Finder_Shortcut_Type.PROJECT_RELEASE:{
                            return apiRelease.info({
                                projectReleaseId:obj.shortcutRefId
                            }).then(res=>{
                                let ret:ICommon_Content_Line_Config
                                if(res?.code==0) {
                                    ret={
                                        type:ECommon_Content_Line_Config_Type.PROJECT_RELEASE,
                                        value:obj.shortcutRefId,
                                        label:["content","entity"].includes(obj.from)?obj.shortcutName:obj.element.title,
                                        link:res.data.project.id
                                    }
                                }
                                return ret;
                            })
                            break
                        }
                        case ECommon_Model_Finder_Shortcut_Type.BOARD_SPRINT:{
                            return apiBoard.sprintInfo({
                                boardSprintId:obj.shortcutRefId
                            }).then(res=>{
                                let ret:ICommon_Content_Line_Config
                                if(res?.code==0) {
                                    ret={
                                        type:ECommon_Content_Line_Config_Type.BOARD_SPRINT,
                                        value:obj.shortcutRefId,
                                        label:["content","entity"].includes(obj.from)?obj.shortcutName:obj.element.title,
                                        link:res.data.project.id+"_"+res.data.board.id
                                    }
                                }
                                return ret;
                            })
                            break
                        }
                        case ECommon_Model_Finder_Shortcut_Type.WIKI:{
                            return apiWiki.wikiInfo({
                                wikiId:obj.shortcutRefId
                            }).then(res=>{
                                let ret:ICommon_Content_Line_Config
                                if(res?.code==0) {
                                    ret={
                                        type:ECommon_Content_Line_Config_Type.WIKI,
                                        value:obj.shortcutRefId,
                                        label:["content","entity"].includes(obj.from)?obj.shortcutName:obj.element.title,
                                    }
                                }
                                return ret;
                            })
                            break
                        }
                        case ECommon_Model_Finder_Shortcut_Type.WIKI_ITEM:{
                            return apiWiki.wikiItemInfo({
                                wikiItemId:obj.shortcutRefId
                            }).then(res=>{
                                let ret:ICommon_Content_Line_Config
                                if(res?.code==0) {
                                    ret={
                                        type:ECommon_Content_Line_Config_Type.WIKI_ITEM,
                                        value:obj.shortcutRefId,
                                        label:["content","entity"].includes(obj.from)?obj.shortcutName:obj.element.title,
                                        link:res.data.wiki_id
                                    }
                                }
                                return ret;
                            })
                            break
                        }
                        case ECommon_Model_Finder_Shortcut_Type.CALENDAR_EVENT:{
                            return apiCalendar.getCalendarEvent({
                                calendarEventId:obj.shortcutRefId
                            }).then(res=>{
                                let ret:ICommon_Content_Line_Config
                                if(res?.code==0) {
                                    ret={
                                        type:ECommon_Content_Line_Config_Type.CALENDAR_EVENT,
                                        value:obj.shortcutRefId,
                                        label:["content","entity"].includes(obj.from)?obj.shortcutName:obj.element.title
                                    }
                                }
                                return ret;
                            })
                            break
                        }
                        case ECommon_Model_Finder_Shortcut_Type.MEETING_ROOM:{
                            return apiMeeting.getRoom({
                                meetingRoomId:obj.shortcutRefId
                            }).then(res=>{
                                let ret:ICommon_Content_Line_Config
                                if(res?.code==0) {
                                    ret={
                                        type:ECommon_Content_Line_Config_Type.MEETING_ROOM,
                                        value:obj.shortcutRefId,
                                        label:["content","entity"].includes(obj.from)?obj.shortcutName:obj.element.title
                                    }
                                }
                                return ret;
                            })
                            break
                        }
                    }
                }
            }));
            if(loading) {
                loading.value=false
            }
            let itemList=arrPromise.filter(item=>{
                if(item.status==="fulfilled" && item.value) {
                    return true
                }
            }).map(item=>{
                return (item as any).value
            })
            objEditor.value.insertConfig(itemList)
        } else if(data.type==="external") {
            if(loading) {
                loading.value=true
            }
            let arrPromise=await Promise.allSettled((data.data as File[]).map(file=>{
                return apiFile.upload({
                    file:file as any
                }).then(res=>{
                    let ret:ICommon_Content_Line_Config
                    if(res?.code==0) {
                        ret={
                            type:ECommon_Content_Line_Config_Type.FILE,
                            value:res.data.id,
                            link:res.data.path,
                            label:file.name
                        }
                    }
                    return ret;
                })
            }))
            if(loading) {
                loading.value=false
            }
            let itemList=arrPromise.filter(item=>{
                if(item.status==="fulfilled" && item.value) {
                    return true
                }
            }).map(item=>{
                return (item as any).value
            })
            objEditor.value.insertConfig(itemList)
        }
    }
}