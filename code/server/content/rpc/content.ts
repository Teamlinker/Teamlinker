import {ECommon_Model_Content_Type} from "../../../common/model/content";
import {ContentService} from "../service/content";
import {Err} from "../../../common/status/error";
import rpcUserApi from "../../user/rpc/user"
import {ICommon_Model_Organization_User} from "../../../common/model/organization_user";

class RpcContentApi {
    async list(refId:string,type:ECommon_Model_Content_Type,isAsc:boolean,lastMessageId?:string) {
        let ret=await ContentService.list(refId,type,isAsc,lastMessageId)
        return ret;
    }

    async get(refId:string,type:ECommon_Model_Content_Type) {
        let obj=await ContentService.getItemByExp({
            ref_id:refId,
            type
        })
        if(obj) {
            return obj.getItem();
        } else {
            return null;
        }
    }

    async remove(contentId:string) {
        let obj=await ContentService.getItemById(contentId)
        if(!obj) {
            return Err.Content.contentNotFound
        }
        await obj.delete()
    }

    async add(refId:string,type:ECommon_Model_Content_Type,createdBy:string,content:string,createdByPure?:string) {
        if(createdBy) {
            let objOrganizationUser=await rpcUserApi.organizationUser(createdBy)
            let obj=new ContentService
            obj.assignItem({
                ref_id:refId,
                type,
                created_by:createdBy,
                modified_by:createdBy,
                organization_id:objOrganizationUser.organization_id,
                content
            })
            let ret=await obj.create()
            return ret;
        } else if(createdByPure) {
            let obj=new ContentService
            obj.assignItem({
                ref_id:refId,
                type,
                content,
                created_by_pure:createdByPure
            })
            let ret=await obj.create()
            return ret;
        }
    }

    async edit(contentId:string,modifiedBy:string,content:string) {
        let obj=await ContentService.getItemById(contentId)
        if(!obj) {
            throw Err.Content.contentNotFound
        }
        obj.assignItem({
            modified_by:modifiedBy,
            content
        })
        let ret=await obj.update()
        return ret;
    }

    async save(refId:string,type:ECommon_Model_Content_Type,organizationUserId:string,content:string) {
        let obj=await ContentService.getItemByExp({
            ref_id:refId,
            type
        })
        if(obj) {
            obj.assignItem({
                modified_by:organizationUserId,
                content
            })
            let ret=await obj.update()
            return ret;
        } else {
            obj=new ContentService
            let objOrganizationUser=await rpcUserApi.organizationUser(organizationUserId)
            obj.assignItem({
                ref_id:refId,
                type,
                created_by:organizationUserId,
                modified_by:organizationUserId,
                organization_id:objOrganizationUser.organization_id,
                content
            })
            let ret=await obj.create()
            return ret;
        }
    }

    async clearByRefIdAndType(refId:string,type:ECommon_Model_Content_Type) {
        await ContentService.clearByRefIdAndType(refId,type)
    }

    async clearByRefId(refId:string) {
        await ContentService.clearByRefId(refId)
    }

    async clearByRefIds(refIds:string[]) {
        if(refIds && refIds.length>0) {
            await ContentService.clearByRefIds(refIds)
        }
    }

    async clearByOrganizationId(organizationId:string) {
        await ContentService.clearByOrganizationId(organizationId)
    }

    async updateUserInfo(organizationId:string,organizationUserId:string,userId:string,organizationUser:ICommon_Model_Organization_User) {
        await ContentService.updateUserInfo(organizationId, organizationUserId, userId, organizationUser)
    }
}

export default new RpcContentApi()