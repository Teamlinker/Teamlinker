
import IServer_Common_RPC_User, { IAAA } from "../../common/rpc/api/user";
import {RPCRecieve} from "../../common/rpc/rpc"
export default class RpcUserApi implements IServer_Common_RPC_User {
    @RPCRecieve
    async a(obj:IAAA):Promise<IAAA> {
        return {
            name:obj.name+"xxx",
            age:obj.age+100
        }
    }
}