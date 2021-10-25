import { BaseModel } from "./base"

export interface ICommon_Model_Field_Component_Field {
    id:string,
    type_id:string,
    system:number,
    description:string,
    created_time:Date,
    modified_time:Date,
    created_by:string,
    modified_by:string,
    name:string
}
export const Table_Field_Component_Field="field_component_field"

class FieldComponentFieldModel extends BaseModel {
    table=Table_Field_Component_Field
    model=<ICommon_Model_Field_Component_Field>{}
}

export let fieldComponentFieldModel=new FieldComponentFieldModel