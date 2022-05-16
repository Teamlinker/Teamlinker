import { BaseModel } from "./base"

export interface ICommon_Model_Workflow {
    id :string ,
  name :string,
  description :string,
  reserved :number,
  created_time :Date,
  modified_time :Date,
  organization_id:string
}
export const Table_Workflow="workflow"

class WorkflowModel extends BaseModel {
  table=Table_Workflow
  model=<ICommon_Model_Workflow>{}
}

export  let workflowModel=new WorkflowModel