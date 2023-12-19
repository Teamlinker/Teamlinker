import * as jwt from "jsonwebtoken";
import {ICommon_Route_Res_User_List} from "../../../common/routes/response";
import {Err} from '../../../common/status/error';
import {REDIS_USER} from "../../common/cache/keys/user";
import {getConfigInstance} from '../../common/config/config';
import {Entity} from "../../common/entity/entity";
import {userMapper, userSettingMapper} from '../mapper/user';
import rpcFileApi from "../../file/rpc/file";
import {ECommon_User_From_Type, ECommon_User_Type, ICommon_Model_User, userModel} from './../../../common/model/user';
import rpcAuthApi from "../../auth/rpc/auth";
import {ICommon_Model_Team} from "../../../common/model/team";
import {ECommon_Model_Role_Reserved} from "../../../common/model/role";
import {OrganizationService, OrganizationUserService} from "./organization";
import CommonUtil from "../../common/util/common";
import {getMailInstance} from "../../common/mail/mail";
import {userSettingModel} from "../../../common/model/user_setting";
import {IServer_Common_Event_Types} from "../../common/event/types";
import rpcFinderApi from "../../finder/rpc/finder"
import rpcNotificationApi from "../../notification/rpc/notification"
import {PhotoService, StickyNoteService} from "./tool";
import {REDIS_ORGANIZATION} from "../../common/cache/keys/organization";
import {request} from "../../common/request/request"
import Application from "../../common/app/app";
import File from "../../file/service/file";
import {ECommon_Platform_Type} from "../../../common/types";


export class UserService extends Entity<typeof userModel,typeof userMapper> {
    constructor(){
        super(userMapper)
    }

    override async delete(eventPublish?: keyof IServer_Common_Event_Types, ...param): Promise<void> {
        await super.delete(eventPublish, ...param);
        let arrOrganizationUser=await OrganizationUserService.getItemsByExp({
            user_id:this.getId()
        })
        for(let objOrganizationUser of arrOrganizationUser) {
            let objOrganization=await OrganizationService.getItemById(objOrganizationUser.getItem().organization_id)
            if(objOrganization) {
                objOrganization.removeUser(objOrganizationUser.getId())
            }
        }
        rpcFinderApi.clearByUserId(this.getId())
        rpcNotificationApi.clearByUserId(this.getId())
        let objSetting=await UserSettingService.getItemByExp({
            user_id:this.getId()
        })
        objSetting?.delete()
        StickyNoteService.clear(this.getId())
        PhotoService.clear(this.getId())
    }

    static async register(username:string,password:string) {
        let obj=await userMapper.getUserByName(username)
        if(obj) {
            throw Err.User.userExists
        } else if(!username.includes("@")) {
            throw Err.User.userNameNotMail
        }
        let objRedis=REDIS_USER.registerCacheInfo(username)
        let code=CommonUtil.generateRandomNumbers(6)
        await objRedis.set({
            code:code,
            username,
            password,
            sendTime:Date.now()
        })
        let mail=getMailInstance()
        mail.send(username,"Teamlinker Verification Code","code: "+code)
    }

    static async resendCode(username:string) {
        let objRedis=REDIS_USER.registerCacheInfo(username)
        let exist=await objRedis.exists()
        if(!exist) {
            throw Err.User.userCacheExpired
        }
        let content=await objRedis.get()
        if(Date.now()-content.sendTime<60*1000) {
            throw Err.User.timeTooShort
        }
        let code=CommonUtil.generateRandomNumbers(6)
        content.code=code
        content.sendTime=Date.now()
        await objRedis.set(content)
        let mail=getMailInstance()
        mail.send(username,"Teamlinker Verification Code","code: "+code)
    }

    static async conformRegister(username:string,code:string,openId?:string) {
        let obj=await userMapper.getUserByName(username)
        if(obj) {
            throw Err.User.userExists
        } else if(!username.includes("@")) {
            throw Err.User.userNameNotMail
        }
        let objRedis=REDIS_USER.registerCacheInfo(username)
        let exist=await objRedis.exists()
        if(!exist) {
            throw Err.User.userCacheExpired
        }
        let content=await objRedis.get()
        if(content.code!==code) {
            throw Err.User.codeNotMatch
        }
        let objUser=new UserService()
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
            username,
            password:content.password,
            ...(openId && {
                from_type:ECommon_User_From_Type.WECHAT,
                from_id:openId
            })
        })
        let ret=await objUser.create()
        if(img) {
            let file=await File.download(img,ret.id)
            objUser.assignItem({
                photo:file.getId()
            })
            await objUser.update()
        }
        objRedis.del()
    }

    override async create(...param): Promise<typeof userModel["model"]> {
        let ret=await super.create(...param);
        let obj=new UserSettingService()
        obj.assignItem({
            user_id:ret.id
        })
        await obj.create()
        return ret;
    }

    static async getItemByName(name:string):Promise<InstanceType<typeof UserService>>{
        let obj = await userMapper.getUserByName(name);
        if(obj) {
            let user = new UserService;
            user.setItem(obj);
            return user;
        } else {
            return null;
        }
    }

    async resetCode() {
        let objRedis=await REDIS_USER.resetCode(this.getId())
        let mail=getMailInstance()
        let exist=await objRedis.exists()
        if(!exist) {
            let code=CommonUtil.generateRandomNumbers(6)
            await objRedis.set({
                userId:this.getId(),
                sendTime:Date.now(),
                code:code
            })
            mail.send(this.getItem().username,"Teamlinker Verification Code",code)
        } else {
            let content=await objRedis.get()
            if(Date.now()-content.sendTime<1000*60) {
                throw Err.User.timeTooShort
            } else {
                let code=CommonUtil.generateRandomNumbers(6)
                content.sendTime=Date.now()
                content.code=code
                await objRedis.set(content)
                mail.send(this.getItem().username,"Teamlinker Verification Code",code)
            }
        }
    }

    async reset(password:string,code:string) {
        let objRedis=await REDIS_USER.resetCode(this.getId())
        let exist=await objRedis.exists()
        if(!exist) {
            throw Err.User.userCacheExpired
        }
        let content=await objRedis.get()
        if(content.code!==code) {
            throw Err.User.codeNotMatch
        }
        this.assignItem({
            password
        })
        await this.update()
    }

    async startSession(platform:ECommon_Platform_Type,lang:string):Promise<string>{
        let secret=getConfigInstance().jwt;
        if(!this.item || !this.item.id) {
            throw Err.User.userNotFound
        }
        return new Promise(async (resolve,reject)=>{
            jwt.sign({
                userId:this.item.id,
                type:ECommon_User_Type.USER,
                platform
            },secret,async (err,token)=>{
                if(err) {
                    reject(err)
                    return
                } else {
                    let session=REDIS_USER.token(platform,this.item.id)
                    await session.set(token);
                    let sessionInfo=REDIS_USER.info(this.item.id)
                    await sessionInfo.set(Object.assign({},this.item,{
                        lang
                    }));
                    let objRedisPlatformList=REDIS_USER.userPlatformList(this.item.id)
                    let objPlatformList=await objRedisPlatformList.get()
                    if(!objPlatformList?.includes(platform)) {
                        let sessionOrganization=REDIS_USER.organizationInfo(platform,this.item.id)
                        let objSessionOrganization=await sessionOrganization.get()
                        await sessionOrganization.del();
                        if(objSessionOrganization) {
                            let objOrganizationUser=await OrganizationUserService.getItemById(objSessionOrganization.organizationUserId)
                            if(objOrganizationUser) {
                                await objOrganizationUser.clearStatus(objPlatformList)
                            }
                        }
                    }
                    if(objPlatformList) {
                        objPlatformList.push(platform)
                    } else {
                        objPlatformList=[platform]
                    }
                    await objRedisPlatformList.set(objPlatformList)
                    resolve(token)
                }
            })
        })
    }

    async keepAlive(platform:ECommon_Platform_Type) {
        await Promise.allSettled([
            (async ()=>{
                let obj=REDIS_USER.token(platform,this.getId())
                let exist=await obj.exists()
                if(exist) {
                    await obj.setTTL(300)
                }
            })(),
            (async ()=>{
                let obj=REDIS_USER.info(this.getId())
                let exist=await obj.exists()
                if(exist) {
                    await obj.setTTL(300)
                }
            })(),
            (async ()=>{
                let obj=REDIS_USER.organizationInfo(platform,this.getId())
                let value=await obj.get()
                if(value) {
                    await obj.setTTL(300)
                    if(value.organizationUserId) {
                        let objStatus=REDIS_ORGANIZATION.status(value.organizationUserId)
                        let exist=await objStatus.exists()
                        if(exist) {
                            await objStatus.setTTL(300)
                        }
                        let objPreStatus=REDIS_ORGANIZATION.preStatus(value.organizationUserId)
                        exist=await objPreStatus.exists()
                        if(exist) {
                            await objPreStatus.setTTL(300)
                        }
                    }
                }
            })(),
            (async ()=>{
                let obj=REDIS_USER.userPlatformList(this.getId())
                let exist=await obj.exists()
                if(exist) {
                    await obj.setTTL(300)
                }
            })(),
        ])

    }

    async stopSession(platform:ECommon_Platform_Type) {
        if(!this.item || !this.item.id) {
            throw Err.User.userNotFound
        }
        let session=REDIS_USER.token(platform,this.item.id)
        await session.del()
        let sessionOrganization=REDIS_USER.organizationInfo(platform,this.item.id)
        let info=await sessionOrganization.get()
        if(info) {
            await sessionOrganization.del();
            let objOrganizationUser=await OrganizationUserService.getItemById(info.organizationUserId)
            if(objOrganizationUser) {
                await objOrganizationUser.clearStatus()
            }
        }
        let sessionPlatform=REDIS_USER.userPlatformList(this.item.id)
        let objPlatformList=await sessionPlatform.get()
        let index=objPlatformList.indexOf(platform)
        objPlatformList.splice(index,1)
        if(objPlatformList.length>0) {
            await sessionPlatform.set(objPlatformList)
        } else {
            await sessionPlatform.del()
        }
    }

    async active(active:number) {
        if(!this.item || !this.item.id) {
            throw Err.User.userNotFound
        }
        await userMapper.active(this.item.id,active);
        await this.loadItem();
    }

    static async list(page:number,size:number,keyword?:string):Promise<ICommon_Route_Res_User_List>{
        let ret=await userMapper.list(page,size,keyword)
        ret.data.forEach(item=>{
            delete item.password
        })
        return {
            count:ret.count,
            totalPage:ret.totalPage,
            page:page,
            data:ret.data
        }
    }


    async teamList(organizationUserId:string,organizationId:string,keyword?:string){
        let ret= await userMapper.teamList(this.item.id,organizationId,keyword)
        let roles=await rpcAuthApi.getRolesByMemberIds(ret.map(item=>{
            return {
                itemId:item.id,
                memberId:organizationUserId
            }
        }))
        let manage:ICommon_Model_Team[]=[],join:ICommon_Model_Team[]=[]
        for(let i=0;i<roles.length;i++) {
            if(roles[i].role.reserved===ECommon_Model_Role_Reserved.ADMIN) {
                manage.push(ret[i])
            } else {
                join.push(ret[i])
            }
        }
        return {
            manage,
            join
        };
    }

    async profile(organizationUserId:string,organizationId?:string){
        let ret={
            info:(await UserService.userInfos(this.getId(),true))[0],
            team:(await this.teamList(organizationUserId,organizationId))
        }
        return ret;
    }

    static async userInfos(userIds:string,isGetPhoto:boolean=true,organizationId?:string):Promise<({nickname?:string} & Omit<ICommon_Model_User,"password">)[]>{
        if(!userIds) {
            throw Err.User.userNotFound
        }
        let ret=await userMapper.users(userIds.split(","),organizationId)
        let arrPromise=[]
        for(let obj of ret) {
            delete obj.password;
            if(obj.photo && isGetPhoto) {
                arrPromise.push(rpcFileApi.getPath(obj.photo).then(o=>{
                    obj.photo=o;
                }))
            }
        }
        await Promise.all(arrPromise)
        return ret;
    }

    static async filter(name:string,size:number):Promise<{
        name:string,
        id:string,
        photo:string
    }[]>{
        if(!name) {
            throw Err.User.userNameNotExists
        }
        if(!size) {
            throw Err.Common.paramError
        }
        let ret=await userMapper.filter(name,size);
        let arr=<{
            name:string,
            id:string,
            photo:string
        }[]>[]
        for(let obj of ret) {
            arr.push({
                name:obj.username,
                id:obj.id,
                photo:obj.photo?(await rpcFileApi.getPath(obj.photo)):obj.photo
            })
        }
        return arr;
    }

    static async getDeletedUser() {
        let ret=await userMapper.getDeletedUser()
        return ret;
    }

    static async handleWechatCode(code:string) {
        let res=await request(`https://api.weixin.qq.com/sns/oauth2/access_token?appid=${Application.privateConfig.wechat.appId}&secret=${Application.privateConfig.wechat.appSecret}&code=${code}&grant_type=authorization_code`)
        if(res.statusCode==200) {
            let obj=JSON.parse(res.body)
            if(obj.openid && obj.access_token) {
                let res=await request(`https://api.weixin.qq.com/sns/userinfo?access_token=${obj.access_token}&openid=${obj.openid}`)
                if(res.statusCode==200) {
                    let obj1=JSON.parse(res.body)
                    let objKey=REDIS_USER.wechatOpenId(obj.openid)
                    await objKey.set({
                        img:obj1.headimgurl
                    })
                    return {
                        openId:obj.openid
                    }
                }
            }
        }
    }

}


export class UserSettingService extends Entity<typeof userSettingModel,typeof userSettingMapper> {
    constructor() {
        super(userSettingMapper)
    }
}