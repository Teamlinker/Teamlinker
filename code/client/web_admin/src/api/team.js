/*
 * @Descripttion:
 * @version:
 * @Author: gqwu
 * @Date: 2021-10-09 11:08:42
 * @LastEditors: gqwu
 * @LastEditTime: 2021-12-01 16:20:59
 */
import request from '@/utils/request'


// 获取团队列表
export function getList(params) {
  return request({
    url: '/api/team/list',
    method: 'get',
    params
  })
}
//创建团队
export function createTemp(data) {
  return request({
    url: '/api/team/item',
    method: 'post',
    data
  })
}
// 删除团队
export function removeTemp(params) {
  return request({
    url: '/api/team/item',
    method: 'delete',
    params
  })
}
// 编辑项团队
export function editTemp(data) {
  return request({
    url: '/api/team/item',
    method: 'put',
    data
  })
}
// 团队成员列表
export function teamMembers(params) {
  return request({
    url: '/api/team/members',
    method: 'get',
    params
  })
}

