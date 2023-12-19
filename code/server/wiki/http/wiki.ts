import {DComponent} from "../../common/decorate/component";
import {DHttpApi, DHttpController, DHttpReqParam, DHttpReqParamRequired, DHttpUser} from "../../common/http/http";
import wikiApi from "../../../common/routes/wiki";
import {ECommon_Model_Organization_Member_Type} from "../../../common/model/organization";
import {WikiItemService, WikiService} from "../service/wiki";
import {IUserSession} from "../../user/types/config";
import {ECommon_User_Type} from "../../../common/model/user";
import {Err} from "../../../common/status/error";
import rpcAuthApi from "../../auth/rpc/auth";
import {ECommon_Model_Role_Type} from "../../../common/model/role";
import rpcContentApi from "../../content/rpc/content"
import {ECommon_Model_Content_Type} from "../../../common/model/content";
import {checkPermission, Permission_Types} from "../../../common/permission/permission";

@DComponent
@DHttpController(wikiApi)
class WikiController {
    @DHttpApi(wikiApi.routes.recentWikiList)
    async recentWikiList(@DHttpUser user:IUserSession):Promise<typeof wikiApi.routes.recentWikiList.res>{
        let ret=await WikiService.recentWikiList(user.organizationInfo.organizationUserId)
        return ret;
    }
    @DHttpApi(wikiApi.routes.userWikiList)
    async userWikiList(@DHttpReqParam("keyword") keyword:string,
                       @DHttpReqParam("sort") sort:"name"|"created_time",
                       @DHttpReqParamRequired("page") page:number,
                       @DHttpReqParamRequired("size") size:number,
                       @DHttpReqParamRequired("type",) type:"all"|"created"|"joined",@DHttpUser user:IUserSession):Promise<typeof wikiApi.routes.userWikiList.res>{
        let ret=await WikiService.userWikiList(user.organizationInfo.organizationId,user.organizationInfo.organizationUserId,page,size,type,keyword,sort);
        return ret;
    }
    @DHttpApi(wikiApi.routes.list)
    async list(@DHttpReqParam("keyword") keyword:string,
               @DHttpReqParamRequired("page") page:number,
               @DHttpReqParamRequired("size") size:number,
               @DHttpReqParam("organizationUserId") organizationUserId:string,@DHttpUser userInfo:IUserSession):Promise<typeof wikiApi.routes.list.res>{
        let user
        if(organizationUserId) {
            user=organizationUserId
        } else if(userInfo.type==ECommon_User_Type.ADMIN) {
            user=""
        } else if(userInfo.type==ECommon_User_Type.USER) {
            let permission=await rpcAuthApi.getPermissionByMemberId(userInfo.organizationInfo.organizationId,userInfo.organizationInfo.organizationUserId,ECommon_Model_Role_Type.ORGANIZATION)
            if(checkPermission(permission,Permission_Types.Organization.ADMIN)) {
                user=""
            } else {
                user=userInfo.organizationInfo.organizationUserId
            }
        }
        let list=await WikiService.list(userInfo.organizationInfo.organizationId,page,size,keyword,user)
        return list
    }
    @DHttpApi(wikiApi.routes.addWiki)
    async addWiki(@DHttpReqParamRequired("name") name :string,
                  @DHttpReqParam("photo") photo :string,
                  @DHttpReqParam("description") description :string,@DHttpUser userInfo:IUserSession):Promise<typeof wikiApi.routes.addWiki.res>{
        let wiki=new WikiService()
        wiki.assignItem({
            name:name,
            photo,
            description,
            organization_id:userInfo.organizationInfo.organizationId,
            created_by:userInfo.organizationInfo.organizationUserId
        })
        let ret=await wiki.create()
        return ret;
    }
    @DHttpApi(wikiApi.routes.editWiki)
    async editWiki(@DHttpReqParamRequired("wikiId") wikiId:string,
                   @DHttpReqParam("name") name :string,
                   @DHttpReqParam("photo") photo :string,
                   @DHttpReqParam("description") description :string):Promise<typeof wikiApi.routes.editWiki.res>{
        let obj=await WikiService.getItemById(wikiId)
        if(!obj) {
            throw Err.Wiki.wikiNotFound
        }
        obj.assignItem({
            name,
            photo,
            description
        })
        let ret=await obj.update()
        return ret;
    }
    @DHttpApi(wikiApi.routes.deleteWiki)
    async deleteWiki(@DHttpReqParamRequired("wikiId") wikiId:string):Promise<typeof wikiApi.routes.deleteWiki.res>{
        let obj=await WikiService.getItemById(wikiId)
        if(!obj) {
            throw Err.Wiki.wikiNotFound
        }
        await obj.delete();
        return
    }
    @DHttpApi(wikiApi.routes.wikiInfo)
    async wikiInfo(@DHttpReqParamRequired("wikiId") wikiId:string,@DHttpReqParam("keyword") keyword:string):Promise<typeof wikiApi.routes.wikiInfo.res>{
        let obj=await WikiService.getItemById(wikiId)
        if(!obj) {
            throw Err.Wiki.wikiNotFound
        }
        let ret=await obj.info(keyword)
        return ret;
    }
    @DHttpApi(wikiApi.routes.addWikiItem)
    async addWikiItem(@DHttpReqParamRequired("wikiId") wikiId:string,@DHttpReqParamRequired("name") name:string,@DHttpReqParam("parentWikiItemId") parentWikiItemId:string,@DHttpUser userInfo:IUserSession):Promise<typeof wikiApi.routes.addWikiItem.res>{
        let obj=new WikiItemService()
        obj.assignItem({
            wiki_id:wikiId,
            parent_id:parentWikiItemId,
            name,
            created_by:userInfo.organizationInfo.organizationUserId
        })
        let ret=await obj.create()
        return ret;
    }
    @DHttpApi(wikiApi.routes.editWikiItem)
    async editWikiItem(@DHttpReqParamRequired("wikiItemId") wikiItemId:string,@DHttpReqParamRequired("name") name:string):Promise<typeof wikiApi.routes.editWikiItem.res>{
        let obj=await WikiItemService.getItemById(wikiItemId)
        if(!obj) {
            throw Err.Wiki.wikiItemNotFound
        }
        obj.assignItem({
            name
        })
        let ret=await obj.update()
        return ret;
    }
    @DHttpApi(wikiApi.routes.deleteWikiItem)
    async deleteWikiItem(@DHttpReqParamRequired("wikiItemId") wikiItemId:string,@DHttpReqParamRequired("isChildren") isChildren:boolean):Promise<typeof wikiApi.routes.deleteWikiItem.res>{
        let obj=await WikiItemService.getItemById(wikiItemId)
        if(!obj) {
            throw Err.Wiki.wikiItemNotFound
        }
        await obj.remove(isChildren)
        return
    }
    @DHttpApi(wikiApi.routes.moveWikiItem)
    async moveWikiItem(@DHttpReqParamRequired("wikiItemId") wikiItemId:string,@DHttpReqParamRequired("newWikiItemId") newWikiItemId:string,@DHttpReqParamRequired("action") action:"up"|"down"|"child"):Promise<typeof wikiApi.routes.moveWikiItem.res>{
        let obj=await WikiItemService.getItemById(wikiItemId)
        if(!obj) {
            throw Err.Wiki.wikiItemNotFound
        }
        await obj.moveWikiItem(newWikiItemId,action)
        let objWiki=await WikiService.getItemById(obj.getItem().wiki_id)
        let ret=await objWiki.info()
        return ret;
    }
    @DHttpApi(wikiApi.routes.listRole)
    async listRole(@DHttpReqParam("wikiId") wikiId:string,@DHttpUser userInfo:IUserSession):Promise<typeof wikiApi.routes.listRole.res>{
        if(wikiId) {
            let obj=await WikiService.getItemById(wikiId)
            if(!obj) {
                throw Err.Wiki.wikiNotFound
            }
            let ret=await obj.listRole();
            return ret;
        } else {
            let ret=await WikiService.listGlobalRole(userInfo.organizationInfo.organizationId);
            return ret;
        }
    }
    @DHttpApi(wikiApi.routes.addRole)
    async addRole(@DHttpReqParam("wikiId") wikiId:string,
                  @DHttpReqParamRequired("name") name :string,
                  @DHttpReqParam("description") description:string,
                  @DHttpReqParamRequired("value") value:number,@DHttpUser user:IUserSession):Promise<typeof wikiApi.routes.addRole.res>{
        if(wikiId) {
            let obj=await WikiService.getItemById(wikiId)
            if(!obj) {
                throw Err.Wiki.wikiNotFound
            }
            let ret=await obj.createRole(name,description,value);
            return ret;
        } else {
            let ret=await WikiService.createGlobalRole(user.organizationInfo.organizationId,name,description,value)
            return ret;
        }
    }
    @DHttpApi(wikiApi.routes.editRole)
    async editRole(@DHttpReqParamRequired("roleId") roleId:string,
                   @DHttpReqParam("name") name :string,
                   @DHttpReqParam("description") description:string,
                   @DHttpReqParam("value") value:number,@DHttpUser user:IUserSession):Promise<typeof wikiApi.routes.editRole.res>{
        let ret=await rpcAuthApi.updateRole({
            id:roleId,
            name,
            description,
            value:value
        });
        return ret;
    }
    @DHttpApi(wikiApi.routes.removeRole)
    async removeRole(@DHttpReqParamRequired("roleId") roleId:string,@DHttpUser user:IUserSession):Promise<typeof wikiApi.routes.removeRole.res>{
        await rpcAuthApi.removeRole(roleId);
        return;
    }
    @DHttpApi(wikiApi.routes.getPermission)
    async getPermission(@DHttpReqParamRequired("wikiId") wikiId:string,@DHttpUser user:IUserSession):Promise<typeof wikiApi.routes.getPermission.res>{
        let value=await rpcAuthApi.getPermissionByMemberId(wikiId,user.organizationInfo.organizationUserId,ECommon_Model_Role_Type.WIKI);
        return {
            value
        };
    }
    @DHttpApi(wikiApi.routes.saveItemContent)
    async saveItemContent(@DHttpReqParamRequired("wikiItemId") wikiItemId:string,@DHttpReqParamRequired("content") content:string,@DHttpUser user:IUserSession):Promise<typeof wikiApi.routes.saveItemContent.res>{
        let obj=await WikiItemService.getItemById(wikiItemId)
        if(!obj) {
            throw Err.Wiki.wikiItemNotFound
        }
        await obj.saveContent(content,user.organizationInfo.organizationUserId)
        return
    }

    @DHttpApi(wikiApi.routes.getItemContent)
    async getItemContent(@DHttpReqParamRequired("wikiItemId") wikiItemId:string):Promise<typeof wikiApi.routes.getItemContent.res>{
        let obj=await WikiItemService.getItemById(wikiItemId)
        if(!obj) {
            throw Err.Wiki.wikiItemNotFound
        }
        let ret=await rpcContentApi.get(wikiItemId,ECommon_Model_Content_Type.WIKI_ITEM)
        return ret
    }
    @DHttpApi(wikiApi.routes.listMember)
    async listMember(@DHttpReqParamRequired("wikiId") wikiId:string,
                     @DHttpReqParamRequired("memberType") memberType:ECommon_Model_Organization_Member_Type,
                     @DHttpReqParam("page") page:number,
                     @DHttpReqParam("size") size:number,
                     @DHttpReqParam("key") key:string):Promise<typeof wikiApi.routes.listMember.res>{
        let obj=await WikiService.getItemById(wikiId);
        if(!obj) {
            throw Err.Wiki.wikiNotFound
        }
        let ret=await obj.listMember(memberType,page,size,key);
        return ret;
    }
    @DHttpApi(wikiApi.routes.addMember)
    async addMember(@DHttpReqParamRequired("wikiId") wikiId:string,
                    @DHttpReqParam("memberId")  memberId:string,
                    @DHttpReqParamRequired("type") type:ECommon_Model_Organization_Member_Type,
                    @DHttpReqParamRequired("roleId") roleId:string):Promise<typeof wikiApi.routes.addMember.res>{
        let obj=await WikiService.getItemById(wikiId);
        if(!obj) {
            throw Err.Wiki.wikiNotFound
        }
        let ret=await obj.addMember(memberId,type,roleId)
        return ret;
    }
    @DHttpApi(wikiApi.routes.editMember)
    async editMember(@DHttpReqParamRequired("wikiId") wikiId:string,
                     @DHttpReqParam("memberId") memberId:string,
                     @DHttpReqParamRequired("type") type:ECommon_Model_Organization_Member_Type,
                     @DHttpReqParamRequired("roleId") roleId:string):Promise<typeof wikiApi.routes.editMember.res>{
        let obj=await WikiService.getItemById(wikiId);
        if(!obj) {
            throw Err.Wiki.wikiNotFound
        }
        let ret=await obj.editMember(memberId,type,roleId);
        return ret;
    }
    @DHttpApi(wikiApi.routes.removeMember)
    async removeMember(@DHttpReqParamRequired("wikiId") wikiId:string,
                       @DHttpReqParam("memberId") memberId:string,
                       @DHttpReqParamRequired("type") type:ECommon_Model_Organization_Member_Type):Promise<typeof wikiApi.routes.removeMember.res>{
        let obj=await WikiService.getItemById(wikiId);
        if(!obj) {
            throw Err.Wiki.wikiNotFound
        }
        if(obj.getItem().created_by===memberId) {
            throw Err.Common.requestForbidden
        }
        await obj.removeMember(memberId,type)
        return
    }

    @DHttpApi(wikiApi.routes.wikiItemInfo)
    async wikiItemInfo(@DHttpReqParamRequired("wikiItemId") wikiItemId:string):Promise<typeof wikiApi.routes.wikiItemInfo.res>{
        let obj=await WikiItemService.getItemById(wikiItemId)
        if(!obj) {
            throw Err.Wiki.wikiItemNotFound
        }
        let objWiki=await WikiService.getItemById(obj.getItem().wiki_id)
        if(!objWiki) {
            throw Err.Wiki.wikiNotFound
        }
        return {
            ...obj.getItem(),
            wiki:objWiki.getItem()
        }
    }

    @DHttpApi(wikiApi.routes.filterWikiItem)
    async filterWikiItem(@DHttpReqParam("wikiId") wikiId:string,@DHttpReqParam("name") name:string,@DHttpReqParamRequired("size") size:number,@DHttpReqParamRequired("page") page:number,@DHttpUser user:IUserSession):Promise<typeof wikiApi.routes.filterWikiItem.res>{
        let ret=await WikiItemService.filterWikiItem(user.organizationInfo.organizationId,wikiId,name,page,size)
        return ret;
    }

    @DHttpApi(wikiApi.routes.globalSearchWikiItem)
    async globalSearchWikiItem(@DHttpReqParamRequired("keyword") keyword: string,@DHttpReqParamRequired("size") size: number,@DHttpUser user:IUserSession):Promise<typeof wikiApi.routes.globalSearchWikiItem.res>{
        let ret=await WikiItemService.globalSearch(keyword,size,user.organizationInfo.organizationUserId)
        return ret;
    }
}