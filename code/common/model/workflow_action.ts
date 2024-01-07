import {BaseModel} from "./base"

export interface ICommon_Model_Workflow_Action {
    id :string ,
  name :string,
  description :string,
  source_node_id :string ,
  dest_node_id :string ,
  issue_type_id :string,
  source_anchor_point:string,
  end_anchor_point:string
}
export const Table_Workflow_Action="workflow_action"

class WorkflowActionModel extends BaseModel {
  table=Table_Workflow_Action
  model=<ICommon_Model_Workflow_Action>{}
}

export  let workflowActionModel=new WorkflowActionModel