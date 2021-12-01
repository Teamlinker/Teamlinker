/*
 * @Descripttion:
 * @version:
 * @Author: gqwu
 * @Date: 2021-10-09 11:08:42
 * @LastEditors: gqwu
 * @LastEditTime: 2021-11-29 14:40:08
 */
import request from '@/utils/request'

export function login(data) {
  return request({
    url: '/api/user/admin_login',
    method: 'post',
    data
  })
}

export function getInfo(token) {
  return request({
    url: '/api/user/info',
    method: 'get',
    params: { token }
  })
}

export function logout() {
  return request({
    url: '/api/user/admin_logout',
    method: 'post'
  })
}

// 获取用户列表
export function getList(params) {
  return request({
    url: '/api/user/list',
    method: 'get',
    params
  })
}
//创建用户
export function createTemp(data) {
  return request({
    url: '/api/user/item',
    method: 'post',
    data
  })
}
// 删除用户
export function removeTemp(params) {
  return request({
    url: '/api/user/item',
    method: 'delete',
    params
  })
}
// 禁用启用账户
export function activeTemp(data) {
  return request({
    url: '/api/user/active',
    method: 'put',
    data
  })
}

// 重置密码
export function resetPwd(data) {
  return request({
    url: '/api/user/reset_password',
    method: 'put',
    data
  })
}