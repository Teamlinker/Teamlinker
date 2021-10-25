

import * as projectApi from "../../../common/routes/project"
import { DHttpApi, DHttpReqParamRequired } from "../../common/http/http"
import Project from "../service/project"
class ProjectController {
    @DHttpApi(projectApi.routes.basic)
    async projectBasicInfo(@DHttpReqParamRequired("projectId") projectId:string):Promise<typeof projectApi.routes.basic.res>{
        let obj=await Project.getItemById(projectId);
        return obj.getItem();
    }

}
export default new ProjectController