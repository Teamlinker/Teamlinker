import {BaseModel} from "./base"

export interface ICommon_Model_Member_Tag {
    id:string,
    name:string,
    description:string,
    organization_id:string
}
export const Table_Member_Tag="member_tag"

class MemberTagModel extends BaseModel {
    table=Table_Member_Tag
    model=<ICommon_Model_Member_Tag>{}
}

export let memberTagModel=new MemberTagModel