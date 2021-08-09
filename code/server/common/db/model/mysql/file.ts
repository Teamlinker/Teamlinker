export default interface IServer_DB_Model_File {
    id :bigint,
    user_id :bigint,
    project_id :bigint ,
    size: bigint ,
    filename :string,
    type :string,
    created_time :number,
    path :string,
}
export const Table_File="file"