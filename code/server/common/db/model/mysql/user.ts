export default interface IServer_DB_Model_User {
    id :bigint,
  username :string,
  email :string,
  phone :string,
  created_time :number,
  modified_time :number,
  password :string,
  sign :string,
  location :string,
  title :string,
}
export const Table_User="user"