import { ECommon_Services } from '../../../common/types';
import IServer_Common_RPC_User, { IServer_Common_RPC_User_CheckSession } from "../../common/rpc/api/user";
import { DRPCSend } from "../../common/rpc/rpc";
class RpcUserApi implements IServer_Common_RPC_User {
    @DRPCSend(ECommon_Services.User)
    async checkSession(token:string):Promise<IServer_Common_RPC_User_CheckSession> {
        return null
    }
    @DRPCSend(ECommon_Services.User)
    async getUsersInfo(userIds: string[]): Promise<{ id: string; username: string; photo?: string; }[]> {
        return null;
    }
}
export default new RpcUserApi