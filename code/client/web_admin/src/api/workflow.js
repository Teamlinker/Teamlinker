import request from '@/utils/request'

export function getWorkflowList(params){
    return request({
      url: '/api/workflow/list',
      method: 'get',
      params
    })
  }
  export function createWorkflow(data){
    return request({
      url: '/api/workflow/item',
      method: 'post',
      data
    })
  }
  export function editWorkflow(data){
    return request({
      url: '/api/workflow/item',
      method: 'put',
      data
    })
  }
  export function deleteWorkflow(params){
    return request({
      url: '/api/workflow/item',
      method: 'delete',
      params
    })
  }
  export function workflowDetail(params){
    return request({
      url: '/api/workflow/info',
      method: 'get',
      params
    })
  }
  export function addNode(data){
    return request({
      url: '/api/workflow/node',
      method: 'post',
      data
    })
  }
  export function editNode(data){
    return request({
      url: '/api/workflow/node',
      method: 'put',
      data
    })
  }
  export function deleteNode(params){
    return request({
      url: '/api/workflow/node',
      method: 'delete',
      params
    })
  }
  export function addAction(data){
    return request({
      url: '/api/workflow/action',
      method: 'post',
      data
    })
  }
  export function editAction(data){
    return request({
      url: '/api/workflow/action',
      method: 'put',
      data
    })
  }