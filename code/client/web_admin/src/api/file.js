import request from '@/utils/request'

export function uploadFile(data) {
  return request({
    url: '/api/file/upload',
    method: 'post',
    data,
    type:'upload'
  })
}

export function downFile(params) {
  return request({
    url: '/api/file/item',
    method: 'get',
    params
  })
}

