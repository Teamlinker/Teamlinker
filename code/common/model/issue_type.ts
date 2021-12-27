import { BaseModel } from "./base"

export interface ICommon_Model_Issue_Type {
    id:string,
    name:string,
    icon:string,
    description:string,
    reserved:number,
    created_time:Date,
    modify_time:Date,
}
export const Table_Issue_Type="issue_type"

class IssueTypeModel extends BaseModel {
    table=Table_Issue_Type
    model=<ICommon_Model_Issue_Type>{}
  }
  
export let issueTypeModel=new IssueTypeModel