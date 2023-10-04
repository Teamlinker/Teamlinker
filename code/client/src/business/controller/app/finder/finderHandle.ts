import {AppContext, ref, Ref} from "vue";
import {Icon} from "../../../../teamOS/icon/icon";
import {ITeamOS_Menu} from "../../../../teamOS/common/type";
import {Dialog} from "../../../common/component/dialog/dialog";
import {
    apiBoard,
    apiCalendar,
    apiFile,
    apiFinder,
    apiIssue,
    apiMeeting,
    apiProject,
    apiRelease,
    apiWiki
} from "../../../common/request/request";
import {EClient_EVENTBUS_TYPE, eventBus} from "../../../common/event/event";
import {useDesktopStore} from "../../desktop/store/desktop";
import {
    ECommon_Model_Finder_Item_Type,
    ECommon_Model_Finder_Shortcut_Type,
    ECommon_Model_Finder_Status,
    ICommon_Model_Finder_Item
} from "../../../../../../common/model/finder_item";
import {selectedSelectableItems} from "../../../../teamOS/common/directive/selectable";
import {EClient_Drag_Type, IClient_Drag_Element} from "../../../../teamOS/common/directive/drag";
import {DropParam} from "../../../../teamOS/common/directive/drop";
import {SessionStorage} from "../../../common/storage/session";
import {Message} from "@arco-design/web-vue";
import i18n from "@/business/common/i18n/i18n";
import {DCSType} from "../../../../../../common/types";

export class FinderHandle {
    private itemList=ref<Icon[]>([])
    private appContext:AppContext
    private root:Ref<any>
    private folderId:string
    private store=useDesktopStore()
    private nameColor="white"
    private keyword=""
    onEnterFolderFunc:(folderId:string)=>void
    constructor(root:Ref<HTMLElement>,appContext:AppContext,folderId:string) {
        this.root=root;
        this.appContext=appContext
        this.folderId=folderId
    }
    setNameColor(color:string) {
        this.nameColor=color
    }
    setKeyword(keyword:string) {
        this.keyword=keyword
    }
    getItemList() {
        return this.itemList
    }
    setFolderId(folderId:string) {
        this.folderId=folderId
    }
    contextMenuFunc():ITeamOS_Menu[] {
        let {t}=i18n.global
        let ret:ITeamOS_Menu[]=[
            {
                title:t("util.refresh"),
                func:value => {
                    this.refresh()
                }
            },
            {
                title:t("util.newFolder"),
                func:async value => {
                    let ret=await Dialog.input(this.root.value.$el?this.root.value.$el:this.root.value,this.appContext,t("tip.typeNewFolderName"));
                    if(ret) {
                        let res=await apiFinder.createFolder({
                            ...(this.folderId && {
                                parentFolderId:this.folderId
                            }),
                            name:ret
                        })
                        if(res?.code==0) {
                            eventBus.emit(EClient_EVENTBUS_TYPE.FINDER_REFRESH,this.folderId)
                        }
                    }
                }
            },
            {
                title:t("util.upload"),
                func:value => {
                    let input = document.createElement('input');
                    input.type = 'file';
                    input.multiple=true
                    input.onchange=async (ev:InputEvent) => {
                        let files=Array.from((ev.target as HTMLInputElement).files)
                        await this.uploadFiles(this.folderId,files)
                    }
                    input.click();
                }
            }
        ]
        if(this.store.copyItemList.length>0) {
            ret.push({
                title:t("util.paste"),
                func:async value => {
                    await Promise.allSettled(this.store.copyItemList.map(item=>{
                        return apiFinder.copy({
                            finderItemId:item,
                            destParentFolderId:this.folderId
                        }).then(res=>{
                            if(res?.code!=0) {
                                Message.error(res.msg)
                            }
                        })
                    }))
                    eventBus.emit(EClient_EVENTBUS_TYPE.FINDER_REFRESH,this.folderId)
                }
            })
        }
        return ret;
    }

    async refresh() {
        let res=await (this.keyword?apiFinder.search({
            keyword:this.keyword,
            ...(this.folderId && {
                folderId:this.folderId
            })
        }):apiFinder.listChild({
            type:"all",
            ...(this.folderId && {
                folderId:this.folderId
            })
        }))
        if(res?.code==0) {
            this.itemList.value=res.data.map(value => {
                let icon:string,iconColor:string
                if(value.type===ECommon_Model_Finder_Item_Type.FOLDER) {
                    icon="folder"
                    iconColor="rgb(252,218,115)"
                } else if(value.type===ECommon_Model_Finder_Item_Type.FILE) {
                    let ext=value.name.split(".").at(-1)
                    if(ext && ["jpg","jpeg","png","bmp","gif","webp","svg"].includes(ext.toLowerCase())) {
                        icon="file-image"
                    } else {
                        icon="file"
                    }
                    iconColor="gray"
                } else if(value.type===ECommon_Model_Finder_Item_Type.SHORTCUT) {
                    switch (value.shortcut_type) {
                        case ECommon_Model_Finder_Shortcut_Type.PROJECT:{
                            icon="project_item"
                            iconColor="green"
                            break
                        }
                        case ECommon_Model_Finder_Shortcut_Type.PROJECT_ISSUE:{
                            icon="project_issue_item"
                            iconColor="green"
                            break
                        }
                        case ECommon_Model_Finder_Shortcut_Type.PROJECT_RELEASE:{
                            icon="project_release_item"
                            iconColor="green"
                            break
                        }
                        case ECommon_Model_Finder_Shortcut_Type.BOARD_SPRINT:{
                            icon="board_sprint_item"
                            iconColor="green"
                            break
                        }
                        case ECommon_Model_Finder_Shortcut_Type.WIKI:{
                            icon="wiki_space_item"
                            iconColor="darkblue"
                            break
                        }
                        case ECommon_Model_Finder_Shortcut_Type.WIKI_ITEM:{
                            icon="wiki_item"
                            iconColor="darkblue"
                            break
                        }
                        case ECommon_Model_Finder_Shortcut_Type.CALENDAR_EVENT:{
                            icon="calendar_event_item"
                            iconColor="orange"
                            break
                        }
                        case ECommon_Model_Finder_Shortcut_Type.MEETING_ROOM:{
                            icon="meeting_room_item"
                            iconColor="red"
                            break
                        }
                    }
                }
                let obj=new Icon(value.name,icon,value,iconColor,this.nameColor)
                return obj
            })
            this.itemList.value.forEach(obj => {
                obj.loadingFunc=() => {
                    if(obj.meta.status===ECommon_Model_Finder_Status.PROCESSING) {
                        return true
                    } else {
                        return false
                    }
                }
                obj.onRename=async (item, name) => {
                    if(name) {
                        let res=await apiFinder.rename({
                            finderItemId:item.meta.id,
                            name
                        })
                        if(res?.code==0) {
                            item.name=name
                            eventBus.emit(EClient_EVENTBUS_TYPE.FINDER_REFRESH,this.folderId)
                        }
                    }
                }
                obj.addEventListener("dbClick",item => {
                    let data=item.meta as ICommon_Model_Finder_Item
                    if(data.type===ECommon_Model_Finder_Item_Type.FOLDER) {
                        this.onEnterFolderFunc?.(data.id)
                    } else if(data.type===ECommon_Model_Finder_Item_Type.SHORTCUT) {
                        this.onOpenShortcut(item.meta)
                    }
                })
                obj.addEventListener("contextmenu",async item => {
                    const {t}=i18n.global
                    let data=item.meta as ICommon_Model_Finder_Item
                    let menu:ITeamOS_Menu[]=[]
                    if(selectedSelectableItems.length==1) {
                        if(data.type===ECommon_Model_Finder_Item_Type.FILE) {
                            menu.push({
                                title:t("util.download"),
                                func:async value => {
                                    let res=await apiFinder.getFullPath({
                                        finderItemId:data.id
                                    })
                                    if(res?.code==0) {
                                        let link = document.createElement("a");
                                        link.setAttribute('download', data.name);
                                        link.href = res.data.path;
                                        document.body.appendChild(link);
                                        link.click();
                                        link.remove();
                                    }
                                }
                            })
                        }
                        menu.push({
                            title:t("util.rename"),
                            func:value1 => {
                                item.rename=true
                            }
                        })
                    } else {

                    }
                    menu.push(
                        {
                            title:t("util.copy"),
                            func:value1 => {
                                this.store.copyItemList=selectedSelectableItems.map(item=>{
                                    return item.getAttribute("dragvalue")
                                })
                            }
                        },
                        {
                            title:t("util.delete"),
                            func:async value => {
                                let valueList=selectedSelectableItems.map(item=>{
                                    return item.getAttribute("dragValue")
                                })
                                const {t}=i18n.global
                                let ret=await Dialog.confirm(this.root.value.$el?this.root.value.$el:this.root.value,this.appContext,t("tip.deleteItems"))
                                if(ret) {
                                    await Promise.allSettled(valueList.map(value=>{
                                        return apiFinder.delete({
                                            finderItemId:value
                                        })
                                    }))
                                    eventBus.emit(EClient_EVENTBUS_TYPE.FINDER_REFRESH,this.folderId)
                                    eventBus.emit(EClient_EVENTBUS_TYPE.FINDER_DELETE,valueList)
                                }
                            }
                        }
                    )
                    return menu
                })
            })
        }
    }
    async onDrop(destId:string,data?:DropParam) {
        if(data.type==="internal") {
            let arr=(data.data as IClient_Drag_Element[])
            await Promise.allSettled(arr.map(obj=>{
                if(obj.from==="finder") {
                    return apiFinder.info({
                        finderItemId:obj.value
                    }).then(res=>{
                        if(res?.code==0) {
                            let srcFolderId=res.data.parent_folder_id
                            return apiFinder.move({
                                finderItemId:obj.value,
                                destParentFolderId:destId
                            }).then(res=>{
                                if(res.code!=0) {
                                    Message.error(res.msg)
                                } else {
                                    eventBus.emit(EClient_EVENTBUS_TYPE.FINDER_REFRESH,srcFolderId?srcFolderId:"")
                                }
                            })
                        }
                    })
                } else {
                    if(obj.type===EClient_Drag_Type.FILE) {
                        return apiFile.getPath({
                            fileId:obj.value
                        }).then(res=>{
                            if(res?.code==0) {
                                return apiFinder.linkFile({
                                    name:obj.element.tagName==="IMG"?`UnTitled${res.data.uri.substring(res.data.uri.lastIndexOf("."))}`:obj.element.innerText,
                                    parentFolderId:destId,
                                    fileId:obj.value
                                })
                            } else {
                                Message.error(res.msg)
                            }
                        }).then(res=>{
                            if(res.code!=0) {
                                Message.error(res.msg)
                            }
                        })
                    } else if(obj.type===EClient_Drag_Type.SHORTCUT) {
                        return apiFinder.createShortcut({
                            name:obj.shortcutName,
                            parentFolderId:destId,
                            shortcutType:obj.shortcutType,
                            itemId:obj.shortcutRefId
                        }).then(res=>{
                            if(res.code!=0) {
                                Message.error(res.msg)
                            }
                        })
                    }
                }
            }))
        } else if(data.type==="external") {
            let fileList=data.data as File[]
            await this.uploadFiles(destId,fileList)
        }
        eventBus.emit(EClient_EVENTBUS_TYPE.FINDER_REFRESH,this.folderId)
    }

    private async uploadFiles(destId:string,fileList:File[]) {
        let fileIdList:{
            file:File,
            fileId:string
        }[]=[]
        await Promise.all(fileList.map(file=> {
            return apiFinder.createFile({
                name: file.name,
                parentFolderId: destId
            }).then(res=>{
                if(res?.code==0) {
                    fileIdList.push({
                        file:file,
                        fileId:res.data.id
                    })
                }
            })
        })).then(()=>{
            return this.refresh().then(()=>{
                return Promise.allSettled(fileIdList.map(item=> {
                    return apiFile.upload({
                        file: item.file as any,
                        meta: item.fileId
                    }).then(res=>{
                        if(res?.code==0) {
                            eventBus.emit(EClient_EVENTBUS_TYPE.FINDER_UPLOAD,res.data.meta)
                        } else {
                            return apiFinder.delete({
                                finderItemId:item.fileId
                            })
                        }
                    })
                })).then(()=>{
                    eventBus.emit(EClient_EVENTBUS_TYPE.FINDER_REFRESH,destId)
                })
            })
        })
    }

    private async onOpenShortcut(item:DCSType<ICommon_Model_Finder_Item>) {
        if(item.organization_id!==SessionStorage.get("organizationId")) {
            const {t}=i18n.global
            Message.error(t("tip.switchToSpecificOrganization"))
            return
        }
        switch (item.shortcut_type) {
            case ECommon_Model_Finder_Shortcut_Type.PROJECT:{
                apiProject.basic({
                    projectId:item.ref_id
                }).then(res=>{
                    if(res?.code==0) {
                        eventBus.emit(EClient_EVENTBUS_TYPE.OPEN_PROJECT_PROFILE,item.ref_id)
                    } else {
                        Message.error(res.msg)
                    }
                })
                break
            }
            case ECommon_Model_Finder_Shortcut_Type.PROJECT_ISSUE:{
                apiIssue.basicInfo({
                    projectIssueId:item.ref_id
                }).then(res=>{
                    if(res?.code==0) {
                        eventBus.emit(EClient_EVENTBUS_TYPE.OPEN_PROJECT_ISSUE_PROFILE,res.data.project.id,item.ref_id)
                    } else {
                        Message.error(res.msg)
                    }
                })
                break
            }
            case ECommon_Model_Finder_Shortcut_Type.PROJECT_RELEASE:{
                apiRelease.info({
                    projectReleaseId:item.ref_id
                }).then(res=>{
                    if(res?.code==0) {
                        eventBus.emit(EClient_EVENTBUS_TYPE.OPEN_PROJECT_RELEASE_PROFILE,res.data.project_id,item.ref_id)
                    } else {
                        Message.error(res.msg)
                    }
                })
                break
            }
            case ECommon_Model_Finder_Shortcut_Type.BOARD_SPRINT:{
                apiBoard.sprintInfo({
                    boardSprintId:item.ref_id
                }).then(res=>{
                    if(res?.code==0) {
                        eventBus.emit(EClient_EVENTBUS_TYPE.OPEN_PROJECT_SPRINT_KANBAN_PROFILE,res.data.project.id,res.data.board.id,item.ref_id)
                    } else {
                        Message.error(res.msg)
                    }
                })
                break
            }
            case ECommon_Model_Finder_Shortcut_Type.WIKI:{
                apiWiki.wikiInfo({
                    wikiId:item.ref_id
                }).then(res=>{
                    if(res?.code==0) {
                        eventBus.emit(EClient_EVENTBUS_TYPE.OPEN_WIKI_PROFILE,item.ref_id)
                    } else {
                        Message.error(res.msg)
                    }
                })
                break
            }
            case ECommon_Model_Finder_Shortcut_Type.WIKI_ITEM:{
                apiWiki.wikiItemInfo({
                    wikiItemId:item.ref_id
                }).then(res=>{
                    if(res?.code==0) {
                        eventBus.emit(EClient_EVENTBUS_TYPE.OPEN_WIKI_ITEM,res.data.wiki_id,item.ref_id)
                    } else {
                        Message.error(res.msg)
                    }
                })
                break
            }
            case ECommon_Model_Finder_Shortcut_Type.CALENDAR_EVENT:{
                apiCalendar.getCalendarEvent({
                    calendarEventId:item.ref_id
                }).then(res=>{
                    if(res?.code==0) {
                        eventBus.emit(EClient_EVENTBUS_TYPE.OPEN_CALENDAR_EVENT,item.ref_id)
                    } else {
                        Message.error(res.msg)
                    }
                })
                break
            }
            case ECommon_Model_Finder_Shortcut_Type.MEETING_ROOM:{
                apiMeeting.checkOwner({
                    meetingRoomId:item.ref_id
                }).then(res=>{
                    if(res?.code==0) {
                        eventBus.emit(EClient_EVENTBUS_TYPE.OPEN_MEETING,item.ref_id,res.data.password)
                    } else {
                        Message.error(res.msg)
                    }
                })
                break
            }
        }
    }

    handleRefresh(folderId:string) {
        if(folderId===this.folderId) {
            this.refresh()
        }
    }

    handleUpload(fileItemId:string) {
        this.itemList.value.forEach(item=>{
            if(item.meta.id===fileItemId) {
                item.meta.status=ECommon_Model_Finder_Status.READY
            }
        })
    }

    registerEvents() {
        eventBus.on(EClient_EVENTBUS_TYPE.FINDER_REFRESH, this.handleRefresh.bind(this))
        eventBus.on(EClient_EVENTBUS_TYPE.FINDER_UPLOAD, this.handleUpload.bind(this))
    }

    unRegisterEvents() {
        eventBus.off(EClient_EVENTBUS_TYPE.FINDER_REFRESH, this.handleRefresh.bind(this))
        eventBus.off(EClient_EVENTBUS_TYPE.FINDER_UPLOAD, this.handleUpload.bind(this))
    }
}