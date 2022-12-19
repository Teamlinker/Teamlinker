import {REDIS_AUTH} from '../../common/cache/keys/auth';
import {DComponent} from "../../common/decorate/component";
import {PermissionBase} from "./base";
import userRpcApi from "../../user/rpc/user"

@DComponent
export class PermissionOrganization extends PermissionBase {
    async translateToField({userId}: { [param: string]: any; userId?: string; isAdmin?: boolean; }): Promise<string>
    {
        let ret=await userRpcApi.checkOrganizationInfo(userId);
        return ret.organizationId;
    }
    fieldName: string="organizationId"
    async generatorValue({userId,organizationId}: { [param: string]: any; userId?: string; isAdmin?: boolean; }): Promise<number> {
        let ret:number;
        let objTeamUsers=new REDIS_AUTH.Permission.Organization.Users(organizationId);
        await this.tryLock([objTeamUsers.getKey().replace(/\:/g,"")]);
        let roleId=await objTeamUsers.getValue(userId);
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
}
