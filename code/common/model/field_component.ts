import { BaseModel } from "./base"

export interface ICommon_Model_Field_Component {
    id:string,
    description:string,
    created_time:Date,
    modified_time:Date,
    created_by:string,
    modified_by:string,
    name:string
}
export const Table_Field_Component="field_component"

class FieldComponentModel extends BaseModel {
    table=Table_Field_Component
    model=<ICommon_Model_Field_Component>{}
}

export let fieldComponentModel=new FieldComponentModel