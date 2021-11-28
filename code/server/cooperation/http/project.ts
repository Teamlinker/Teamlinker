import { ECommon_Model_Project_Member_Type } from "../../../common/model/project_member";
import * as projectApi from "../../../common/routes/project";
import { Err } from "../../../common/status/error";
import { DHttpApi, DHttpReqParam, DHttpReqParamRequired, DHttpUser } from "../../common/http/http";
import { IUserSession } from "../../common/rpc/api/user";
import ProjectService from "../service/project";


class ProjectController {
    @DHttpApi(projectApi.routes.basic)
    async projectInfo(@DHttpReqParamRequired("projectId") projectId:string):Promise<typeof projectApi.routes.basic.res>{
        let obj=await ProjectService.getItemById(projectId);
        return obj.getItem();
    }

    @DHttpApi(projectApi.routes.create)
    async createProject(@DHttpReqParamRequired("name") name:string,@DHttpReqParamRequired("keyword") keyword:string,@DHttpReqParam("image") image:string,@DHttpReqParam("description") description:string,@DHttpUser user:IUserSession):Promise<typeof projectApi.routes.create.res>{
        let obj=new ProjectService()
        obj.assignItem({
            keyword:keyword,
            name:name,
            created_by:user.userId,
            description:description,
            image:image
        })
        let ret=await obj.create()
        return ret
    }

    @DHttpApi(projectApi.routes.edit)
    async editProject(@DHttpReqParam("name") name:string,@DHttpReqParam("keyword") keyword:string,@DHttpReqParam("image") image:string,@DHttpReqParam("description") description:string,@DHttpReqParam("projectId") projectId:string):Promise<typeof projectApi.routes.edit.res>{
        let obj=await ProjectService.getItemById(projectId);
        if(!obj) {
            throw Err.Project.projectNotFound
        }
        let item=obj.getItem()
        item.name=name;
        item.keyword=keyword
        item.image=image
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
    async list(@DHttpReqParam("keyword") keyword:string,@DHttpReqParamRequired("page") page:number,@DHttpReqParamRequired("size") size:number) :Promise<typeof projectApi.routes.list.res>{
        let list=await ProjectService.list(page,size,keyword)
        return list
    }

}
export default new ProjectController