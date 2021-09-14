export interface ICommon_Model_User_Setting {
    id :string ,
  key :string,
  value :string,
  type :number,
  created_time :Date,
  modified_time :Date,
  user_id :string,
}
export const Table_User_Setting="user_setting"