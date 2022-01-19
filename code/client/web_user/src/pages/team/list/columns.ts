
//首页表格和表单配置  index
export const pagination = {
  pageSize: 10,
  onChange: Function
}
export const columns = [
  {
    title: 'name',
    dataIndex: 'name'
  },
  {
    title: 'photo',
    dataIndex: 'photo',
    slots: { customRender: 'photo' },
  },
  {
    title: 'created time',
    dataIndex: 'created_time',
    slots: { customRender: 'created_time' },
  },
  {
    title: 'created username',
    dataIndex: 'created_by.username',
    slots: { customRender: 'username' },
  },
  {
    title: 'modified time',
    dataIndex: 'modified_time',
    slots: { customRender: 'modified_time' },
  },
  {
    title: 'operation',
    key: 'action',
    dataIndex: 'action',
    slots: { customRender: 'action' }
  },
]
