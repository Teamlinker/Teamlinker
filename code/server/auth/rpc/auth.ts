import {ECommon_Model_Organization_Member_Type} from "../../../common/model/organization";
import {Permission_Base} from "../../../common/permission/permission";
import {Err} from "../../../common/status/error";
import {processPermission} from "../permission/base";
import {RoleDefault} from "../role/role";
import {RoleService} from "../service/role";
import {RoleMemberService} from "../service/role_member";
import {ECommon_Model_Role_Reserved, ECommon_Model_Role_Type, ICommon_Model_Role} from './../../../common/model/role';
import "../event/permission"
import {ICommon_Model_Role_Member} from "../../../common/model/role_member";
import {ICommon_Route_Res_Role_Item, ICommon_Route_Res_Role_List} from "../../../common/routes/response";
import {ICommon_Model_Organization_User} from "../../../common/model/organization_user";
import {ICommon_Model_User} from "../../../common/model/user";
import {ICommon_Model_Team} from "../../../common/model/team";
import {ICommon_Model_Member_Tag} from "../../../common/model/member_tag";
import {roleMapper} from "../mapper/role";
import {REDIS_AUTH} from "../../common/cache/keys/auth";
import {getComponent} from "../../common/decorate/component";

class RpcAuthApi {
    async initRole(): Promise<{ projectRoleUserId: string; groupRoleUserId: string; }> {
        let objPermission = <{
            [param: number]: string
        }>{}
        let objProjectRole = RoleDefault.Project_Role, projectRoleUserId;
        let arr=[];
        for (let key in objProjectRole) {
            let obj = objProjectRole[key]
            let objProjectRoleService=new RoleService
            objProjectRoleService.assignItem(obj)
            arr.push((async ()=>{
                let ret=await objProjectRoleService.create();
                if(obj.reserved==ECommon_Model_Role_Reserved.NORMAL) {
                    projectRoleUserId=ret.id
                }
            })())

        }
        let objGroupRole = RoleDefault.Team_Role, groupRoleUserId;
        for (let key in objGroupRole) {
            let obj = objGroupRole[key]
            let objTeamRole=new RoleService
            objTeamRole.assignItem(obj)
            arr.push((async ()=>{
                let ret=await objTeamRole.create()
                if(obj.reserved==ECommon_Model_Role_Reserved.NORMAL) {
                    groupRoleUserId=ret.id
                }
            })())

        }
        let objOrganizationRole = RoleDefault.Organization_Role;
        for (let key in objOrganizationRole) {
            let obj = objOrganizationRole[key]
            let objOrganization=new RoleService
            objOrganization.assignItem(obj)
            arr.push(objOrganization.create())
        }
        let objWikiRole = RoleDefault.Wiki_Role;
        for (let key in objWikiRole) {
            let obj = objWikiRole[key]
            let objWiki=new RoleService
            objWiki.assignItem(obj)
            arr.push(objWiki.create())
        }
        await Promise.all(arr);
        return {
            projectRoleUserId,
            groupRoleUserId
        }
    }

    
    async processPermission(permissionOr:boolean,permissions: Permission_Base[], obj: any): Promise<boolean> {
        let isCheck=await processPermission(permissionOr,permissions,obj);
        return isCheck
    }

    
    async changeRoleMember(itemId: string,  roleId: string,memberType:ECommon_Model_Organization_Member_Type,memberId?: string):Promise<ICommon_Model_Role> {
        let objRole=await RoleService.getItemById(roleId);
        if(!objRole) {
            throw Err.Role.roleNotFound
        }
        if(memberType===ECommon_Model_Organization_Member_Type.DEFAULT) {
            let obj = await RoleMemberService.getItemByExp({
                member_type:ECommon_Model_Organization_Member_Type.DEFAULT,
                item_id:itemId
            })
            if(!obj) {
                throw Err.Auth.roleNotFound
            }
            obj.assignItem({
                role_id:roleId
            })
            await obj.update();
        } else {
            let obj = await RoleMemberService.getItemByExp({
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
        return objRole.getItem()
    }

    
    async addRoleMember(itemId: string, roleId: string, memberType:ECommon_Model_Organization_Member_Type,  memberId?: string):Promise<ICommon_Model_Role> {
        let objRole=await RoleService.getItemById(roleId);
        if(!objRole) {
            throw Err.Role.roleNotFound
        }
        if(memberType==ECommon_Model_Organization_Member_Type.DEFAULT) {
            let obj=await RoleMemberService.getItemByExp({
                item_id:itemId,
                member_type:ECommon_Model_Organization_Member_Type.DEFAULT
            })
            if(obj) {
                throw Err.Auth.roleAlreadyExists
            }
            obj=new RoleMemberService();
            obj.assignItem({
                item_id:itemId,
                role_id:roleId,
                member_type:memberType
            })
            await obj.create();
        } else  {
            if(!memberId) {
                throw Err.Role.roleMemberEmpty
            }
            let obj = await RoleMemberService.getItemByExp({
                member_id:memberId,
                item_id:itemId
            })
            if(obj) {
                throw Err.Auth.roleAlreadyExists
            }
            obj= new RoleMemberService
            obj.assignItem({
                member_id:memberId,
                item_id:itemId,
                role_id:roleId,
                member_type:memberType
            })
            await obj.create();
        }
        return objRole.getItem();
    }

    async clearMember(memberId:string) {
        await RoleMemberService.clearMember(memberId)
    }
    
    async removeRoleMember(itemId: string, memberType:ECommon_Model_Organization_Member_Type,memberId?: string) {
        if(memberType===ECommon_Model_Organization_Member_Type.DEFAULT) {
            let obj = await RoleMemberService.getItemByExp({
                member_type:ECommon_Model_Organization_Member_Type.DEFAULT,
                item_id:itemId
            })
            if(obj) {
                await obj.delete();
            }
        } else {
            let obj = await RoleMemberService.getItemByExp({
                member_id:memberId,
                item_id:itemId
            })
            if(obj) {
                await obj.delete();
            }
        }

    }

    async getPermissionByMemberId(itemId:string,memberId:string,roleType:ECommon_Model_Role_Type):Promise<number> {
        if(roleType===ECommon_Model_Role_Type.TEAM || roleType===ECommon_Model_Role_Type.ORGANIZATION) {
            let arr=await this.getRolesByMemberIds([{
                itemId:itemId,
                memberId:memberId
            }])
            return arr[0]?.role?.value
        } else if(roleType===ECommon_Model_Role_Type.PROJECT) {
            let obj=REDIS_AUTH.Permission.Project.calPermission(itemId,memberId);
            let ret=await obj.get()
            if(ret===null) {
                let objComponent:any=getComponent("PermissionProject")
                ret=await objComponent.generatorValue({
                    organizationUserId: memberId,
                    projectId:itemId
                })
            }
            return ret;
        } else if(roleType===ECommon_Model_Role_Type.WIKI) {
            let obj=REDIS_AUTH.Permission.Wiki.calPermission(itemId,memberId);
            let ret=await obj.get()
            if(ret===null) {
                let objComponent:any=getComponent("PermissionWiki")
                ret=await objComponent.generatorValue({
                    organizationUserId: memberId,
                    wikiId:itemId,
                })
            }
            return ret;
        }
    }
    
    async getRolesByMemberIds(items: { itemId: string; memberId: string; }[]): Promise<{
        item_id:string,
        member_id:string,
        member_type:ECommon_Model_Organization_Member_Type,
        role:ICommon_Model_Role
    }[]> {
        let ret=await RoleMemberService.getRolesByMemberIds(items);
        return ret;
    }

    async listRoleMember(itemId:string,roleType:ECommon_Model_Role_Type,memberType:ECommon_Model_Organization_Member_Type,page?:number,size?:number,key?:string,roleId?:string):Promise<{
        data:{
            member?:ICommon_Model_Organization_User,
            memberType:ECommon_Model_Organization_Member_Type
            role:ICommon_Model_Role,
            user?:ICommon_Model_User,
            team?:ICommon_Model_Team,
            tag?:ICommon_Model_Member_Tag
        }[],
        page:number,
        totalPage:number,
        count:number
    }> {
        let ret=await RoleMemberService.listRoleMember(itemId,roleType,memberType,page,size,key,roleId);
        return ret;
    }

    async listRole(itemId:string,type:ECommon_Model_Role_Type):Promise<ICommon_Route_Res_Role_List> {
        let ret:ICommon_Route_Res_Role_List = {
            admin:null,
            users:[]
        }
        let obj=await RoleService.getItemByExp({
            type:type,
            reserved:ECommon_Model_Role_Reserved.ADMIN
        })
        ret.admin=obj.getItem();
        let objUsers=await RoleService.getUserRoles(itemId,type);
        ret.users=objUsers;
        return ret;
    }

    
    async clearRoleByItemId(itemId: string) {
        await RoleService.clearRoleByItemId(itemId)
    }

    
    async clearRoleByItemIds(itemIds:string[]) {
        await RoleService.clearRoleByItemIds(itemIds)
    }

    
    async getAdminRoleByType(type: ECommon_Model_Role_Type): Promise<string> {
        let ret=await RoleService.getItemByExp({
            type:type,
            reserved:ECommon_Model_Role_Reserved.ADMIN
        })
        if(!ret) {
            throw Err.Auth.roleNotFound
        }
        return ret.getId();
    }

    async getRoleServiceById(roleId:string) {
        let ret=await RoleService.getItemById(roleId);
        return ret;
    }

    async getRoleMemberService(param:Partial<ICommon_Model_Role_Member>) {
        let ret=await RoleMemberService.getItemByExp(param)
        return ret;
    }

    async createRole(param:Partial<ICommon_Model_Role>):Promise<ICommon_Route_Res_Role_Item> {
        let obj=new RoleService()
        delete param.id;
        delete param.created_time;
        delete param.modified_time;
        obj.assignItem(param)
        let ret=await obj.create()
        let permissions=await obj.listPermission();
        return {
            ...ret,
            permissions
        }
    }

    async updateRole(param:Partial<Omit<ICommon_Model_Role, "id"|"created_time"|"modified_time">> & {id:string}):Promise<ICommon_Route_Res_Role_Item> {
        let obj=await RoleService.getItemById(param.id);
        if(!obj) {
            throw Err.Role.roleNotFound
        }
        obj.assignItem(param);
        let ret=await obj.update()
        let permissions=await obj.listPermission();
        return {
            ...ret,
            permissions
        };
    }

    async removeRole(roleId:string) {
        let obj=await RoleService.getItemById(roleId);
        if(!obj) {
            throw Err.Role.roleNotFound
        }
        let isExist=await RoleMemberService.checkRoleMember(roleId)
        if(isExist) {
            throw Err.Role.roleMemberExists
        }
        await obj.delete();
        await RoleMemberService.clearByRoleId(roleId);
    }

    async getRoleByValue(value:number):Promise<ICommon_Model_Role> {
        let ret=await roleMapper.getRoleByValue(value);
        return ret;
    }

    async getSystemDefaultRole(type:ECommon_Model_Role_Type) {
        let ret=await RoleService.getItemByExp({
            reserved:ECommon_Model_Role_Reserved.NORMAL,
            item_id:null,
            organization_id:null,
            type:type
        })
        return ret.getItem();
    }

    async clearByOrganizationId(organizationId:string) {
        await RoleService.clearByOrganizationId(organizationId)
    }
}
export default new RpcAuthApi;