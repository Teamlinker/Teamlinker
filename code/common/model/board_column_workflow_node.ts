import {BaseModel} from "./base";

export interface ICommon_Model_Board_Column_Workflow_Node {
    id:string,
    board_id:string,
    board_column_id:string,
    workflow_node_id:string,
    issue_type_id:string
}
export const Table_Board_Column_Workflow_Node="board_column_workflow_node"

class BoardColumnWorkflowNodeModel extends BaseModel {
    table=Table_Board_Column_Workflow_Node
    model=<ICommon_Model_Board_Column_Workflow_Node>{}
}

export let boardColumnWorkflowNodeModel=new BoardColumnWorkflowNodeModel