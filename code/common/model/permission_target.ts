export interface ICommon_Model_Permission_Target {
    id :string,
  permission_id: string,
  target_id :string,
  target_type :number,
  item_id :string,
  item_type :number,
}
export const Table_Permission_Target="permission_target"