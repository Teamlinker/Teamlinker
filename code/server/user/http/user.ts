import { IServer_Common_Http_Req_File } from './../../common/types/http';
import { DHttpApi, DHttpContext, DHttpReqParam, DHttpReqParamFile,DHttpContent } from "../../common/http/http"
import * as userApi from "../../../common/routes/user"
import { ICommon_Http_User_Test_Res } from "../../../common/routes/userRes"
import HttpContext from "../../common/http/context"
class UserController {
    @DHttpApi(userApi.routes.test)
    async test(@DHttpContent content:typeof userApi.routes.test.req,@DHttpContext ctx:HttpContext):Promise<ICommon_Http_User_Test_Res>{
        console.log(content)
        return {
            name:"",
            age:11,
        }
    }
}
export default new UserController