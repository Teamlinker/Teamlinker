import { IUserSession } from './../../common/rpc/api/user';
import { DHttpApi, DHttpContext, DHttpReqParam, DHttpReqParamFile,DHttpContent, DHttpReqParamRequired, DHttpUser } from "../../common/http/http"
import * as userApi from "../../../common/routes/user"
import HttpContext from "../../common/http/context"
import UserService from "../service/user"
import { Err } from "../../../common/status/error"
import { DComponent } from '../../common/decorate/component';
@DComponent
class UserController {
    @DHttpApi(userApi.routes.create)
    async create(@DHttpContent content:typeof userApi.routes.create.req,@DHttpUser userInfo:IUserSession):Promise<typeof userApi.routes.create.res>{
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

    @DHttpApi(userApi.routes.checkUser)
    async checkUser(@DHttpReqParamRequired("name") name:string):Promise<typeof userApi.routes.checkUser.res> {
        let user=await UserService.getItemByName(name)
        if(!user) {
            return false
        }
        return true
    }

    @DHttpApi(userApi.routes.logout)
    async logout(@DHttpUser userInfo:IUserSession) {
        let user=await UserService.getItemById(userInfo.userId)
        if(!user) {
            throw Err.User.userNotFound
        }
        await user.stopSession()
    }

    @DHttpApi(userApi.routes.refresh)
    async refresh(@DHttpUser userInfo:IUserSession):Promise<typeof userApi.routes.refresh.res> {
        let user=await UserService.getItemById(userInfo.userId)
        if(!user) {
            throw Err.User.userNotFound
        }
        let item=user.getItem()
        delete item.password
        return item
    }

    @DHttpApi(userApi.routes.update)
    async update(@DHttpUser userInfo:IUserSession,@DHttpContent content:typeof userApi.routes.update.req):Promise<typeof userApi.routes.update.res> {
        let user=await UserService.getItemById(userInfo.userId)
        if(!user) {
            throw Err.User.userNotFound
        }
        user.assignItem(content)
        let obj=await user.update();
        delete obj.password
        return obj
    }

    @DHttpApi(userApi.routes.remove)
    async remove(@DHttpUser userInfo:IUserSession) {
        let user=await UserService.getItemById(userInfo.userId)
        if(!user) {
            throw Err.User.userNotFound
        }
        await user.delete()
    }

    @DHttpApi(userApi.routes.active)
    async active(@DHttpUser userInfo:IUserSession,@DHttpReqParamRequired("active") active:number) {
        let user=await UserService.getItemById(userInfo.userId)
        if(!user) {
            throw Err.User.userNotFound
        }
        await user.active(active);
    }
}