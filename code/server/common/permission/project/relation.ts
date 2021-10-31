import { Permission_Types } from '../../../../common/permission/permission';
import { DComponent } from '../../../common/decorate/component';
import { getMysqlInstance } from '../../db/mysql';
import { generateQuerySql } from '../../util/sql';
import StringUtil from '../../util/string';
import { DPermission, PermissionBase } from '../base';
import { permissionModel } from './../../../../common/model/permission';
import { projectMemberModel } from './../../../../common/model/project_member';
import { rolelPermissionModel } from './../../../../common/model/role_permission';

export type IPermission_Project_CacheValue =string[]

@DPermission(Permission_Types.Project.READ)
@DComponent
export class PermissionProjectRead extends PermissionBase<IPermission_Project_CacheValue> {
    key="permission:user:{0}:project:{1}"
    async create({userId,projectId}):Promise<IPermission_Project_CacheValue> {
        let mysql=getMysqlInstance()
        let objProject=await mysql.executeOne(generateQuerySql(projectMemberModel,[],{
            project_id:projectId,
            member_id:userId
        }))
        if(!objProject) {
            return null
        }  
        let arrRolePermission=await mysql.execute(generateQuerySql(rolelPermissionModel,[],{
            role_id:objProject.role_id
        }))
        let arr:string[]=[]
        for(let obj of arrRolePermission) {
            let objPermission = await mysql.executeOne(generateQuerySql(permissionModel,[],{
                id:obj.permission_id
            }))
            if(objPermission) {
                arr.push(objPermission.value)
            }
        }
        return arr;
    }
    check(obj:IPermission_Project_CacheValue):boolean {
        return obj.includes(Permission_Types.Project.READ.value);
    }
    getKey({userId,projectId}) {
        if(StringUtil.isEmpty(userId) || StringUtil.isEmpty(projectId)) {
            return null;
        }
        return StringUtil.format(this.key,userId,projectId);
    }
} 