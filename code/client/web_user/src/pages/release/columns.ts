
//首页表格和表单配置  index
export const columns = [
    {
        title: 'name',
        dataIndex: 'name',
        slots: { customRender: 'name' },
        width:'10%',
        ellipsis:true
    },
    {
        title: 'status',
        dataIndex: 'status',
        width:'10%',
        ellipsis:true
    },
    {
      title: 'start date',
      dataIndex: 'start_time',
      width:'20%',
      ellipsis:true
  },
  {
    title: 'release date',
    dataIndex: 'release_time',
    width:'20%',
    ellipsis:true
},
    {
        title: '操作',
        key: 'action',
        dataIndex: 'action',
        slots: { customRender: 'action' },
        ellipsis:true
    },
  ]
  