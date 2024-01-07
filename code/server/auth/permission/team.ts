import {DComponent} from '../../common/decorate/component';
import {PermissionBase} from "./base";
import {REDIS_AUTH} from "../../common/cache/keys/auth";
import {ECommon_Model_Role_Type} from "../../../common/model/role";
import rpcTeamApi from "../../user/rpc/user";

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

    override async checkOrganizationId(teamId: string, currentOrganizationId: string): Promise<boolean> {
        let objRedis=REDIS_AUTH.Resource.resourceOrganization(teamId)
        let organizationId=await objRedis.get()
        if(!organizationId) {
            let obj=await rpcTeamApi.team(teamId)
            if(obj) {
                organizationId=obj.organization_id
                await objRedis.set(organizationId)
            }
        }
        return organizationId===currentOrganizationId
    }
}

