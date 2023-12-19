import {ECommon_User_From_Type, ECommon_User_Type} from "../../../common/model/user";
import userApi from "../../../common/routes/user";
import {Err} from "../../../common/status/error";
import {DComponent} from '../../common/decorate/component';
import HttpContext from "../../common/http/context";
import {
    DHttpApi,
    DHttpContent,
    DHttpContext,
    DHttpController,
    DHttpReqParam,
    DHttpReqParamRequired,
    DHttpUser
} from "../../common/http/http";
import {UserService, UserSettingService} from "../service/user";
import {IUserSession} from "../types/config";
import {OrganizationUserService} from "../service/organization";
import {ECommon_Platform_Type} from "../../../common/types";
import rpcFileApi from "../../file/rpc/file"
import {REDIS_USER} from "../../common/cache/keys/user";
import rpcFinderApi from "../../finder/rpc/finder";
import * as i18next from "i18next";
import File from "../../file/service/file";

@DComponent
@DHttpController(userApi)
class UserController {
    @DHttpApi(userApi.routes.create)
    async create(@DHttpContent content:typeof userApi.routes.create.req,@DHttpUser userInfo:IUserSession):Promise<typeof userApi.routes.create.res>{
        let user=new UserService()
        delete content.role;
        user.assignItem(content);
        let obj=await user.create()
        delete obj.password
        return obj
    }

    @DHttpApi(userApi.routes.login)
    async login(@DHttpReqParamRequired("username") username:string,@DHttpReqParamRequired("password") password:string,@DHttpReqParamRequired("lang") lang:string,@DHttpReqParamRequired("platform") platform:ECommon_Platform_Type,@DHttpContext ctx:HttpContext):Promise<typeof userApi.routes.login.res> {
        let user=await UserService.getItemByName(username)
        if(!user) {
            throw  Err.User.userNotFound
        }
        if(!user.getItem().active) {
            throw Err.User.accessDenied
        }
        if(user.getItem().password===password) {
            let token=await user.startSession(platform,lang)
            if(user.getItem().count===0) {
                rpcFinderApi.createFolder(user.getId(),i18next.getFixedT(lang)("backend.newFolder"),null)
            }
            user.assignItem({
                count:user.getItem().count+1
            })
            let ret=await user.update()
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
        await user.stopSession(userInfo.platform)
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
        let user=await UserService.getItemById(userInfo.type==ECommon_User_Type.USER?userInfo.userId:content.userId)
        if(!user) {
            throw Err.User.userNotFound
        }
        delete (<any>content).password
        delete (<any>content).userId
        delete (<any>content).role
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
        await user.delete("userDelete")
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
        let user=await UserService.getItemById(userInfo.type==ECommon_User_Type.USER?userInfo.userId:userId)
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
    async teamList(@DHttpReqParam("userId") userId:string,@DHttpReqParam("keyword") keyword:string,@DHttpUser userInfo:IUserSession) :Promise<typeof userApi.routes.teamList.res>{
        let user=await UserService.getItemById(userId??userInfo.userId)
        if(!user) {
            throw Err.User.userNotFound
        }
        let organizationUser=await OrganizationUserService.getItemByExp({
            organization_id:userInfo.organizationInfo.organizationId,
            user_id:user.getId()
        })
        if(!organizationUser) {
            throw Err.Organization.userNotFound
        }
        let ret=await user.teamList(organizationUser.getId(),userInfo.organizationInfo.organizationId,keyword)
        return ret;
    }

    @DHttpApi(userApi.routes.profile)
    async profile(@DHttpReqParam("organizationUserId") organizationUserId:string,@DHttpUser userInfo:IUserSession) :Promise<typeof userApi.routes.profile.res>{
        let organizationUser=await OrganizationUserService.getItemById(organizationUserId??userInfo.organizationInfo.organizationId)
        if(!organizationUser) {
            throw Err.Organization.userNotFound
        }
        let user=await UserService.getItemById(organizationUser.getItem().user_id)
        if(!user) {
            throw Err.User.userNotFound
        }
        let ret=await user.profile(organizationUser.getId(),organizationUser.getItem().organization_id)
        return {
            ...ret,
            organizationUser:organizationUser.getItem()
        };
    }

    @DHttpApi(userApi.routes.infos)
    async infos(@DHttpReqParam("userIds") userIds:string,@DHttpUser user:IUserSession) :Promise<typeof userApi.routes.infos.res>{
        let ret=await UserService.userInfos(userIds,true)
        return ret;
    }

    @DHttpApi(userApi.routes.filterUser)
    async filterUser(@DHttpReqParamRequired("name") name:string) :Promise<typeof userApi.routes.filterUser.res>{
        let ret=await UserService.filter(name,10);
        return ret;
    }

    @DHttpApi(userApi.routes.setting)
    async setting(@DHttpUser user:IUserSession):Promise<typeof userApi.routes.setting.res> {
        let obj=await UserSettingService.getItemByExp({
            user_id:user.userId
        })
        let wallpaper=obj.getItem().wallpaper
        if(wallpaper) {
            obj.getItem().wallpaper=await rpcFileApi.getPath(wallpaper)
        }
        let backgroundImage=obj.getItem().meeting_background_img
        if(backgroundImage) {
            obj.getItem().meeting_background_img=await rpcFileApi.getPath(backgroundImage)
        }
        return obj.getItem()
    }

    @DHttpApi(userApi.routes.setWallpaper)
    async setWallpaper(@DHttpReqParam("photo") photo:string,@DHttpUser user:IUserSession):Promise<typeof userApi.routes.setWallpaper.res> {
        let obj=await UserSettingService.getItemByExp({
            user_id:user.userId
        })
        obj.assignItem({
            wallpaper:photo??null
        })
        await obj.update()
        let path=photo?(await rpcFileApi.getPath(photo)):null
        return {
            path:path
        }
    }

    @DHttpApi(userApi.routes.setMeetingBackgroundImg)
    async setMeetingBackgroundImg(@DHttpReqParam("photo") photo:string,@DHttpUser user:IUserSession):Promise<typeof userApi.routes.setMeetingBackgroundImg.res> {
        let obj=await UserSettingService.getItemByExp({
            user_id:user.userId
        })
        obj.assignItem({
            meeting_background_img:photo??null
        })
        await obj.update()
        let path=photo?(await rpcFileApi.getPath(photo)):null
        return {
            path:path
        }
    }

    @DHttpApi(userApi.routes.changeLang)
    async changeLang(@DHttpReqParamRequired("lang") lang:string,@DHttpUser user:IUserSession):Promise<typeof userApi.routes.changeLang.res> {
        let objRedis=REDIS_USER.info(user.userId)
        let obj=await objRedis.get()
        if(obj) {
            obj.lang=lang
            await objRedis.set(obj)
        }
        return 
    }

    @DHttpApi(userApi.routes.wechatCode)
    async wechatCode(@DHttpReqParamRequired("code") code:string,@DHttpUser user:IUserSession):Promise<typeof userApi.routes.wechatCode.res> {
        let ret=await UserService.handleWechatCode(code)
        return ret;
    }


    @DHttpApi(userApi.routes.wechatLogin)
    async wechatLogin(@DHttpReqParamRequired("openId") openId:string,@DHttpReqParamRequired("lang") lang:string,@DHttpReqParamRequired("platform") platform:ECommon_Platform_Type,@DHttpContext ctx:HttpContext):Promise<typeof userApi.routes.wechatLogin.res> {
        let user=await UserService.getItemByExp({
            from_id:openId
        })
        if(user) {
            if(!user.getItem().active) {
                throw Err.User.accessDenied
            }
            let token=await user.startSession(platform,lang)
            if(user.getItem().count===0) {
                rpcFinderApi.createFolder(user.getId(),i18next.getFixedT(lang)("backend.newFolder"),null)
            }
            user.assignItem({
                count:user.getItem().count+1
            })
            let ret=await user.update()
            delete ret.password
            ctx.setHeader("token",token)
            return ret
        } else {
            return;
        }
    }

    @DHttpApi(userApi.routes.bindWechat)
    async bindWechat(@DHttpReqParamRequired("openId") openId:string,@DHttpReqParamRequired("username") username:string,@DHttpReqParamRequired("password") password:string,@DHttpContext ctx:HttpContext):Promise<typeof userApi.routes.bindWechat.res> {
        let objUser=await UserService.getItemByExp({
            username,
            password
        })
        if(!objUser) {
            throw Err.User.userPasswordWrong
        }
        let img:string
        if(openId) {
            let objRedis=REDIS_USER.wechatOpenId(openId)
            let value=await objRedis.get()
            if(!value) {
                throw Err.User.userCacheExpired
            }
            let user=await UserService.getItemByExp({
                from_id:openId
            })
            if(user) {
                throw Err.User.userExists
            }
            img=value.img
        }
        objUser.assignItem({
            from_type:objUser.getItem().from_type | ECommon_User_From_Type.WECHAT,
            from_id:openId
        })
        await objUser.update()
        if(img && !objUser.getItem().photo) {
            let file=await File.download(img,objUser.getId())
            objUser.assignItem({
                photo:file.getId()
            })
            await objUser.update()
        }
        return;
    }

}