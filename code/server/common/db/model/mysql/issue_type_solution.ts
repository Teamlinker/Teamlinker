export default interface IServer_DB_Model_Issue_Type_Solution {
    id :bigint ,
    name :string,
    description :string,
    system :number,
    created_time :number,
    modify_time :number,
    created_by :bigint ,
    modified_by :bigint ,
}
export const Table_Issue_Type_Solution="issue_type_solution"