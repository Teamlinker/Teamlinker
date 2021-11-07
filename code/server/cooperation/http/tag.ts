import { DComponent } from "../../common/decorate/component";
import { DHttpApi, DHttpReqParam, DHttpReqParamRequired } from "../../common/http/http";
import * as projectApi from "../../../common/routes/project";


@DComponent
class TagController {
     @DHttpApi(projectApi.routes.listTag)
     async listTag(@DHttpReqParamRequired("projectId") projectId:string,@DHttpReqParamRequired("page") page:number,@DHttpReqParamRequired("size") size:number,@DHttpReqParam("keyword") keyword:string) {
         
     }
}