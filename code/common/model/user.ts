export interface ICommon_Model_User {
    id :bigint,
  username :string,
  email :string,
  phone :string,
  created_time :Date,
  modified_time :Date,
  password :string,
  sign :string,
  location :string,
  title :string,
}
export const Table_User="user"