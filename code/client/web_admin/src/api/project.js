/*
 * @Descripttion:
 * @version:
 * @Author: gqwu
 * @Date: 2021-10-09 12:19:05
 * @LastEditors: gqwu
 * @LastEditTime: 2021-12-02 10:19:53
 */
import request from '@/utils/request'

//获取项目列表
export function getList(params) {
  return request({
    url: '/api/project/list',
    method: 'get',
    params
  })
}
// 创建项目
export function createTemp(data) {
  return request({
    url: '/api/project/create',
    method: 'post',
    data
  })
}
// 编辑项目
export function editTemp(data) {
  return request({
    url: '/api/project/edit',
    method: 'post',
    data
  })
}
//查看项目详情
export function viewTemp(params) {
  return request({
    url: '/api/project/basic',
    method: 'get',
    params
  })
}
// 删除项目
export function removeTemp(params) {
  return request({
    url: '/api/project/remove',
    method: 'delete',
    params
  })
}
//获取项目tag列表
export function getTagList(params) {
  return request({
    url: '/api/project/tag/list',
    method: 'get',
    params
  })
}
// 创建项目tag
export function createTagTemp(data) {
  return request({
    url: '/api/project/tag/item',
    method: 'post',
    data
  })
}
// 编辑项目tag
export function editTagTemp(data) {
  return request({
    url: '/api/project/tag/item',
    method: 'put',
    data
  })
}


// 删除tag
export function removeTagTemp(params) {
  return request({
    url: '/api/project/tag/item',
    method: 'delete',
    params
  })
}

//获取项目模块列表
export function getModuleList(params) {
  return request({
    url: '/api/project/module/list',
    method: 'get',
    params
  })
}


// 创建项目模块
export function createModuleTemp(data) {
  return request({
    url: '/api/project/module/item',
    method: 'post',
    data
  })
}
// 编辑项目模块
export function editModuleTemp(data) {
  return request({
    url: '/api/project/module/item',
    method: 'put',
    data
  })
}


// 删除模块
export function removeModuleTemp(params) {
  return request({
    url: '/api/project/module/item',
    method: 'delete',
    params
  })
}

//获取项目成员列表
export function getMemberList(params) {
  return request({
    url: '/api/project/member/list',
    method: 'get',
    params
  })
}


// 创建项目成员
export function createMemberTemp(data) {
  return request({
    url: '/api/project/member/item',
    method: 'post',
    data
  })
}
// 编辑项目成员
export function editMemberTemp(data) {
  return request({
    url: '/api/project/member/item',
    method: 'put',
    data
  })
}


// 删除成员
export function removeMemberTemp(params) {
  return request({
    url: '/api/project/member/item',
    method: 'delete',
    params
  })
}


// 项目成员权限列表

export function projectRoles(params) {
  return request({
    url: '/api/project/roles',
    method: 'get',
    params
  })
}