
import IServer_Common_RPC_User, { IServer_Common_RPC_User_CheckSession } from "../../common/rpc/api/user";
import {DRPCRecieve} from "../../common/rpc/rpc"
import * as jwt from "jsonwebtoken"
import { getNacosInstance } from "../../common/nacos/nacos";
import { REDIS_USER } from "../../common/cache/keys/user";
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
}
export default new RpcUserApi;