import { HttpApi, HttpController, HttpCookies, HttpReqHeader, HttpReqParam, HttpReqParamRequired } from "../../../common/decorator/http"
import * as userApi from "../../../../common/routes/user"
import { ICommon_Http_User_Test_Res } from "../../../../common/routes/userRes"
import * as Cookies from "cookies"
@HttpController(userApi)
class UserController {
    @HttpApi(userApi.routes.test)
    async test(@HttpCookies cookies:Cookies):Promise<ICommon_Http_User_Test_Res>{
        cookies.set("sx","234")
        return {
            name:"aaa",
            age:11,
        }
    }
}
export default new UserController