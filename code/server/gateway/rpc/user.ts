import { EServer_Common_Config_Services } from './../../common/types/config';
import IServer_Common_RPC_User, { IAAA } from "../../common/rpc/api/user";
import {RPCSend} from "../../common/rpc/rpc"
export default class RpcUserApi implements IServer_Common_RPC_User {
    @RPCSend(EServer_Common_Config_Services.User)
    async a(obj:IAAA):Promise<IAAA> {
        return {
            name:"sd",
            age:33
        }
    }
}