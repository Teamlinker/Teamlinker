
//首页表格和表单配置  index
export const pagination = {
  pageSize:10,
  onChange:Function
}
export const columns = [
  {
      title: '名称',
      dataIndex: 'name'
  },
  {
      title: '关键字',
      dataIndex: 'keyword'
  },
  {
      title: '描述',
      dataIndex: 'description',
  },
  {
    title: '图片',
    dataIndex: 'photo',
},
  {
      title: '操作',
      key: 'action',
      dataIndex: 'action',
      slots: { customRender: 'action' }
  },
]
