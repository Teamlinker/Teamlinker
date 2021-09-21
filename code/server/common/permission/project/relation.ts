import { PermissionModel } from './../../../../common/model/permission';
import { ICommon_Model_Role_Permission, Table_Role_Permission, RolelPermissionModel } from './../../../../common/model/role_permission';
import { Table_Project_User, ICommon_Model_Project_User, ProjectUserModel } from './../../../../common/model/project_user';
import { Table_Project } from './../../../../common/model/project';
import { Permission_Types } from '../../../../common/permission/permission';
import { DComponent } from '../../../common/decorate/component';
import { getMysqlInstance } from '../../db/mysql';
import { generateQuerySql } from '../../util/sql';
import StringUtil from '../../util/string';
import { DPermission, PermissionBase } from '../base';
import { Table_Project_Role } from '../../../../common/model/project_role';

export type IPermission_Project_CacheValue =string[]

@DPermission(Permission_Types.Project.READ)
@DComponent
export class PermissionProjectRead extends PermissionBase<IPermission_Project_CacheValue> {
    key="permission:user:{0}:project:{1}"
    async create({userId,projectId}):Promise<IPermission_Project_CacheValue> {
        let mysql=getMysqlInstance()
        let objProject=await mysql.executeOne(generateQuerySql(new ProjectUserModel,[],{
            project_id:projectId,
            user_id:userId
        }))
        if(!objProject) {
            return null
        }  
        let arrRolePermission=await mysql.execute(generateQuerySql(new RolelPermissionModel,[],{
            role_id:objProject.role
        }))
        let arr:string[]=[]
        for(let obj of arrRolePermission) {
            let objPermission = await mysql.executeOne(generateQuerySql(new PermissionModel,[],{
                id:obj.role_id
            }))
            if(objPermission) {
                arr.push(objPermission.value)
            }
        }
        return arr;
    }
    check(obj:IPermission_Project_CacheValue):boolean {
        return obj.includes[Permission_Types.Project.READ.value];
    }
    getKey({userId,projectId}) {
        if(StringUtil.isEmpty(userId) || StringUtil.isEmpty(projectId)) {
            return null;
        }
        return StringUtil.format(this.key,userId,projectId);
    }
} 