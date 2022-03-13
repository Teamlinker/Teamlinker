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
