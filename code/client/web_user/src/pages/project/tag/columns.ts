export const columns = [
    {
        title: '标签名称',
        dataIndex: 'name'
    },
    {
        title: '操作',
        key: 'action',
        dataIndex: 'action',
        slots: { customRender: 'action' }
    },
  ]
  