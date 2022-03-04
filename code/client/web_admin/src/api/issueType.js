
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
export function getIssueSolutionList(params) {
  return request({
    url: '/api/issuetype/solution/list',
    method: 'get',
    params
  })
}
export function solutionCreate(data){
  return request({
    url: '/api/issuetype/solution/item',
    method: 'post',
    data
  })
}
export function solutionEdit(data){
  return request({
    url: '/api/issuetype/solution/item',
    method: 'put',
    data
  })
}
export function solutionDelete(params){
  return request({
    url: '/api/issuetype/solution/item',
    method: 'delete',
    params
  })
}
export function solutionBindProject(data){
  return request({
    url: '/api/issuetype/solution/project',
    method: 'post',
    data
  })
}
export function solutionUnBindProject(params){
  return request({
    url: '/api/issuetype/solution/project',
    method: 'delete',
    params
  })
}
export function solutionAddIssueType(data){
  return request({
    url: '/api/issuetype/solution/issuetype',
    method: 'post',
    data
  })
}
export function solutionRemoveIssueType(params){
  return request({
    url: '/api/issuetype/solution/issuetype',
    method: 'delete',
    params
  })
}
export function solutionProjectList(params){
  return request({
    url: '/api/issuetype/solution/project',
    method: 'get',
    params
  })
}
export function solutionCopy(data){
  return request({
    url: '/api/issuetype/solution/copy',
    method: 'post',
    data
  })
}
