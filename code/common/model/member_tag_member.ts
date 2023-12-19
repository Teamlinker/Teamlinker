import {BaseModel} from "./base"

export interface ICommon_Model_Member_Tag_Member {
    id:string,
    member_tag_id:string,
    organization_user_id:string
}
export const Table_Member_Tag_Member="member_tag_member"

class MemberTagMemberModel extends BaseModel {
    table=Table_Member_Tag_Member
    model=<ICommon_Model_Member_Tag_Member>{}
}

export let memberTagMemberModel=new MemberTagMemberModel