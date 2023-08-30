import {BaseModel} from "./base"
import {ECommon_Field_Type} from "../field/type";

export enum ECommon_Model_Workflow_Node_Field_Type_Label_Type {
    USER,
    RELEASE,
    ISSUE,
    SPRINT
}

export interface ICommon_Model_Workflow_Node_Field_Type {
    id: string,
    workflow_node_id: string,
    field_type_id: ECommon_Field_Type,
    optional: number,
    default_string_value: string,
    default_number_value:number,
    name: string,
    description: string,
    label_type: ECommon_Model_Workflow_Node_Field_Type_Label_Type,
    weight: number
}

export const Table_Workflow_Node_Field_Type = "workflow_node_field_type"

class WorkflowNodeFieldTypeModel extends BaseModel {
    table = Table_Workflow_Node_Field_Type
    model = <ICommon_Model_Workflow_Node_Field_Type>{}
}

export let workflowNodeFieldTypeModel = new WorkflowNodeFieldTypeModel