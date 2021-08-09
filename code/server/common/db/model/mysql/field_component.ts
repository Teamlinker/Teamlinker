export default interface IServer_DB_Model_Field_Component {
    id:bigint,
    description:string,
    created_time:number,
    modified_time:number,
    created_by:bigint,
    modified_by:bigint,
    name:string
}
export const Table_Field_Component="field_component"