import { getAllPermissions, Permission_Types } from "../../../common/permission/permission";
import "../permission/project";
import "../permission/team";


export namespace RoleDefault {
    export const Project_Role=<{
        [param:string]:{
            name:string,
            description:"",
            permission:Permission_Types.Project[]
        }
    }>{
        admin:{
            name:"admin",
            description:"",
            permission:getAllPermissions(Permission_Types.Project)
        },
        user:{
            name:"user",
            description:"",
            permission:[Permission_Types.Project.READ,Permission_Types.Project.EDIT]
        }
    }
    export const Team_Role=<{
        [param:string]:{
            name:string,
            description:"",
            permission:Permission_Types.Team[]
        }
    }>{
        admin:{
            name:"admin",
            description:"",
            permission:getAllPermissions(Permission_Types.Team)
        },
        user:{
            name:"user",
            description:"",
            permission:[Permission_Types.Team.READ]
        }
    }
}