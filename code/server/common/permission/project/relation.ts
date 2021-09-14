import { Permission_Types } from '../../../../common/permission/permission';
import { IServer_Common_Permission_Base } from '../base';

export type IPermission_Project_CacheValue =Exclude<keyof typeof Permission_Types.Project,"type"|"prototype">[]
class PermissionProjectRead implements IServer_Common_Permission_Base<IPermission_Project_CacheValue> {
    key="permission:user:{0}:project:{1}"
    async create(...argv:any):Promise<IPermission_Project_CacheValue> {
        return null;
    }
    check(obj:IPermission_Project_CacheValue):boolean {
        return;
    }
    clear():void{}
} 