import * as jwt from "jsonwebtoken";
import {JwtPayload} from "jsonwebtoken";
import {REDIS_USER} from "../../common/cache/keys/user";
import {getConfigInstance} from '../../common/config/config';
import {AdminService} from "../service/admin";
import {TeamService} from "../service/team";
import {UserService} from "../service/user";
import {OrganizationService, OrganizationUserService} from './../service/organization';
import rpcFileApi from "../../file/rpc/file";
import {IServer_Common_RPC_User_CheckSession} from "../types/config";

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
                    let session=REDIS_USER.token((decoded as JwtPayload).userId)
                    let tokenFromCache = await session.get()
                    if(token==tokenFromCache) {
                        await session.setTTL(3600);
                        resolve({
                            userId:(decoded as JwtPayload).userId,
                            type:(decoded as JwtPayload).type
                        })
                    } else {
                        resolve(null);
                    }

                }
            })
        })
    }

    async getUsersInfo?(userIds:string[]):Promise<{
        id:string,
        username:string,
        photo?:string,
    }[]> {
        let arrUser:any[]=[...userIds];
        let arr=await UserService.userInfos(userIds.join(","),false);
        let ret=arr.map(item=>{
            return {
                id:item.id,
                username:item.username,
                photo:item.photo,
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
    
    async getOrganizationUsersInfo?(organizationUserIds:string[]):Promise<{
        id:string,
        username:string,
        photo?:string,
        nickname?:string,
    }[]> {
        let arrUser:any[]=[...organizationUserIds];
        let arr=await OrganizationUserService.organizationUserInfos(organizationUserIds.join(","),false);
        let ret=arr.map(item=>{
            return {
                id:item.id,
                username:item.username,
                photo:item.photo,
                nickname:item.nickname,
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
        arrUser.forEach((item,index)=>{
            item.photo=arrImage[index]
        })
        return arrUser;
    }

    
    async initAdmin():Promise<string[]> {
        let obj1=new AdminService
        obj1.assignItem({
            username:"teamlinker",
            password:"teamlinker"
        })
        await obj1.create()
        let obj2=new AdminService
        obj2.assignItem({
            username:"wgq_admin",
            password:"123456"
        })
        await obj2.create()
        let obj3=new AdminService
        obj3.assignItem({
            username:"hxx_admin",
            password:"123456"
        })
        await obj3.create()
        return [obj1.getId(),obj2.getId(),obj3.getId()]
    }

    
    async initUser():Promise<string[]> {
        let obj1=new UserService
        obj1.assignItem({
            username:"sx",
            password:"sx"
        })
        await obj1.create()
        let obj2=new UserService
        obj2.assignItem({
            username:"wgq",
            password:"wgq"
        })
        await obj2.create()
        let obj3=new UserService
        obj3.assignItem({
            username:"hxx",
            password:"hxx"
        })
        await obj3.create()
        return [obj1.getId(),obj2.getId(),obj3.getId()]
    }

    
    async initOrganization(adminIds: string[], userIds: string[]): Promise<string> {
        let ret=await OrganizationService.init(adminIds,userIds)
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

    async checkOrganizationInfo(userId:string) {
        let objRedis=REDIS_USER.organizationInfo(userId);
        let exists=await objRedis.exists();
        if(!exists) {
            return null
        }
        let value=await  objRedis.get();
        return value
    }

    async getOrganizationUserId(organizationId:string,userId:string) {
        let ret=await OrganizationUserService.getItemByExp({
            organization_id:organizationId,
            user_id:userId
        })
        return ret?.getId()
    }
}
export default new RpcUserApi;