import { Entity } from "../../common/entity/entity";
import { rolelPermissionModel } from './../../../common/model/role_permission';
import { rolePermissionMapper } from './../mapper/role_permission';

export class RolePermissionService extends Entity<typeof rolelPermissionModel,typeof rolePermissionMapper> {
    constructor(){
        super(rolePermissionMapper)
    }

}