
import * as jwt from "jsonwebtoken";
import { REDIS_USER } from "../../common/cache/keys/user";
import { getNacosInstance } from "../../common/nacos/nacos";
import IServer_Common_RPC_User, { IServer_Common_RPC_User_CheckSession } from "../../common/rpc/api/user";
import { DRPCRecieve } from "../../common/rpc/rpc";
import UserService from "../service/user";
import rpcFileApi from "./file";
class RpcUserApi implements IServer_Common_RPC_User {
    @DRPCRecieve
    async checkSession(token:string):Promise<IServer_Common_RPC_User_CheckSession> {
        if(!token) {
            return null;
        }
        let secret=getNacosInstance().globalConfig.jwt;
        return new Promise(function(resolve){
            jwt.verify(token,secret,async function(err,decoded) {
                if(err) {
                    resolve(null);
                } else {
                    let session=REDIS_USER.token(decoded.userId)
                    let tokenFromCache = await session.get()
                    if(token==tokenFromCache) {
                        await session.setTTL(3600);
                        resolve({
                            userId:decoded.userId,
                            type:decoded.type
                        })
                    } else {
                        resolve(null);
                    }
                    
                }
            })
        })
    }
    @DRPCRecieve
    async getUsersInfo?(userIds:string[]):Promise<{
        id:string,
        username:string,
        photo?:string
    }[]> {
        let arrUser:any[]=[...userIds];
        let arr=await UserService.userInfos(userIds.join(","),false);
        let ret=arr.map(item=>{
            return {
                id:item.id,
                username:item.username,
                photo:item.photo
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
}
export default new RpcUserApi;