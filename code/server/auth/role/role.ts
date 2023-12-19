import {Permission_Types} from "../../../common/permission/permission";
import "../permission/project";
import "../permission/team";
import "../permission/organization";
import "../permission/wiki";
import "../permission/self"
import {ECommon_Model_Role_Reserved, ECommon_Model_Role_Type} from "../../../common/model/role";


export namespace RoleDefault {
    export const Project_Role={
        admin:{
            name:"admin",
            value:Permission_Types.Project.ADMIN.value,
            description:"project admin",
            item_id:null,
            organization_id:null,
            type:ECommon_Model_Role_Type.PROJECT,
            reserved:ECommon_Model_Role_Reserved.ADMIN
        },
        default:{
            name:"default",
            value:Permission_Types.Project.READ.value,
            description:"project default",
            item_id:null,
            organization_id:null,
            type:ECommon_Model_Role_Type.PROJECT,
            reserved:ECommon_Model_Role_Reserved.NORMAL
        }
    }
    export const Team_Role={
        admin:{
            name:"admin",
            value:Permission_Types.Team.ADMIN.value,
            description:"team admin",
            item_id:null,
            organization_id:null,
            type:ECommon_Model_Role_Type.TEAM,
            reserved:ECommon_Model_Role_Reserved.ADMIN
        },
        default:{
            name:"default",
            value:Permission_Types.Team.READ.value,
            description:"team default",
            item_id:null,
            organization_id:null,
            type:ECommon_Model_Role_Type.TEAM,
            reserved:ECommon_Model_Role_Reserved.NORMAL
        }
    }
    export const Organization_Role={
        admin:{
            name:"admin",
            value:Permission_Types.Organization.ADMIN.value,
            description:"organization admin",
            item_id:null,
            organization_id:null,
            type:ECommon_Model_Role_Type.ORGANIZATION,
            reserved:ECommon_Model_Role_Reserved.ADMIN
        },
        default:{
            name:"default user",
            value:Permission_Types.Organization.READ.value | Permission_Types.Organization.EDIT.value,
            description:"organization user",
            item_id:null,
            organization_id:null,
            type:ECommon_Model_Role_Type.ORGANIZATION,
            reserved:ECommon_Model_Role_Reserved.NORMAL
        }
    }
    export const Wiki_Role={
        admin:{
            name:"admin",
            value:Permission_Types.Wiki.ADMIN.value,
            description:"wiki admin",
            item_id:null,
            organization_id:null,
            type:ECommon_Model_Role_Type.WIKI,
            reserved:ECommon_Model_Role_Reserved.ADMIN
        },
        default:{
            name:"default",
            value:Permission_Types.Wiki.READ.value,
            description:"wiki default",
            item_id:null,
            organization_id:null,
            type:ECommon_Model_Role_Type.WIKI,
            reserved:ECommon_Model_Role_Reserved.NORMAL
        }
    }
}