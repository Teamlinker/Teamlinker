import * as userApi from "../../../common/routes/user";
import { Err } from "../../../common/status/error";
import { DComponent } from '../../common/decorate/component';
import { EServer_Common_Event_Types } from '../../common/event/types';
import HttpContext from "../../common/http/context";
import { DHttpApi, DHttpContent, DHttpContext, DHttpReqParam, DHttpReqParamRequired, DHttpUser } from "../../common/http/http";
import { EServer_Common_User_Type } from "../../common/types/user";
import UserService from "../service/user";
import { IUserSession } from './../../common/rpc/api/user';
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
        let user=await UserService.getItemById(userInfo.type==EServer_Common_User_Type.USER?userInfo.userId:content.userId)
        if(!user) {
            throw Err.User.userNotFound
        }
        delete (<any>content).password
        user.assignItem(content)
        let obj=await user.update();
        delete obj.password
        return obj
    }

    @DHttpApi(userApi.routes.remove)
    async remove(@DHttpReqParamRequired("userId") userId:string) {
        let user=await UserService.getItemById(userId)
        if(!user) {
            throw Err.User.userNotFound
        }
        await user.delete(EServer_Common_Event_Types.User.DELETE)
    }

    @DHttpApi(userApi.routes.active)
    async active(@DHttpReqParamRequired("userId") userId:string,@DHttpReqParamRequired("active") active:number) {
        let user=await UserService.getItemById(userId)
        if(!user) {
            throw Err.User.userNotFound
        }
        await user.active(active);
    }

    @DHttpApi(userApi.routes.list)
    async list(@DHttpReqParam("keyword") keyword:string,@DHttpReqParamRequired("page") page:number,@DHttpReqParamRequired("size") size:number) :Promise<typeof userApi.routes.list.res>{
        let list=await UserService.list(page,size,keyword)
        return list
    }

    @DHttpApi(userApi.routes.resetPassword)
    async resetPassword(@DHttpReqParam("userId") userId:string,@DHttpReqParamRequired("password") password:string,@DHttpUser userInfo:IUserSession) :Promise<typeof userApi.routes.resetPassword.res>{
        let user=await UserService.getItemById(userInfo.type==EServer_Common_User_Type.USER?userInfo.userId:userId)
        if(!user) {
            throw Err.User.userNotFound
        }
        user.assignItem({
            password:password
        })
        await user.update()
        return;
    }

    @DHttpApi(userApi.routes.teamList)
    async teamList(@DHttpReqParam("keyword") keyword:string,@DHttpReqParamRequired("page") page:number,@DHttpReqParamRequired("size") size:number,@DHttpReqParam("userId") userId:string,@DHttpUser userInfo:IUserSession) :Promise<typeof userApi.routes.teamList.res>{
        let user=await UserService.getItemById(userInfo.type==EServer_Common_User_Type.USER?userInfo.userId:userId)
        if(!user) {
            throw Err.User.userNotFound
        }
        let ret=await user.teamList(page,size,keyword)
        return ret;
    }

    @DHttpApi(userApi.routes.projectList)
    async projectList(@DHttpReqParam("keyword") keyword:string,@DHttpReqParamRequired("page") page:number,@DHttpReqParamRequired("size") size:number,@DHttpReqParam("userId") userId:string,@DHttpUser userInfo:IUserSession) :Promise<typeof userApi.routes.projectList.res>{
        let user=await UserService.getItemById(userInfo.type==EServer_Common_User_Type.USER?userInfo.userId:userId)
        if(!user) {
            throw Err.User.userNotFound
        }
        let ret=await user.projectList(page,size,keyword)
        return ret;
    }

    @DHttpApi(userApi.routes.profile)
    async profile(@DHttpReqParam("userId") userId:string,@DHttpUser userInfo:IUserSession) :Promise<typeof userApi.routes.profile.res>{
        let user=await UserService.getItemById(userId??userInfo.userId)
        if(!user) {
            throw Err.User.userNotFound
        }
        let ret=await user.profile()
        return ret;
    }
}