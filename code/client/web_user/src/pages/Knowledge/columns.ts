
//首页表格和表单配置  index
export const columns = [
  {
      title: '排序',
      dataIndex: 'date',
      width: 200,
  },
  {
      title: '客户话术',
      dataIndex: 'amount',
      width: 100,
  },
  {
      title: '坐席金牌话术',
      dataIndex: 'type',
      width: 100,
  },
  {
      title: '操作',
      key: 'action',
      dataIndex: 'action',
      slots: { customRender: 'action' },
      width: 200,
      actions:[
        {
          type: 'button', // 控制类型，默认为a,可选： select | button | text
          text: '删除',
          permission: {
            // 权限
            action: 'delete',
            effect: 'disabled'
          },
          props: {
            type: 'danger'
          },
          func:() => {
            alert('删除')
          }
        }
      ]
  },
]

export const formColumns = {
  colSpan:4,
  formList:[
    {
      tag: 'text', // 控件类型
      label: '角色', // 控件显示的文本
      fieldName: 'formField1',
      labelCol:{
        xs: {span: 24},
        sm: {span: 8} //控制label的框的长度
       },
       wrapperCol:{
         xs: {span: 24},
         sm: {span: 14}//控制文本框的长度
       },
      placeholder: '请输入便签名或ID', // 默认控件的空值文本
      rules: [
        {
          required: true,
          message: '请输入便签名'
        }
      ],
    },
    {
      tag: 'text', // 控件类型
      label: '话术关键字', // 控件显示的文本
      fieldName: 'formField2',
      labelCol:{
        xs: {span: 24},
        sm: {span: 8} //控制label的框的长度
       },
       wrapperCol:{
         xs: {span: 24},
         sm: {span: 14}//控制文本框的长度
       },
      placeholder: '请输入', // 默认控件的空值文本
      rules: [
        {
          required: true,
          message: '请输入话术关键字'
        }
      ],
    },
    
     {
      label: 'action',
      tag: 'action',
      options:[
        {
          tag:'button',
          text:'查询',
          action:"onSubmit"
        },
        {
          tag:'button',
          text:'重置',
          action:"resetForm"
        }
      ],
     }
  ]
}


 
//标签管理表单和表格配置  labelManage

export const labelFormColumns = {
  colSpan:4,
  formList:[
    {
      tag: 'text', // 控件类型
      label: '标签名称', // 控件显示的文本
      fieldName: 'formField1',
      labelCol:{
        xs: {span: 24},
        sm: {span: 8} //控制label的框的长度
      },
      wrapperCol:{
        xs: {span: 24},
        sm: {span: 14}//控制文本框的长度
      },
      placeholder: '请输入便签名或ID', // 默认控件的空值文本
      rules: [
        {
          required: true,
          message: '请输入标签名称'
        }
      ]
    },
    {
      label: '下拉框',
      tag: 'select',
      fieldName: 'formField7',
      labelCol:{
        xs: {span: 24},
        sm: {span: 8} //控制label的框的长度
      },
      wrapperCol:{
        xs: {span: 24},
        sm: {span: 14}//控制文本框的长度
      },
      placeholder: '请选择',
      options: [
        {
          label: 'text1',
          value: '0'
        },
        {
          label: 'text2',
          value: '1'
        }
      ],
    },
    {
      label: 'action',
      tag: 'action',
      options:[
        {
          tag:'button',
          text:'查询',
          action:"onSubmit"
        },
        {
          tag:'button',
          text:'重置',
          action:"resetForm"
        }
      ],
    }
  ]
}

export const labelColumns = [
  {
      title: '标签ID',
      dataIndex: 'date',
      width: 200,
  },
  {
      title: '标签名称',
      dataIndex: 'amount',
      width: 100,
  },
  {
      title: '创建时间',
      dataIndex: 'type',
      width: 100,
  },
  {
      title: '状态',
      dataIndex: 'note',
      width: 100,
  },
  {
      title: '备注',
      dataIndex: 'note',
      width: 100,
  },
  {
      title: '操作',
      key: 'action',
      dataIndex: 'action',
      width: 200,
      slots: { customRender: 'action' }
  },
] 