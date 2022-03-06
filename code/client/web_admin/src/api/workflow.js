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