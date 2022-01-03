
import request from '@/utils/request'
export function getList(params) {
  return request({
    url: '/api/issuetype/list',
    method: 'get',
    params
  })
}

export function viewTemp(params) {
  return request({
    url: '/api/issuetype/item',
    method: 'get',
    params
  })
}

export function createTemp(data) {
  return request({
    url: '/api/issuetype/item',
    method: 'post',
    data
  })
}

export function editTemp(data) {
  return request({
    url: '/api/issuetype/item',
    method: 'put',
    data
  })
}



export function removeTemp(params) {
  return request({
    url: '/api/issuetype/item',
    method: 'delete',
    params
  })
}
