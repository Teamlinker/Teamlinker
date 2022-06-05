import { ECommon_Model_Role_Type, roleModel } from "../../../common/model/role";
import { Entity } from "../../common/entity/entity";
import { roleMapper } from "../mapper/role";

export class RoleService extends Entity<typeof roleModel,typeof roleMapper> {
    constructor(){
        super(roleMapper)
    }
    static async getRolesByItemId(itemId: string,type:ECommon_Model_Role_Type) {
        let ret=await roleMapper.getRolesByItemId(itemId,type) 
        return ret;
    }

    static async clearRoleByItemId(itemId:string) {
        await roleMapper.clearRoleByItemId(itemId)
    }

    static async clearRoleByItemIds(itemIds:string[]) {
        await roleMapper.clearRoleByItemIds(itemIds)
    }
}