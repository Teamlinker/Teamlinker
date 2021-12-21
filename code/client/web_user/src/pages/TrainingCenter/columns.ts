//模型列表表单和表格配置  labelManage

export const formColumns = (number) => {
  return {
    colSpan:4,
    formList:[
      {
        tag: 'text', // 控件类型
        label: '模型名称', // 控件显示的文本
        fieldName: `formField${number}1`,
        labelCol:{
          xs: {span: 24},
          sm: {span: 8} //控制label的框的长度
        },
        wrapperCol:{
          xs: {span: 24},
          sm: {span: 14}//控制文本框的长度
        },
        placeholder: '请输入模型名称或编号', // 默认控件的空值文本
        rules: [
          {
            required: true,
            message: '请输入模型名称'
          }
        ]
      },
      {
        label: '训练状态',
        tag: 'select',
        fieldName: `formField${number}2`,
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
        label: '版本号',
        tag: 'select',
        fieldName: `formField${number}3`,
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
        label: '发布状态',
        tag: 'select',
        fieldName: `formField${number}4`,
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
}

export const labelColumns = [
  {
      title: '模型名称',
      dataIndex: 'name',
      width: 200,
  },
  {
      title: '模型编号',
      dataIndex: 'number',
      width: 100,
  },
  {
      title: '最新版本',
      dataIndex: 'edition',
      width: 100,
  },
  {
      title: '模型准确度',
      dataIndex: 'accuracy',
      width: 100,
  },
  {
      title: '训练状态',
      dataIndex: 'stateName',
      width: 100,
  },
  {
    title: '发布状态',
    dataIndex: 'releaseName',
    width: 100,
  },
  {
    title: '发布时间',
    dataIndex: 'releaseDate',
    width: 100,
  },
  {
    title: '操作人',
    dataIndex: 'operator',
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