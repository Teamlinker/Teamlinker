import {BaseModel} from "./base"

export interface ICommon_Model_Workflow_Node_Field_Type_Config {
    id: string,
    workflow_node_field_type_id: string,
    value: string,
    selected: number,
    weight: number
}

export const Table_Workflow_Node_Field_Type_Config = "workflow_node_field_type_config"

class WorkflowNodeFieldTypeConfigModel extends BaseModel {
    table = Table_Workflow_Node_Field_Type_Config
    model = <ICommon_Model_Workflow_Node_Field_Type_Config>{}
}

export let workflowNodeFieldTypeConfigModel = new WorkflowNodeFieldTypeConfigModel