export default interface IServer_DB_Model_Permission_Target {
    id :bigint,
  permission_id: bigint,
  target_id :bigint,
  target_type :number,
  item_id :bigint,
  item_type :number,
}
export const Table_Permission_Target="permission_target"