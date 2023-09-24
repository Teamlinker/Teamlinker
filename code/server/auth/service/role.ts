import {ECommon_Model_Role_Type, ICommon_Model_Role, roleModel} from "../../../common/model/role";
import {Entity} from "../../common/entity/entity";
import {roleMapper} from "../mapper/role";
import {getAllPermissions, Permission_Base, Permission_Types} from "../../../common/permission/permission";
import {ICommon_Route_Res_Role_Item} from "../../../common/routes/response";
import {IServer_Common_Event_Types} from "../../common/event/types";
import {emitServiceEvent} from "../../common/event/event";

export class RoleService extends Entity<typeof roleModel,typeof roleMapper> {
    constructor(){
        super(roleMapper)
    }

    override async update(...param): Promise<typeof roleModel["model"]> {
        let ret=await super.update(...param);
        emitServiceEvent("roleChange",this.getId())
        return ret;
    }

    override async delete(eventPublish?: keyof IServer_Common_Event_Types, ...param): Promise<void> {
        await super.delete(eventPublish, ...param);
        emitServiceEvent("roleChange",this.getId())
    }

    static async clearRoleByItemId(itemId:string) {
        await roleMapper.clearRoleByItemId(itemId)
    }

    static async clearRoleByItemIds(itemIds:string[]) {
        await roleMapper.clearRoleByItemIds(itemIds)
    }

    static async getAdminRole(type:ECommon_Model_Role_Type) {
        let ret=await roleMapper.getAdminRole(type);
        return ret;
    }

    static async getRoleByValue(value:number):Promise<ICommon_Model_Role> {
        let ret=await roleMapper.getRoleByValue(value);
        return ret;
    }

    static async getUserRoles(itemId:string,type:ECommon_Model_Role_Type):Promise<ICommon_Route_Res_Role_Item[]> {
        let ret:ICommon_Route_Res_Role_Item[]=[];
        let arrRole=await roleMapper.getUserRoles(itemId,type);
        for(let obj of arrRole) {
            let value=Number(obj.value);
            let arrPermission:Permission_Base[]=[]
            let arr:Permission_Base[]
            let admin:Permission_Base
            if(obj.type===ECommon_Model_Role_Type.ORGANIZATION) {
                arr=getAllPermissions(Permission_Types.Organization);
                admin=Permission_Types.Organization.ADMIN
            } else if(obj.type===ECommon_Model_Role_Type.PROJECT) {
                arr=getAllPermissions(Permission_Types.Project);
                admin=Permission_Types.Project.ADMIN
            } else if(obj.type===ECommon_Model_Role_Type.TEAM) {
                arr=getAllPermissions(Permission_Types.Team);
                admin=Permission_Types.Team.ADMIN
            } else if(obj.type===ECommon_Model_Role_Type.WIKI) {
                arr=getAllPermissions(Permission_Types.Wiki);
                admin=Permission_Types.Wiki.ADMIN
            }
            for(let o of arr) {
                if((value & o.value) && value>=o.value) {
                    arrPermission.push({
                        name:o.name,
                        description:o.description,
                        value:o.value
                    })
                }
            }
            ret.push({
                ...obj,
                permissions:arrPermission
            })
        }
        return ret
    }

    async listPermission():Promise<Permission_Base[]> {
        let arr:Permission_Base[]
        let admin:Permission_Base;
        if(this.getItem().type===ECommon_Model_Role_Type.ORGANIZATION) {
            arr=getAllPermissions(Permission_Types.Organization);
            admin=Permission_Types.Organization.ADMIN;
        } else if(this.getItem().type===ECommon_Model_Role_Type.PROJECT) {
            arr=getAllPermissions(Permission_Types.Project);
            admin=Permission_Types.Project.ADMIN;
        } else if(this.getItem().type===ECommon_Model_Role_Type.TEAM) {
            arr=getAllPermissions(Permission_Types.Team);
            admin=Permission_Types.Team.ADMIN
        } else if(this.getItem().type===ECommon_Model_Role_Type.WIKI) {
            arr=getAllPermissions(Permission_Types.Wiki);
            admin=Permission_Types.Wiki.ADMIN
        }
        let value=Number(this.getItem().value)
        let ret:Permission_Base[]=[]
        for(let o of arr) {
            if(o.value==admin.value && value==o.value) {
                ret.push(admin)
                break;
            } else if((value & o.value) && value>=o.value) {
                ret.push({
                    name:o.name,
                    description:o.description,
                    value:o.value
                })
            }
        }
        return ret;
    }

    static async clearByOrganizationId(organizationId:string) {
        await roleMapper.clearByOrganizationId(organizationId)
    }

}