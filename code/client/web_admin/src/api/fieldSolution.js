import request from '@/utils/request'

//字段方案列表
export function getFieldSolutionList(params) {
  return request({
    url: '/api/field/solution/list',
    method: 'get',
    params
  })
}
//新建字段方案
export function createFieldSolution(data){
  return request({
    url: '/api/field/solution/item',
    method: 'post',
    data
  })
}
//刪除字段方案
export function deleteFieldSolution(params){
  return request({
    url: '/api/field/solution/item',
    method: 'delete',
    params
  })
}
//编辑字段方案
export function editFieldSolution(data){
  return request({
    url: '/api/field/solution/item',
    method: 'put',
    data
  })
}

//字段方案详情
export function fieldSolutionDetail(params){
  return request({
    url: '/api/field/solution/item',
    method: 'get',
    params
  })
}
//工作流节点字段列表
export function workflowNodeList(params){
  return request({
    url: '/api/field/solution/field/list',
    method: 'get',
    params
  })
}
//绑定工作流方案
export function bindFieldSolution(data){
  return request({
    url: '/api/field/solution/bind',
    method: 'put',
    data
  })
}
//解绑工作流方案
export function unbindFieldSolution(data){
  return request({
    url: '/api/field/solution/unbind',
    method: 'put',
    data
  })
}
//字段类型列表
export function fieldTypeList(params){
  return request({
    url: '/api/field/type/list',
    method: 'get',
    params
  })
}
//添加工作流节点字段
export function addField(data){
  return request({
    url: '/api/field/solution/field/item',
    method: 'post',
    data
  })
}
//删除工作流节点字段
export function deleteField(params){
  return request({
    url: '/api/field/solution/field/item',
    method: 'delete',
    params
  })
}
//编辑工作流节点字段
export function editField(data){
  return request({
    url: '/api/field/solution/field/item',
    method: 'put',
    data
  })
}
//查看工作流节点字段
export function fieldDetails(params){
  return request({
    url: '/api/field/solution/field/item',
    method: 'get',
    params
  })
}
//复制工作流节点字段
export function copyField(data){
  return request({
    url: '/api/field/solution/workflow/copy',
    method: 'post',
    data
  })
}
//添加节点字段值
export function addFieldValue(data){
  return request({
    url: '/api/field/solution/field/config/item',
    method: 'post',
    data
  })
}

