import { Entity } from "../../common/entity/entity";
import { roleMemberModel } from './../../../common/model/role_member';
import { roleMemberMapper } from './../mapper/role_member';

export class RoleMemeberService extends Entity<typeof roleMemberModel,typeof roleMemberMapper> {
    constructor(){
        super(roleMemberMapper)
    }
    static async getRolesByMemberIds(items: { itemId: string; memberId: string; }[]) {
        let ret=await roleMemberMapper.getRolesByMemberIds(items);
        return ret;
    }

}