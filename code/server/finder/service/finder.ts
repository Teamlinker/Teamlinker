import {Entity} from "../../common/entity/entity";
import {
    ECommon_Model_Finder_Item_Type,
    ECommon_Model_Finder_Shortcut_Type,
    finderItemModel
} from "../../../common/model/finder_item";
import {finderItemMapper} from "../mapper/finder";
import {Err} from "../../../common/status/error";
import {IServer_Common_Event_Types} from "../../common/event/types";
import rpcFileApi from "../../file/rpc/file"
import {ICommon_Route_Res_Finder_Info} from "../../../common/routes/response";
import rpcCooperationApi from "../../cooperation/rpc/cooperation"
import rpcWikiApi from "../../wiki/rpc/wiki"
import rpcCalendarApi from "../../calendar/rpc/calendar"
import rpcMeetingApi from "../../meeting/rpc/meeting"

export class FinderItemService extends Entity<typeof finderItemModel,typeof finderItemMapper> {
    constructor() {
        super(finderItemMapper)
    }
    static async listChild(folderId:string,type:"all"|"folder",userId:string) {
        let arr=await finderItemMapper.listChild(folderId,userId,type)
        return arr;
    }

    override async delete(eventPublish?: keyof IServer_Common_Event_Types): Promise<void> {
        await super.delete(eventPublish);
        if(this.getItem().type==ECommon_Model_Finder_Item_Type.FOLDER) {
            let arr=await FinderItemService.getItemsByExp({
                parent_folder_id:this.getId()
            })
            for(let obj of arr) {
               obj.delete()
            }
        }
    }

    override async copy(deletedFields?: (keyof typeof finderItemModel["model"])[], updatedFields?: { [name in keyof typeof finderItemModel["model"]]?: typeof finderItemModel["model"][name] }): Promise<this> {
        let folderList=await finderItemMapper.findParentFolderPath(updatedFields.parent_folder_id)
        for(let obj of folderList) {
            if(this.getId()===obj.id) {
                throw Err.Finder.recursionFolder
            }
        }
        if(updatedFields.parent_folder_id===this.getItem().parent_folder_id) {
            updatedFields.name="(Copy)"+this.getItem().name
        }
        let ret=await super.copy(deletedFields, updatedFields);
        if(this.getItem().type==ECommon_Model_Finder_Item_Type.FOLDER) {
            let arr=await FinderItemService.getItemsByExp({
                parent_folder_id:this.getId()
            })
            for(let obj of arr) {
                await obj.copy(null,{
                    parent_folder_id:ret.getId()
                })
            }
        }
        return ret
    }

    async move(destFolderId:string) {
        let folderList=await finderItemMapper.findParentFolderPath(destFolderId)
        for(let obj of folderList) {
            if(this.getId()===obj.id) {
                throw Err.Finder.recursionFolder
            }
        }
        this.assignItem({
            parent_folder_id:destFolderId?destFolderId:null
        })
        let ret=await this.update()
        return ret;
    }

    async getFullPath() {
        if(this.getItem().type!==ECommon_Model_Finder_Item_Type.FILE) {
            throw Err.Finder.typeNotMatch
        }
        let path=rpcFileApi.getPath(this.getItem().file_id)
        return path;
    }

    static async search(folderId:string,keyword:string,userId:string) {
        let ret=await finderItemMapper.search(folderId, keyword, userId)
        return ret;
    }

    async info():Promise<ICommon_Route_Res_Finder_Info> {
        let ret:ICommon_Route_Res_Finder_Info={
            ...this.getItem(),
            parentFolderList:await finderItemMapper.findParentFolderPath(this.getItem().parent_folder_id)
        }
        if(this.getItem().type===ECommon_Model_Finder_Item_Type.FILE) {
            if(this.getItem().file_id) {
                ret.file=await rpcFileApi.file(this.getItem().file_id)
            }
        } else if(this.getItem().type===ECommon_Model_Finder_Item_Type.SHORTCUT) {
            let shortcutType=this.getItem().shortcut_type
            let refId=this.getItem().ref_id
            switch (shortcutType) {
                case ECommon_Model_Finder_Shortcut_Type.PROJECT:
                {
                    ret.shortcut=await rpcCooperationApi.project(refId)
                    break
                }
                case ECommon_Model_Finder_Shortcut_Type.PROJECT_ISSUE:
                {
                    ret.shortcut=await rpcCooperationApi.projectIssue(refId)
                    break
                }
                case ECommon_Model_Finder_Shortcut_Type.PROJECT_RELEASE:{
                    ret.shortcut=await rpcCooperationApi.projectRelease(refId)
                    break
                }
                case ECommon_Model_Finder_Shortcut_Type.WIKI:{
                    ret.shortcut=await rpcWikiApi.wiki(refId)
                    break
                }
                case ECommon_Model_Finder_Shortcut_Type.WIKI_ITEM:{
                    ret.shortcut=await rpcWikiApi.wikiItem(refId)
                    break
                }
                case ECommon_Model_Finder_Shortcut_Type.CALENDAR_EVENT:
                {
                    ret.shortcut=await rpcCalendarApi.calendarEvent(refId)
                    break
                }
                case ECommon_Model_Finder_Shortcut_Type.MEETING_ROOM:{
                    ret.shortcut=await rpcMeetingApi.meetingRoom(refId)
                    break
                }
            }
        }
        return ret;
    }
}