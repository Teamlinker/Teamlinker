
//首页表格和表单配置  index
export const columns = [
  {
      title: '画像名称',
      dataIndex: 'date',
      width: 200,
  },
  {
      title: '客户数量',
      dataIndex: 'amount',
      width: 100,
  },
  {
      title: '创建者',
      dataIndex: 'type',
      width: 100,
  },
  {
    title: '创建时间',
    dataIndex: 'note',
    width: 100,
  },
  {
    title: '最后更新时间',
    dataIndex: 'note',
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
      tag: 'text',
      label: '分群名称',
      fieldName: 'formField1',
      labelCol:{
        xs: {span: 24},
        sm: {span: 8}
       },
       wrapperCol:{
         xs: {span: 24},
         sm: {span: 14}
       },
      placeholder: '请输入分群名称'
    },
    {
      label: '客户量',
      tag: 'number',
      fieldName: 'formField2',
      labelCol:{
        xs: {span: 24},
        sm: {span: 8}
       },
       wrapperCol:{
         xs: {span: 24},
         sm: {span: 14}
       },
      placeholder: '请输入客户量',
    },
    {
      tag: 'text',
      label: '创建者',
      fieldName: 'formField1',
      labelCol:{
        xs: {span: 24},
        sm: {span: 8}
       },
       wrapperCol:{
         xs: {span: 24},
         sm: {span: 14}
       },
      placeholder: '请输入创建者'
    },
    {
       label: '创建时间',
       tag: 'datetimeRange',
       fieldName: 'formField5',
       labelCol:{
        xs: {span: 24},
        sm: {span: 8} //控制label的框的长度
       },
       wrapperCol:{
         xs: {span: 24},
         sm: {span: 14}//控制文本框的长度
       },
       placeholder: ['开始日期', '选择日期'],
    },
    {
      label: '最后更新时间',
      tag: 'datetimeRange',
      fieldName: 'formField6',
      labelCol:{
       xs: {span: 24},
       sm: {span: 8} //控制label的框的长度
      },
      wrapperCol:{
        xs: {span: 24},
        sm: {span: 14}//控制文本框的长度
      },
      placeholder: ['开始日期', '选择日期'],
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
          message: '请输入便签名'
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
      dataIndex: 'id',
      key: 'id',
      width: '10%',
  },
  {
      title: '标签名称',
      dataIndex: 'name',
      key: 'name',
      width: '10%',
      slots: { customRender: 'name' }
  },
  {
      title: '创建时间',
      dataIndex: 'creation',
      key: 'creation',
  },
  {
      title: '状态',
      dataIndex: 'state',
      key: 'state',
  },
  {
      title: '备注',
      dataIndex: 'remarks',
      key: 'remarks',
      slots: { customRender: 'remarks' }
  },
  {
      title: '操作',
      key: 'action',
      dataIndex: 'action',
      width: '20%',
      slots: { customRender: 'action' }
  },
] 