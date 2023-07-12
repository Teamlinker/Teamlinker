import {Entity} from "../../common/entity/entity";
import {
    contentModel,
    ECommon_Content_Line_Config_Type,
    ECommon_Model_Content_Type,
    ICommon_Content_Line
} from '../../../common/model/content';
import {contentMapper} from '../mapper/content';
import {emitServiceEvent} from "../../common/event/event";
import rpcNotificationApi from "../../notification/rpc/notification"
import {ECommon_Model_Notification_Type} from "../../../common/model/notification";

export class ContentService extends Entity<typeof contentModel,typeof contentMapper> {
    constructor(){
        super(contentMapper)
    }

    static async list(refId:string,type:ECommon_Model_Content_Type) {
        let ret=await contentMapper.list(refId,type)
        return ret;
    }

    override async create(): Promise<typeof contentModel["model"]> {
        this.item.content=this.item.content.replaceAll("\\\"","\\\\\"")
        let ret=await super.create();
        let obj=this.generateLineObj(ret.content)
        for(let key in obj.file) {
            let count=obj.file[key]
            emitServiceEvent("fileRef",key,count)
        }
        let type:ECommon_Model_Notification_Type
        switch (this.getItem().type) {
            case ECommon_Model_Content_Type.WIKI_ITEM:{
                type=ECommon_Model_Notification_Type.WIKI_ITEM_AT
                break
            }
            case ECommon_Model_Content_Type.PROJECT_ISSUE_COMMENT:{
                type=ECommon_Model_Notification_Type.ISSUE_COMMENT_AT
                break
            }
        }
        for(let key in obj.at) {
            if(type!=null) {
                rpcNotificationApi.createNotification(type,this.getItem().ref_id,key,this.getItem().modified_by)
            }
        }
        return ret;
    }

    override async update(): Promise<typeof contentModel["model"]> {
        let oldObj=this.generateLineObj(this._item.content)
        this.item.content=this.item.content.replaceAll("\\\"","\\\\\"")
        let ret=await super.update();
        let newObj=this.generateLineObj(ret.content)
        for(let key in oldObj.file) {
            let oldCount=oldObj.file[key]
            let newCount=newObj.file[key]
            if(newCount!==undefined) {
                if(oldCount!==newCount) {
                    if(oldCount>newCount) {
                        emitServiceEvent("fileUnref",key,oldCount-newCount)
                    } else {
                        emitServiceEvent("fileRef",key,newCount-oldCount)
                    }
                }
                delete newObj.file[key]
            } else {
                emitServiceEvent("fileUnref",key,oldCount)
            }
        }
        for(let key in newObj.file) {
            let count=newObj.file[key]
            emitServiceEvent("fileRef",key,count)
        }
        let type:ECommon_Model_Notification_Type
        switch (this.getItem().type) {
            case ECommon_Model_Content_Type.WIKI_ITEM:{
                type=ECommon_Model_Notification_Type.WIKI_ITEM_AT
                break
            }
            case ECommon_Model_Content_Type.PROJECT_ISSUE_COMMENT:{
                type=ECommon_Model_Notification_Type.ISSUE_COMMENT_AT
                break
            }
        }
        for(let key in oldObj.at) {
            let newCount=newObj.at[key]
            if(!newCount) {
                rpcNotificationApi.removeNotification(type,this.getItem().ref_id,key)
            } else {
                delete newObj.at[key]
            }
        }
        for(let key in newObj.at) {
            if(type!=null) {
                rpcNotificationApi.createNotification(type,this.getItem().ref_id,key,this.getItem().modified_by)
            }
        }
        return ret;
    }

    generateLineObj(content:string):{
        file:{
            [param:string]:number
        },
        at:{
            [param:string]:number
        }
    } {
        let objFile:{
            [param:string]:number
        }={},objAt:{
            [param:string]:number
        }={}
        if(content) {
            let arr=JSON.parse(content) as ICommon_Content_Line[]
            for(let obj of arr) {
                for(let obj1 of obj.arr) {
                    if(obj1.type===ECommon_Content_Line_Config_Type.FILE || obj1.type===ECommon_Content_Line_Config_Type.IMAGE) {
                        if(!objFile[obj1.value]) {
                            objFile[obj1.value]=1
                        } else {
                            objFile[obj1.value]++
                        }
                    } else if(obj1.type===ECommon_Content_Line_Config_Type.QUOTE_PERSON) {
                        if(!objAt[obj1.value]) {
                            objAt[obj1.value]=1
                        } else {
                            objAt[obj1.value]++
                        }
                    }
                }
            }
        }
        return {
            file:objFile,
            at:objAt
        }
    }

    static async clearByRefId(refId:string) {
        await contentMapper.clearByRefId(refId)
    }

    static async clearByRefIds(refIds:string[]) {
        await contentMapper.clearByRefIds(refIds)
    }

    static async clearByOrganizationId(organizationId:string) {
        await contentMapper.clearByOrganizationId(organizationId)
    }

}