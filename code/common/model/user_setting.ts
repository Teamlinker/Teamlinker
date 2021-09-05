export interface ICommon_Model_User_Setting {
    id :bigint ,
  key :string,
  value :string,
  type :number,
  created_time :Date,
  modified_time :Date,
  user_id :bigint,
}
export const Table_User_Setting="user_setting"