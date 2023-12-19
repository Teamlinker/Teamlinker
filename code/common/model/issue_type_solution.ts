import { BaseModel } from "./base"

export interface ICommon_Model_Issue_Type_Solution {
    id :string ,
    name :string,
    description :string,
    reserved :number,
    created_time :Date,
    modified_time :Date,
    organization_id:string
}
export const Table_Issue_Type_Solution="issue_type_solution"

class IssueTypeSolutionModel extends BaseModel {
    table=Table_Issue_Type_Solution
    model=<ICommon_Model_Issue_Type_Solution>{}
  }
  
export let issueTypeSolutionModel=new IssueTypeSolutionModel