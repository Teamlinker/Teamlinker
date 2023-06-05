import {DComponent} from '../../common/decorate/component';
import {PermissionBase} from "./base";
import {REDIS_AUTH} from "../../common/cache/keys/auth";
import {ECommon_Model_Role_Type} from "../../../common/model/role";

@DComponent
export class PermissionTeam extends PermissionBase {
    async translateToField({roleId}: { [param: string]: any; userId?: string; isAdmin?: boolean;roleId:string }): Promise<string> {
        if(roleId) {
            let objRole=new REDIS_AUTH.Permission.Role.RoleInfo(roleId);
            let value=await objRole.getValue()
            if(value?.type===ECommon_Model_Role_Type.TEAM) {
                return value.item_id
            }
        }
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

