import {REDIS_AUTH} from '../../common/cache/keys/auth';
import {DComponent} from "../../common/decorate/component";
import {PermissionBase} from "./base";
import userRpcApi from "../../user/rpc/user"
import {ECommon_Platform_Type} from "../../../common/types";

@DComponent
export class PermissionOrganization extends PermissionBase {
    async translateToField({userId,platform}: { [param: string]: any; userId?: string; isAdmin?: boolean;platform:ECommon_Platform_Type }): Promise<string>
    {
        let ret=await userRpcApi.checkOrganizationInfo(platform,userId);
        return ret?.organizationId;
    }
    fieldName: string="organizationId"
    async generatorValue({organizationUserId,organizationId}: { [param: string]: any; organizationUserId?: string; isAdmin?: boolean; }): Promise<number> {
        let ret:number;
        let objOrganizationUsers=new REDIS_AUTH.Permission.Organization.OrganizationUsers(organizationId);
        await this.tryLock([objOrganizationUsers.getKey().replace(/\:/g,"")]);
        let roleId=await objOrganizationUsers.getValue(organizationUserId);
        if(roleId) {
            let objRole=new REDIS_AUTH.Permission.Role.RoleInfo(roleId)
            let value=await objRole.getValue()
            if(value) {
                ret=Number(value.value)
            }
        }
        await this.unlock()
        return ret
    }

    override async checkOrganizationId(businessId: string, currentOrganizationId: string): Promise<boolean> {
        return businessId===currentOrganizationId
    }
}
