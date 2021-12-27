import { BaseModel } from "./base"

export interface ICommon_Model_Issue_Type_Solution_Issue_Type {
    id :string ,
  issue_type_id :string,
  issue_type_solution_id :string,
}
export const Table_Issue_Type_Solution_Issue_Type="issue_type"

class IssueTypeSolutionIssueTypeModel extends BaseModel {
  table=Table_Issue_Type_Solution_Issue_Type
  model=<ICommon_Model_Issue_Type_Solution_Issue_Type>{}
}

export let issueTypeSolutionIssueTypeModel=new IssueTypeSolutionIssueTypeModel