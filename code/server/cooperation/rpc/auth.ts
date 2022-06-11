import { ECommon_Model_Project_Member_Type } from '../../../common/model/project_member';
import { ECommon_Model_Role_Type } from '../../../common/model/role';
import { ECommon_Model_Role_Memeber_Type } from '../../../common/model/role_member';
import { ECommon_Services } from "../../../common/types";
import { DRPCSend } from "../../common/rpc/rpc";
import { IServer_Common_RPC_Auth } from './../../common/rpc/api/auth';
class RpcAuthApi implements IServer_Common_RPC_Auth {
    @DRPCSend(ECommon_Services.AUTH)
    async changeRole(itemId: string, memberId: string, roleId: string) {
        return null
    }

    @DRPCSend(ECommon_Services.AUTH)
    async addRole(itemId: string, memberId: string, roleId: string,itemType:ECommon_Model_Role_Memeber_Type,memberType:ECommon_Model_Project_Member_Type) {
        return null
    }

    @DRPCSend(ECommon_Services.AUTH)
    async removeRole(itemId: string, memberId: string) {
        return null
    }

    @DRPCSend(ECommon_Services.AUTH)
    async getRolesByMemberIds(items: { itemId: string; memberId: string; }[]): Promise<{ id: string; name: string; description: string; }[]> {
        return null
    }

    @DRPCSend(ECommon_Services.AUTH)
    async getRolesByItemId(itemId: string, type: ECommon_Model_Role_Type): Promise<{ id: string; name: string; description: string; }[]> {
        return null;
    }

    @DRPCSend(ECommon_Services.AUTH)
    async clearRoleByItemId(itemId: string) {
        return null;
    }

    @DRPCSend(ECommon_Services.AUTH)
    async clearRoleByItemIds(itemIds:string[]) {
        return null;
    }
    
    @DRPCSend(ECommon_Services.AUTH)
    async getAdminRoleByType(type: ECommon_Model_Role_Type): Promise<string> {
        return null;
    }
}
export default new RpcAuthApi;