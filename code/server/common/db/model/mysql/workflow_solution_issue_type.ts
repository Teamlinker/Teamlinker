export default interface IServer_DB_Model_Workflow_Solution_Issue_Type {
    id :bigint,
  workflow_solution_id :bigint,
  workflow_id :bigint ,
  issue_type_id :bigint ,
}
export const Table_Workflow_Solution_Issue_Type="workflow_solution_issue_type"