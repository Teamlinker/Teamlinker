import {Entity} from "../../common/entity/entity";
import {roleMemberModel} from './../../../common/model/role_member';
import {roleMemberMapper} from './../mapper/role_member';
import {ECommon_Model_Organization_Member_Type} from "../../../common/model/organization";
import {ECommon_Model_Role_Type} from "../../../common/model/role";

export class RoleMemberService extends Entity<typeof roleMemberModel,typeof roleMemberMapper> {
    constructor(){
        super(roleMemberMapper)
    }
    static async getRolesByMemberIds(items: { itemId: string; memberId: string; }[]) {
        let ret=await roleMemberMapper.getRolesByMemberIds(items);
        return ret;
    }

    static async listRoleMember(itemId:string,roleType:ECommon_Model_Role_Type,memberType:ECommon_Model_Organization_Member_Type,page?:number,size?:number,key?:string,roleId?:string){
        let ret=await roleMemberMapper.listRoleMember(itemId,roleType,memberType,page,size,key,roleId);
        return ret;
    }

    static async clearByRoleId(roleId:string) {
        await roleMemberMapper.clearByRoleId(roleId)
    }

    static async checkRoleMember(roleId:string):Promise<boolean> {
        let ret=await roleMemberMapper.checkRoleMember(roleId);
        return ret;
    }

    static async clearMember(memberId:string) {
        await roleMemberMapper.clearMember(memberId)
    }

}