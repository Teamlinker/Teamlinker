export const columns = [
  {
      title: '姓名',
      dataIndex: 'name'
  },
  {
      title: '角色',
      dataIndex: 'role',
      customRender:(role:any)=>{
          return role.text.name
      }
  },
  {
      title: '操作',
      key: 'action',
      dataIndex: 'action',
      slots: { customRender: 'action' }
  },
]
