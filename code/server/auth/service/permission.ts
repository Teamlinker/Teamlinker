import { Entity } from "../../common/entity/entity";
import { permissionModel } from './../../../common/model/permission';
import { permissionMapper } from './../mapper/permission';

export class PermisssionService extends Entity<typeof permissionModel,typeof permissionMapper> {
    constructor(){
        super(permissionMapper)
    }

}