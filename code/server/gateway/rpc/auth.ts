import { ECommon_Organization_User_Role } from '../../../common/model/organization_user';
import { Permission_Base } from '../../../common/permission/permission';
import { ECommon_Services } from '../../../common/types';
import { DRPCSend } from '../../common/rpc/rpc';
import { IServer_Common_RPC_Auth } from './../../common/rpc/api/auth';
class RpcAuthApi implements IServer_Common_RPC_Auth {
    @DRPCSend(ECommon_Services.AUTH)
    async initPermission(): Promise<{ [param: number]: string; }> {
        return null;
    }

    @DRPCSend(ECommon_Services.AUTH)
    async initRole(objPermission: { [param: number]: string; }): Promise<{ projectRoleUserId: string; groupRoleUserId: string; }> {
        return null;
    }
    @DRPCSend(ECommon_Services.AUTH)
    async getOrganizationPermission(organizationId: string, userId: string): Promise<ECommon_Organization_User_Role> {
        return null;
    }

    @DRPCSend(ECommon_Services.AUTH)
    async processPermission(permissions: Permission_Base[], obj: any): Promise<[boolean, any]> {
        return null;
    }

    @DRPCSend(ECommon_Services.AUTH)
    async deletePermission(permissionDelete: any) {
        return null;
    }
}
export default new RpcAuthApi;