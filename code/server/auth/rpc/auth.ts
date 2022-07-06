import { ECommon_Organization_User_Role } from "../../../common/model/organization_user";
import { ECommon_Model_Project_Member_Type } from "../../../common/model/project_member";
import { ECommon_Model_Role_Memeber_Type } from "../../../common/model/role_member";
import { Permission_Base, Permission_Types } from "../../../common/permission/permission";
import { Err } from "../../../common/status/error";
import { IServer_Common_RPC_Auth } from '../../common/rpc/api/auth';
import { DRPCRecieve } from "../../common/rpc/rpc";
import { deletePermission, processPermission } from "../permission/base";
import { getOrganizationPermission } from "../permission/organization";
import { RoleDefault } from "../role/role";
import { PermisssionService } from "../service/permission";
import { RoleService } from "../service/role";
import { RoleMemeberService } from "../service/role_member";
import { RolePermissionService } from '../service/role_permission';
import { ECommon_Model_Role_Type } from './../../../common/model/role';
class RpcAuthApi implements IServer_Common_RPC_Auth {
    @DRPCRecieve
    async initPermission(): Promise<{ [param: number]: string; }> {
        let objPermission = <{
            [param: number]: string
        }>{}
        for (let key in Permission_Types) {
            let value = Permission_Types[key]
            let type = key
            let keys = Object.keys(value)
            for (let key of keys) {
                let val = value[key]
                if (val instanceof Permission_Base) {
                    let name = val.toString()
                    let value = val.value
                    let obj = new PermisssionService
                    obj.assignItem({
                        name,
                        type,
                        value
                    })
                    await obj.create();
                    objPermission[value] = obj.getId()
                }
            }
        }
        return objPermission
    }

    @DRPCRecieve
    async initRole(objPermission:{
        [param:number]:string
    }): Promise<{ projectRoleUserId: string; groupRoleUserId: string; }> {
        let objProjectRole = RoleDefault.Project_Role, projectRoleUserId;
        for (let key in objProjectRole) {
            let obj = objProjectRole[key]
            let name = obj.name
            let description = obj.description
            let objProjectRoleService=new RoleService
            objProjectRoleService.assignItem({
                name,
                description,
                type:ECommon_Model_Role_Type.PROJECT
            })
            await objProjectRoleService.create();
            if (obj.name == "user") {
                projectRoleUserId = objProjectRoleService.getId();
            }
            for (let o of obj.permission) {
                let objRolePermission=new RolePermissionService
                objRolePermission.assignItem({
                    role_id:objProjectRoleService.getId(),
                    permission_id:objPermission[o.value]
                })
                await objRolePermission.create()
            }
        }
        let objGroupRole = RoleDefault.Team_Role, groupRoleUserId;
        for (let key in objGroupRole) {
            let obj = objGroupRole[key]
            let name = obj.name
            let description = obj.description
            let objTeamRole=new RoleService
            objTeamRole.assignItem({
                name,
                description,
                type:ECommon_Model_Role_Type.TEAM
            })
            await objTeamRole.create()
            if (obj.name == "user") {
                groupRoleUserId = objTeamRole.getId()
            }
            for (let o of obj.permission) {
                let obj=new RolePermissionService
                obj.assignItem({
                    role_id:objTeamRole.getId(),
                    permission_id:objPermission[o.value]
                })
                await obj.create();
            }
        }
        return {
            projectRoleUserId,
            groupRoleUserId
        }
    }

    @DRPCRecieve
    async getOrganizationPermission(organizationId: string, userId: string): Promise<ECommon_Organization_User_Role> {
        let ret=await getOrganizationPermission(organizationId,userId);
        return ret;
    }

    @DRPCRecieve
    async processPermission(permissions: Permission_Base[], obj: any): Promise<[boolean, any]> {
        let [isCheck,map]=await processPermission(permissions,obj);
        return [isCheck,map]
    }

    @DRPCRecieve
    async deletePermission(permissionDelete: any) {
        deletePermission(permissionDelete)
    }

    @DRPCRecieve
    async changeRole(itemId: string, memberId: string, roleId: string) {
        let obj = await RoleMemeberService.getItemByExp({
            member_id:memberId,
            item_id:itemId            
        })
        if(!obj) {
            throw Err.Auth.roleNotFound
        }
        obj.assignItem({
            role_id:roleId
        })
        await obj.update();
    }

    @DRPCRecieve
    async addRole(itemId: string, memberId: string, roleId: string,itemType:ECommon_Model_Role_Memeber_Type,memberType:ECommon_Model_Project_Member_Type) {
        let obj = await RoleMemeberService.getItemByExp({
            member_id:memberId,
            item_id:itemId            
        })
        if(obj) {
            throw Err.Auth.roleAlreadyExists
        }
        obj= new RoleMemeberService
        obj.assignItem({
            member_id:memberId,
            item_id:itemId,
            role_id:roleId,
            member_type:memberType,
            item_type:itemType
        })
        await obj.create();
    }

    @DRPCRecieve
    async removeRole(itemId: string, memberId: string) {
        let obj = await RoleMemeberService.getItemByExp({
            member_id:memberId,
            item_id:itemId            
        })
        if(obj) {
            await obj.delete();
        }
    }

    @DRPCRecieve
    async getRolesByMemberIds(items: { itemId: string; memberId: string; }[]): Promise<{ id: string; name: string; description: string; }[]> {
        let ret=await RoleMemeberService.getRolesByMemberIds(items);
        return ret;
    }

    @DRPCRecieve
    async getRolesByItemId(itemId: string,type:ECommon_Model_Role_Type): Promise<{ id: string; name: string; description: string; }[]> {
        let ret=await RoleService.getRolesByItemId(itemId,type);
        return ret;
    }

    @DRPCRecieve 
    async clearRoleByItemId(itemId: string) {
        await RoleService.clearRoleByItemId(itemId)
    }

    @DRPCRecieve 
    async clearRoleByItemIds(itemIds:string[]) {
        await RoleService.clearRoleByItemIds(itemIds)
    }

    @DRPCRecieve 
    async getAdminRoleByType(type: ECommon_Model_Role_Type): Promise<string> {
        let ret=await RoleService.getItemByExp({
            type:type,
            name:"admin",
            item_id:null,
            organization_id:null
        })
        if(!ret) {
            throw Err.Auth.roleNotFound
        }
        return ret.getId();
    }
}
export default new RpcAuthApi;