import {DComponent} from '../../common/decorate/component';
import {PermissionBase} from "./base";
import {REDIS_AUTH} from "../../common/cache/keys/auth";

@DComponent
export class PermissionTeam extends PermissionBase {
    translateToField(param: { [param: string]: any; userId?: string; isAdmin?: boolean; }): Promise<string> {
        throw new Error("Method not implemented.");
    }
    fieldName: string="teamId"
    async generatorValue({organizationUserId,teamId}: { [param: string]: any; organizationUserId?: string; isAdmin?: boolean;teamId:string }): Promise<number> {
        let ret:number
        let objTeamUsers=new REDIS_AUTH.Permission.Team.OrganizationUsers(teamId);
        await this.tryLock([objTeamUsers.getKey().replace(/\:/g,"")]);
        let roleId=await objTeamUsers.getValue(organizationUserId);
        if(roleId) {
            let objRole=new REDIS_AUTH.Permission.Role.RoleInfo(roleId)
            let value=await objRole.getValue();
            if(value) {
                ret=Number(value.value)
            }
        }
        await this.unlock()
        return ret
    }
}

