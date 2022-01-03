import { ECommon_Model_Project_Member_Type } from "../../../common/model/project_member";
import * as projectApi from "../../../common/routes/project";
import { Err } from "../../../common/status/error";
import { DHttpApi, DHttpController, DHttpReqParam, DHttpReqParamRequired, DHttpUser } from "../../common/http/http";
import { IUserSession } from "../../common/rpc/api/user";
import { EServer_Common_User_Type } from "../../common/types/user";
import ProjectService from "../service/project";

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
    async createProject(@DHttpReqParamRequired("name") name:string,@DHttpReqParamRequired("keyword") keyword:string,@DHttpReqParam("photo") photo:string,@DHttpReqParam("description") description:string,@DHttpUser user:IUserSession):Promise<typeof projectApi.routes.create.res>{
        let obj=new ProjectService()
        obj.assignItem({
            keyword:keyword,
            name:name,
            created_by:user.userId,
            description:description,
            photo:photo
        })
        let ret=await obj.create()
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
    async listMember(@DHttpReqParamRequired("projectId") projectId:string,@DHttpReqParamRequired("page") page:number,@DHttpReqParamRequired("size") size:number):Promise<typeof projectApi.routes.listMember.res>{
        let obj=await ProjectService.getItemById(projectId);
        if(!obj) {
            throw Err.Project.projectNotFound
        }
        let ret=await obj.listMember(page,size)
        return ret;
    }

    @DHttpApi(projectApi.routes.addMember)
    async addMember(@DHttpReqParamRequired("projectId") projectId:string,@DHttpReqParamRequired("memberId") memberId:string,@DHttpReqParamRequired("type") type:ECommon_Model_Project_Member_Type,@DHttpReqParamRequired("roleId") roleId:string):Promise<typeof projectApi.routes.addMember.res>{
        let obj=await ProjectService.getItemById(projectId);
        if(!obj) {
            throw Err.Project.projectNotFound
        }
        await obj.addMember(memberId,type,roleId)
        return
    }

    @DHttpApi(projectApi.routes.editMember)
    async editMember(@DHttpReqParamRequired("projectId") projectId:string,@DHttpReqParamRequired("memberId") memberId:string,@DHttpReqParamRequired("roleId") roleId:string):Promise<typeof projectApi.routes.editMember.res>{
        let obj=await ProjectService.getItemById(projectId);
        if(!obj) {
            throw Err.Project.projectNotFound
        }
        await obj.editMember(memberId,roleId);
        return
    }

    @DHttpApi(projectApi.routes.removeMember)
    async removeMember(@DHttpReqParamRequired("projectId") projectId:string,@DHttpReqParamRequired("memberId") memberId:string):Promise<typeof projectApi.routes.removeMember.res>{
        let obj=await ProjectService.getItemById(projectId);
        if(!obj) {
            throw Err.Project.projectNotFound
        }
        await obj.removeMember(memberId)
        return
    }

    @DHttpApi(projectApi.routes.list)
    async list(@DHttpReqParam("keyword") keyword:string,@DHttpReqParamRequired("page") page:number,@DHttpReqParamRequired("size") size:number,@DHttpReqParam("userId") userId:string,@DHttpUser userInfo:IUserSession) :Promise<typeof projectApi.routes.list.res>{
        let user=""
        if(userInfo.type==EServer_Common_User_Type.ADMIN && userId) {
            user=userId
        } else if(userInfo.type==EServer_Common_User_Type.USER) {
            user=userInfo.userId
        }
        let list=await ProjectService.list(page,size,keyword,user)
        return list
    }

    @DHttpApi(projectApi.routes.roles)
    async roles(@DHttpReqParamRequired("projectId") projectId:string) :Promise<typeof projectApi.routes.roles.res> {
        let project=await ProjectService.getItemById(projectId)
        if(!project) {
            throw Err.Project.projectNotFound
        }
        let ret=await project.getRoles()
        return ret;
    }

}
export default new ProjectController