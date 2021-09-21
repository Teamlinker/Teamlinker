import { Permission_Base, Permission_Types } from "../../../common/permission/permission";
function getAllPermissions(obj):Permission_Base[] {
    let arr:Permission_Base[] =[]
    let keys = Object.keys(obj)
    for (let key of keys) {
        let val = obj[key]
        if (val instanceof Permission_Base) {
            arr.push(val)
        }
    }
    return arr;
}
export namespace OBTPConfig {
    export namespace Role {
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
                permission:[Permission_Types.Project.READ]
            }
        }
    }
}