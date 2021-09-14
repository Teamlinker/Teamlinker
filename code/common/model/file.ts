export interface ICommon_Model_File {
    id :string,
    user_id :string,
    project_id :string ,
    size: string ,
    filename :string,
    type :string,
    created_time :Date,
    path :string,
}
export const Table_File="file"