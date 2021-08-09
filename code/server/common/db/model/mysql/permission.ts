export default interface IServer_DB_Model_Permission {
    id: bigint,
  name :string,
  created_time :number,
  modified_time :number,
  type :number,
  value :number,
}
export const Table_Permission="permission"