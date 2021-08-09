export default interface IServer_DB_Model_Project_Module_Parent {
    id :bigint,
    parent_id:bigint,
    child_id:bigint
}
export const Table_Project_Module_Parent="project_module_parent"