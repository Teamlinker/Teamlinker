import {BaseModel} from "./base"

export enum ECommon_Model_Workflow_Node_Status {
  NOTSTART,
  INPROGRESS,
  DONE
}

export interface ICommon_Model_Workflow_Node {
    id :string ,
  name :string,
  description :string,
  status :ECommon_Model_Workflow_Node_Status,
  issue_type_id :string ,
  x:number,
  y:number,
  is_approval:number,
  is_all_coming:number
}
export const Table_Workflow_Node="workflow_node"

class WorkflowNodeModel extends BaseModel {
  table=Table_Workflow_Node
  model=<ICommon_Model_Workflow_Node>{}
}

export  let workflowNodeModel=new WorkflowNodeModel