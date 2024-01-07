import * as jwt from "jsonwebtoken";
import {JwtPayload} from "jsonwebtoken";
import {REDIS_USER} from "../../common/cache/keys/user";
import {getConfigInstance} from '../../common/config/config';
import {AdminService} from "../service/admin";
import {TeamService} from "../service/team";
import {UserService} from "../service/user";
import {MemberTagService, OrganizationService, OrganizationUserService} from './../service/organization';
import rpcFileApi from "../../file/rpc/file";
import {IServer_Common_RPC_User_CheckSession} from "../types/config";
import {Err} from "../../../common/status/error";
import {ECommon_Platform_Type, ECommon_User_Online_Status} from "../../../common/types";
import CommonUtil from "../../common/util/common";
import {REDIS_ORGANIZATION} from "../../common/cache/keys/organization";
import {ECommon_User_Type} from "../../../common/model/user";


class RpcUserApi {
    
    async checkSession(token:string):Promise<IServer_Common_RPC_User_CheckSession> {
        if(!token) {
            return null;
        }
        let secret=getConfigInstance().jwt;
        return new Promise(function(resolve){
            jwt.verify(token,secret,async function(err,decoded) {
                if(err) {
                    resolve(null);
                } else {
                    let session=REDIS_USER.token((decoded as JwtPayload).platform,(decoded as JwtPayload).userId)
                    let tokenFromCache = await session.get()
                    if(token==tokenFromCache) {
                        await session.setTTL(300);
                        resolve({
                            userId:(decoded as JwtPayload).userId,
                            type:(decoded as JwtPayload).type,
                            platform:(decoded as JwtPayload).platform
                        })
                    } else {
                        resolve(null);
                    }

                }
            })
        })
    }

    async getUsersInfo?(userIds:string[],organizationId?:string):Promise<{
        id:string,
        username:string,
        photo?:string,
        nickname:string
    }[]> {
        let arrUser:any[]=[...userIds];
        let arr=await UserService.userInfos(userIds.join(","),false,organizationId);
        let ret=arr.map(item=>{
            return {
                id:item.id,
                username:item.username,
                photo:item.photo,
                nickname:item.nickname
            }
        })
        let arrRetId=ret.map(item=>{
            return item.id
        })
        for(let i=0;i<arrUser.length;i++) {
            if(arrUser[i] && arrRetId.includes(arrUser[i])) {
                let obj=ret[arrRetId.indexOf(arrUser[i])]
                arrUser[i]=obj
            } else {
                arrUser[i]=null
            }
        }
        let arrImage=await rpcFileApi.getPaths(arrUser.map(item=>{return item?item.photo:null}))
        arrUser.forEach((item,index)=>{
            item.photo=arrImage[index]
        })
        return arrUser;
    }

    async organizationUser(organizationUserId:string) {
        let obj=await OrganizationUserService.getItemById(organizationUserId)
        if(!obj) {
            throw Err.Organization.userNotFound
        }
        return obj.getItem()
    }
    
    async getOrganizationUsersInfo?(organizationUserIds:string[]):Promise<{
        id:string,
        username:string,
        photo?:string,
        nickname?:string,
        organizationUserId?:string
    }[]> {
        if(organizationUserIds.length==0) {
            return []
        }
        let arrUser:any[]=[...organizationUserIds];
        let arr=await OrganizationUserService.organizationUserInfos(organizationUserIds.join(","),false);
        let ret=arr.map(item=>{
            return {
                id:item.id,
                username:item.username,
                photo:item.photo,
                nickname:item.nickname,
                organizationUserId:item.organizationUserId
            }
        })
        let arrRetId=arr.map(item=>{
            return item.organizationUserId
        })
        for(let i=0;i<arrUser.length;i++) {
            if(arrUser[i] && arrRetId.includes(arrUser[i])) {
                let obj=ret[arrRetId.indexOf(arrUser[i])]
                arrUser[i]=obj
            } else {
                arrUser[i]=null
            }
        }
        let arrImage=await rpcFileApi.getPaths(arrUser.map(item=>{return item?item.photo:null}))
        for(let i=0;i<arrUser.length;i++) {
            if(arrUser[i]==null) {
                arrUser[i]={}
            }
        }
        arrUser.forEach((item,index)=>{
            item.photo=arrImage[index]
        })
        return arrUser;
    }

    
    async initAdmin():Promise<string[]> {
        let obj1=new AdminService
        obj1.assignItem({
            username:"teamlinker",
            password:CommonUtil.md5("teamlinker")
        })
        await obj1.create()
        return [obj1.getId()]
    }

    async initDeletedUser():Promise<string> {
        let obj=new UserService()
        obj.assignItem({
            username:"deleted",
            password:"1",
            active:0,
            role:ECommon_User_Type.DELETED
        })
        let ret=await obj.create()
        return ret.id
    }
    
    async initUser():Promise<string[]> {
        let obj1=new UserService
        obj1.assignItem({
            username:"user",
            password:CommonUtil.md5("user")
        })
        await obj1.create()
        return [obj1.getId()]
    }

    
    async initOrganization(adminIds: string[], userIds: string[],deletedUserId:string): Promise<string> {
        let ret=await OrganizationService.init(adminIds,userIds,deletedUserId)
        return ret;
    }

    
    async initTeam(organizationUserId: string, organizationId: string) {
        let team=new TeamService;
        team.assignItem({
            name:"test_group",
            created_by:organizationUserId,
            organization_id:organizationId
        })
        await team.create()
    }

    async checkOrganizationInfo(platform:ECommon_Platform_Type,userId:string) {
        let objRedis=REDIS_USER.organizationInfo(platform,userId);
        let exists=await objRedis.exists();
        if(!exists) {
            return null
        }
        let value=await objRedis.get();
        return value
    }

    async getOrganizationUserId(organizationId:string,userId:string) {
        let ret=await OrganizationUserService.getItemByExp({
            organization_id:organizationId,
            user_id:userId
        })
        return ret?.getId()
    }

    async getOrganizationUserName(organizationUserId:string) {
        let ret=await OrganizationUserService.getItemById(organizationUserId)
        return ret?.getItem()?.nickname
    }

    async getUser(userId:string) {
        let ret=await UserService.getItemById(userId)
        if(!ret) {
            throw Err.User.userNotFound
        }
        return ret.getItem()
    }

    async getTeamList(organizationUserId:string) {
        let objOrganizationUser=await OrganizationUserService.getItemById(organizationUserId)
        if(!objOrganizationUser) {
            throw Err.Organization.userNotFound
        }
        let objUser=await UserService.getItemById(objOrganizationUser.getItem().user_id)
        if(!objUser) {
            throw Err.User.userNotFound
        }
        let redis=REDIS_ORGANIZATION.teamList(organizationUserId)
        let exist=await redis.exists()
        if(exist) {
            let obj=await redis.get()
            await redis.setTTL(10)
            return obj
        } else {
            let ret=await objUser.teamList(objOrganizationUser.getId(),objOrganizationUser.getItem().organization_id)
            await redis.set(ret,10)
            return ret;
        }
    }

    async listTeamUser(teamId:string) {
        let objTeam=await TeamService.getItemById(teamId)
        if(objTeam) {
            let ret=await objTeam.listUser(0,Number.MAX_SAFE_INTEGER)
            return ret.data.map(item=>item.organizationUser);
        } else {
            return []
        }
    }

    async listTagUser(tagId:string) {
        let objTag=await MemberTagService.getItemById(tagId)
        if(!objTag) {
            throw Err.Organization.memberTagNotFound
        }
        let ret=await objTag.listTagMember()
        return ret;
    }

    async keepAlive(token:string) {
        let check=await this.checkSession(token)
        if(!check) {
            throw Err.User.notAuth
        }
        let objUser=await UserService.getItemById(check.userId)
        if(!objUser) {
            throw Err.User.userNotFound
        }
        await objUser.keepAlive(check.platform)
    }

    async changeOnlineStatus(organizationUserId:string,status:ECommon_User_Online_Status) {
        let objOrganizationUser=await OrganizationUserService.getItemById(organizationUserId)
        if(!objOrganizationUser) {
            throw Err.Organization.userNotFound
        }
        let preStatus=await objOrganizationUser.changeOnlineStatus(status)
        return preStatus
    }

    async endMeetingStatus(organizationUserId:string) {
        let objOrganizationUser=await OrganizationUserService.getItemById(organizationUserId)
        if(!objOrganizationUser) {
            throw Err.Organization.userNotFound
        }
        await objOrganizationUser.endMeetingStatus()
    }

    async startMeetingStatus(organizationUserId:string,meetingId:string) {
        let objOrganizationUser=await OrganizationUserService.getItemById(organizationUserId)
        if(!objOrganizationUser) {
            throw Err.Organization.userNotFound
        }
        await objOrganizationUser.startMeetingStatus(meetingId)
    }

    async getMeetingId(organizationUserId:string) {
        let objOrganizationUser=await OrganizationUserService.getItemById(organizationUserId)
        if(!objOrganizationUser) {
            throw Err.Organization.userNotFound
        }
        let ret=await objOrganizationUser.getMeetingId()
        return ret;
    }

    async organization(organizationId:string) {
        let obj=await OrganizationService.getItemById(organizationId)
        if(!obj) {
            throw Err.Organization.organizationNotFound
        }
        return obj.getItem()
    }

    async team(teamId:string) {
        let obj=await TeamService.getItemById(teamId)
        if(!obj) {
            throw Err.Team.teamNotFound
        }
        return obj.getItem()
    }

    async getTeamAllMember(teamId:string) {
        let obj=await TeamService.getItemById(teamId)
        if(!obj) {
            throw Err.Team.teamNotFound
        }
        let ret=await obj.members(0,10000)
        return ret;
    }

    async getDeletedOrganizationUser(organizationId:string) {
        let objUser=await UserService.getDeletedUser()
        let objOrganizationUser=await OrganizationUserService.getItemByExp({
            organization_id:organizationId,
            user_id:objUser.id
        })
        return objOrganizationUser.getItem()
    }

    async getDeletedUser() {
        let objUser=await UserService.getDeletedUser()
        return objUser
    }
}
export default new RpcUserApi;