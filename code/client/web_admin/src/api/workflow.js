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
  export function solutionList(params){
    return request({
      url: '/api/workflow/solution/list',
      method: 'get',
      params
    })
  }
  export function solutionCreate(data){
    return request({
      url: '/api/workflow/solution/item',
      method: 'post',
      data
    })
  }
  export function solutionUpdate(data){
    return request({
      url: '/api/workflow/solution/item',
      method: 'put',
      data
    })
  }
  export function solutionDelete(params){
    return request({
      url: '/api/workflow/solution/item',
      method: 'delete',
      params
    })
  }
  export function solutionCopy(data){
    return request({
      url: '/api/workflow/solution/copy',
      method: 'post',
      data
    })
  }
  export function solutionBind(data){
    return request({
      url: '/api/workflow/solution/bind',
      method: 'put',
      data
    })
  }
  export function solutionUnBind(data){
    return request({
      url: '/api/workflow/solution/unbind',
      method: 'put',
      data
    })
  }
  export function solutionListWorkflow(params){
    return request({
      url: '/api/workflow/solution/workflow/list',
      method: 'get',
      params
    })
  }
  export function solutionAddWorkflow(data){
    return request({
      url: '/api/workflow/solution/workflow/item',
      method: 'post',
      data
    })
  }
  export function solutionRemoveWorkflow(params){
    return request({
      url: '/api/workflow/solution/workflow/item',
      method: 'delete',
      params
    })
  }
  export function solutionInfo(params){
    return request({
      url: '/api/workflow/solution/item',
      method: 'get',
      params
    })
  }
  export function solutionAssign(data){
    return request({
      url: '/api/workflow/solution/assign',
      method: 'put',
      data
    })
  }
  