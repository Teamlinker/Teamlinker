import request from '@/utils/request'

// 获取组织列表
export function getList(params) {
  return request({
    url: '/api/organization/list',
    method: 'get',
    params
  })
}
//获取详情
export function getDetail(params) {
  return request({
    url: '/api/organization/item',
    method: 'get',
    params
  })
}
//创建组织
export function createTemp(data) {
  return request({
    url: '/api/organization/item',
    method: 'post',
    data
  })
}
//编辑组织
export function editTemp(data) {
  return request({
    url: '/api/organization/item',
    method: 'put',
    data
  })
}
// 删除组织
export function removeTemp(params) {
  return request({
    url: '/api/organization/item',
    method: 'delete',
    params
  })
}
