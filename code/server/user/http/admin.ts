import userApi from "../../../common/routes/user";
import {Err} from "../../../common/status/error";
import {DComponent} from "../../common/decorate/component";
import HttpContext from "../../common/http/context";
import {DHttpApi, DHttpContext, DHttpController, DHttpReqParamRequired, DHttpUser} from "../../common/http/http";
import {AdminService} from "../service/admin";
import {IUserSession} from "../types/config";

@DComponent
@DHttpController(userApi)
class AdminController {
    @DHttpApi(userApi.routes.loginAdmin)
    async login(@DHttpReqParamRequired("username") username:string,@DHttpReqParamRequired("password") password:string,@DHttpContext ctx:HttpContext):Promise<typeof userApi.routes.loginAdmin.res>{
        let user=await AdminService.getItemByName(username)
        if(!user) {
            throw  Err.User.userNotFound
        }
        if(user.getItem().password===password) {
            let token=await user.startSession()
            let ret=user.getItem()
            delete ret.password
            ctx.setHeader("token",token)
            return ret
        } else {
            throw  Err.User.userPasswordWrong
        }
    }

    @DHttpApi(userApi.routes.logoutAdmin)
    async logout(@DHttpUser userInfo:IUserSession) {
        let user=await AdminService.getItemById(userInfo.userId)
        if(!user) {
            throw Err.User.userNotFound
        }
        await user.stopSession()
    }
}