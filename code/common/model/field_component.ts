export interface ICommon_Model_Field_Component {
    id:bigint,
    description:string,
    created_time:Date,
    modified_time:Date,
    created_by:bigint,
    modified_by:bigint,
    name:string
}
export const Table_Field_Component="field_component"