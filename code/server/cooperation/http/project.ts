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

}
export default new ProjectController