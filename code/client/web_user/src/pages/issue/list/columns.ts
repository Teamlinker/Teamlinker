
//首页表格和表单配置  index
export const columns = [
  {
      title: '名称',
      dataIndex: 'name',
      width:'20%',
      ellipsis:true
  },
  {
      title: '关键字',
      dataIndex: 'keyword',
      width:'20%',
      ellipsis:true
  },
  {
      title: '描述',
      dataIndex: 'description',
      width:'20%',
      ellipsis:true
  },
  {
    title: '图片',
    dataIndex: 'photo',
    slots: { customRender: 'photo' },
    width:'20%',
    ellipsis:true
},
  {
      title: '操作',
      key: 'action',
      dataIndex: 'action',
      slots: { customRender: 'action' },
      width:'20%',
      ellipsis:true
  },
]
