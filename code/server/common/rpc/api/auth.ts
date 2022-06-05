import { ECommon_Organization_User_Role } from "../../../../common/model/organization_user"
import { ECommon_Model_Project_Member_Type } from "../../../../common/model/project_member"
import { ECommon_Model_Role_Type } from "../../../../common/model/role"
import { ECommon_Model_Role_Memeber_Type } from "../../../../common/model/role_member"
import { Permission_Base } from "../../../../common/permission/permission"

export interface IServer_Common_RPC_Auth {
    initPermission?():Promise<{
        [param:number]:string
    }>
    initRole?(objPermission:{
        [param:number]:string
    }):Promise<{
        projectRoleUserId:string,
        groupRoleUserId:string
    }>
    getOrganizationPermission?(organizationId:string,userId:string):Promise<ECommon_Organization_User_Role>
    processPermission?(permissions:Permission_Base[],obj:any):Promise<[boolean,any]>
    deletePermission?(permissionDelete:any)
    changeRole?(itemId:string,memberId:string,roleId:string)
    addRole?(itemId:string,memberId:string,roleId:string,itemType:ECommon_Model_Role_Memeber_Type,memberType:ECommon_Model_Project_Member_Type)
    removeRole?(itemId:string,memberId:string)
    getRolesByMemberIds?(items:{
        itemId:string,
        memberId:string
    }[]):Promise<{
        id:string,
        name:string,
        description:string
    }[]>
    getRolesByItemId?(itemId: string,type:ECommon_Model_Role_Type):Promise<{
        id:string,
        name:string,
        description:string
    }[]>
    clearRoleByItemId?(itemId:string)
    getAdminRoleByType?(type:ECommon_Model_Role_Type):Promise<string>
}
