export interface ICommon_Model_Field_Component_Field {
    id:bigint,
    type_id:bigint,
    system:number,
    description:string,
    created_time:Date,
    modified_time:Date,
    created_by:bigint,
    modified_by:bigint,
    name:string
}
export const Table_Field_Component_Field="field_component_field"