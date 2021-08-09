export default interface IServer_DB_Model_Project_Issue_Parent {
    id :bigint,
    parent_id :bigint,
    child_id:bigint
}
export const Table_Project_Issue_Parent="project_issue_parent"