import { BaseModel } from "./base"

export interface ICommon_Model_Workflow_Solution {
    id :string ,
  created_time :Date,
  modified_time :Date,
  reserved :number,
  name :string,
  description :string,
  organization_id:string
}
export const Table_Workflow_Solution="workflow_solution"

class WorkflowSolutionModel extends BaseModel {
  table=Table_Workflow_Solution
  model=<ICommon_Model_Workflow_Solution>{}
}

export  let workflowSolutionModel=new WorkflowSolutionModel