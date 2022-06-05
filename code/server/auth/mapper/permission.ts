import { Mapper } from "../../common/entity/mapper";
import { permissionModel } from './../../../common/model/permission';

class PermissionMapper extends Mapper<typeof permissionModel> {
    constructor(){
        super(permissionModel)
    }

}

export let permissionMapper=new PermissionMapper()