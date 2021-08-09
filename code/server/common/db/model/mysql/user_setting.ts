export default interface IServer_DB_Model_User_Setting {
    id :bigint ,
  key :string,
  value :string,
  type :number,
  created_time :number,
  modified_time :number,
  user_id :bigint,
}
export const Table_User_Setting="user_setting"