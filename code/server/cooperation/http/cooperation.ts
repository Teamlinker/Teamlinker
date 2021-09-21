

import { DHttpApi, DHttpContext, DHttpReqParam, DHttpReqParamFile,DHttpContent, DHttpReqParamRequired, DHttpUser } from "../../common/http/http"
import * as projectApi from "../../../common/routes/project"
import HttpContext from "../../common/http/context"
import { Err } from "../../../common/status/error"
import { IUserSession } from "../../common/rpc/api/user"
import Project from "../service/project"
class UserController {
    @DHttpApi(projectApi.routes.basic)
    async projectBasicInfo(@DHttpReqParamRequired("projectId") projectId:string):Promise<typeof projectApi.routes.basic.res>{
        let obj=await Project.getItemById(projectId);
        return obj.getItem();
    }

}
export default new UserController