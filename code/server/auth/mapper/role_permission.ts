import { Mapper } from "../../common/entity/mapper";
import { rolelPermissionModel } from './../../../common/model/role_permission';

class RolePermissionMapper extends Mapper<typeof rolelPermissionModel> {
    constructor(){
        super(rolelPermissionModel)
    }

}

export let rolePermissionMapper=new RolePermissionMapper()