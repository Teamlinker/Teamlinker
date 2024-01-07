import {ECommon_Model_Organization_Member_Type} from "../../../common/model/organization";
import {ECommon_User_Type} from "../../../common/model/user";
import projectApi from "../../../common/routes/project";
import {Err} from "../../../common/status/error";
import {DHttpApi, DHttpController, DHttpReqParam, DHttpReqParamRequired, DHttpUser} from "../../common/http/http";
import {ProjectService} from "../service/project";
import {IUserSession} from "../../user/types/config";
import rpcAuthApi from "../../auth/rpc/auth";
import {ECommon_Model_Role_Type} from "../../../common/model/role";
import {checkPermission, Permission_Types} from "../../../common/permission/permission";

@DHttpController(projectApi)
class ProjectController {
    @DHttpApi(projectApi.routes.basic)
    async projectInfo(@DHttpReqParamRequired("projectId") projectId:string):Promise<typeof projectApi.routes.basic.res>{
        let obj=await ProjectService.getItemById(projectId);
        if(!obj) {
            throw Err.Project.projectNotFound
        }
        return obj.getItem();
    }

    @DHttpApi(projectApi.routes.create)
    async createProject(@DHttpReqParamRequired("name") name:string,@DHttpReqParamRequired("keyword") keyword:string,@DHttpReqParam("photo") photo:string,@DHttpReqParam("description") description:string,@DHttpReqParam("issueTypeSolutionId") issueTypeSolutionId:string,@DHttpUser user:IUserSession):Promise<typeof projectApi.routes.create.res>{
        let objProject=await ProjectService.getItemByExp({
            organization_id:user.organizationInfo.organizationId,
            keyword
        })
        if(objProject) {
            throw Err.Project.projectKeywordDuplicate
        }
        let obj=new ProjectService()
        obj.assignItem({
            keyword:keyword,
            name:name,
            created_by:user.organizationInfo.organizationUserId,
            description:description,
            photo:photo,
            organization_id:user.organizationInfo.organizationId
        })
        let ret=await obj.create(issueTypeSolutionId)
        return ret
    }

    @DHttpApi(projectApi.routes.edit)
    async editProject(@DHttpReqParam("name") name:string,@DHttpReqParam("keyword") keyword:string,@DHttpReqParam("photo") photo:string,@DHttpReqParam("description") description:string,@DHttpReqParam("projectId") projectId:string):Promise<typeof projectApi.routes.edit.res>{
        let obj=await ProjectService.getItemById(projectId);
        if(!obj) {
            throw Err.Project.projectNotFound
        }
        let item=obj.getItem()
        item.name=name;
        item.keyword=keyword
        item.photo=photo
        item.description=description
        let ret=await obj.update()
        return ret;
    }

    @DHttpApi(projectApi.routes.remove)
    async removeProject(@DHttpReqParamRequired("projectId") projectId:string):Promise<typeof projectApi.routes.remove.res>{
        let obj=await ProjectService.getItemById(projectId);
        if(!obj) {
            throw Err.Project.projectNotFound
        }
        await obj.delete()
        return
    }

    @DHttpApi(projectApi.routes.listMember)
    async listMember(@DHttpReqParamRequired("projectId") projectId:string,@DHttpReqParamRequired("memberType") memberType:ECommon_Model_Organization_Member_Type,@DHttpReqParamRequired("page") page:number,@DHttpReqParamRequired("size") size:number,@DHttpReqParam("key") key:string):Promise<typeof projectApi.routes.listMember.res>{
        let obj=await ProjectService.getItemById(projectId);
        if(!obj) {
            throw Err.Project.projectNotFound
        }
        let ret=await obj.listMember(memberType,page,size,key);
        return ret;
    }

    @DHttpApi(projectApi.routes.addMember)
    async addMember(@DHttpReqParamRequired("projectId") projectId:string, @DHttpReqParam("memberId") memberId:string, @DHttpReqParamRequired("type") type:ECommon_Model_Organization_Member_Type, @DHttpReqParamRequired("roleId") roleId:string):Promise<typeof projectApi.routes.addMember.res>{
        let obj=await ProjectService.getItemById(projectId);
        if(!obj) {
            throw Err.Project.projectNotFound
        }
        let ret=await obj.addMember(memberId,type,roleId)
        return ret;
    }

    @DHttpApi(projectApi.routes.editMember)
    async editMember(@DHttpReqParamRequired("projectId") projectId:string,@DHttpReqParam("memberId") memberId:string,@DHttpReqParam("type") type:ECommon_Model_Organization_Member_Type,@DHttpReqParamRequired("roleId") roleId:string):Promise<typeof projectApi.routes.editMember.res>{
        let obj=await ProjectService.getItemById(projectId);
        if(!obj) {
            throw Err.Project.projectNotFound
        }
        let ret=await obj.editMember(memberId,type,roleId);
        return ret;
    }

    @DHttpApi(projectApi.routes.removeMember)
    async removeMember(@DHttpReqParamRequired("projectId") projectId:string,@DHttpReqParam("memberId") memberId:string,@DHttpReqParamRequired("type") type:ECommon_Model_Organization_Member_Type):Promise<typeof projectApi.routes.removeMember.res>{
        let obj=await ProjectService.getItemById(projectId);
        if(!obj) {
            throw Err.Project.projectNotFound
        }
        if(obj.getItem().created_by===memberId) {
            throw Err.Common.requestForbidden
        }
        await obj.removeMember(memberId,type)
        return
    }

    @DHttpApi(projectApi.routes.list)
    async list(@DHttpReqParam("keyword") keyword:string,@DHttpReqParamRequired("page") page:number,@DHttpReqParamRequired("size") size:number,@DHttpReqParam("organizationUserId") organizationUserId:string,@DHttpUser userInfo:IUserSession) :Promise<typeof projectApi.routes.list.res>{
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
        let list=await ProjectService.list(userInfo.organizationInfo.organizationId,page,size,keyword,user)
        return list
    }

    @DHttpApi(projectApi.routes.issueTypeList)
    async issueTypeList(@DHttpReqParamRequired("projectId") projectId:string) :Promise<typeof projectApi.routes.issueTypeList.res> {
        let project=await ProjectService.getItemById(projectId)
        if(!project) {
            throw Err.Project.projectNotFound
        }
        let ret=await project.issueTypeList()
        return ret;
    }

    @DHttpApi(projectApi.routes.recentProjectList)
    async recentProjectList(@DHttpUser user:IUserSession) :Promise<typeof projectApi.routes.recentProjectList.res> {
        let ret=await ProjectService.recentProjectList(user.organizationInfo.organizationUserId);
        return ret;
    }


    @DHttpApi(projectApi.routes.userProjectList)
    async userProjectList(@DHttpReqParamRequired("page") page:number,@DHttpReqParamRequired("size") size:number,@DHttpReqParamRequired("type") type:"all"|"created"|"joined",@DHttpReqParam("keyword") keyword:string,@DHttpReqParam("sort") sort:"name"|"created_time",@DHttpUser user:IUserSession) :Promise<typeof projectApi.routes.userProjectList.res> {
        let ret=await ProjectService.userProjectList(user.organizationInfo.organizationId,user.organizationInfo.organizationUserId,page,size,type,keyword,sort);
        return ret;
    }

    @DHttpApi(projectApi.routes.listRole)
    async listRole(@DHttpReqParam("projectId") projectId:string,@DHttpUser user:IUserSession) :Promise<typeof projectApi.routes.listRole.res>{
        if(projectId) {
            let obj=await ProjectService.getItemById(projectId)
            if(!obj) {
                throw Err.Project.projectNotFound
            }
            let ret=await obj.listRole();
            return ret;
        } else {
            let ret=await ProjectService.listGlobalRole(user.organizationInfo.organizationId);
            return ret;
        }

    }

    @DHttpApi(projectApi.routes.addRole)
    async addRole(@DHttpReqParam("projectId") projectId:string,
                  @DHttpReqParamRequired("name") name :string,
                  @DHttpReqParamRequired("value") value:number,
                  @DHttpReqParam("description") description:string,@DHttpUser user:IUserSession) :Promise<typeof projectApi.routes.addRole.res>{
        if(projectId) {
            let obj=await ProjectService.getItemById(projectId)
            if(!obj) {
                throw Err.Project.projectNotFound
            }
            let ret=await obj.createRole(name,description,value);
            return ret;
        } else {
            let ret=await ProjectService.createGlobalRole(user.organizationInfo.organizationId,name,description,value)
            return ret;
        }
    }

    @DHttpApi(projectApi.routes.editRole)
    async editRole(@DHttpReqParamRequired("roleId") roleId:string,
                   @DHttpReqParam("name") name :string,
                   @DHttpReqParam("value") value:number,
                   @DHttpReqParam("description") description:string,
                   @DHttpUser user:IUserSession) :Promise<typeof projectApi.routes.editRole.res>{
        let ret=await rpcAuthApi.updateRole({
            id:roleId,
            name,
            description,
            value:value
        });
        return ret;
    }

    @DHttpApi(projectApi.routes.removeRole)
    async removeRole(@DHttpReqParamRequired("roleId") roleId:string,@DHttpUser user:IUserSession) :Promise<typeof projectApi.routes.removeRole.res>{
        await rpcAuthApi.removeRole(roleId);
        return;
    }

    @DHttpApi(projectApi.routes.getPermission)
    async getPermission(@DHttpReqParamRequired("projectId") projectId:string,@DHttpUser user:IUserSession) :Promise<typeof projectApi.routes.getPermission.res>{
        let value=await rpcAuthApi.getPermissionByMemberId(projectId,user.organizationInfo.organizationUserId,ECommon_Model_Role_Type.PROJECT);
        return {
            value
        };
    }

    @DHttpApi(projectApi.routes.statics)
    async statics(@DHttpReqParamRequired("projectId") projectId:string,@DHttpUser user:IUserSession) :Promise<typeof projectApi.routes.statics.res>{
        let obj=await ProjectService.getItemById(projectId)
        if(!obj) {
            throw Err.Project.projectNotFound
        }
        let ret=await obj.statics(user.organizationInfo.organizationUserId)
        return ret
    }

}
export default new ProjectController