import { DHttpApi, DHttpContext, DHttpReqParam, DHttpReqParamFile,DHttpContent, DHttpReqParamRequired } from "../../common/http/http"
import * as userApi from "../../../common/routes/user"
import HttpContext from "../../common/http/context"
import UserService from "../service/user"
import { Err } from "../../../common/status/error"
class UserController {
    @DHttpApi(userApi.routes.create)
    async create(@DHttpContent content:typeof userApi.routes.create.req):Promise<typeof userApi.routes.create.res>{
        let user=new UserService()
        user.assignItem(content);
        let obj=await user.create()
        delete obj.password
        return obj
    }

    @DHttpApi(userApi.routes.login)
    async login(@DHttpReqParamRequired("username") username:string,@DHttpReqParamRequired("password") password:string,@DHttpContext ctx:HttpContext):Promise<typeof userApi.routes.login.res> {
        let user=await UserService.getItemByName(username)
        if(!user) {
            throw new Err.User.UserNotFound
        }
        if(user.getItem().password===password) {
            let token=await user.startSession()
            let ret=user.getItem()
            delete ret.password
            ctx.setHeader("token",token)
            return ret
        } else {
            throw new Err.User.UserPasswordWrong
        }
    }
}
export default new UserController