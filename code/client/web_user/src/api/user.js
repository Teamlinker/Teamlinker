import axios from '@/plugins/axios'
export function login(data) {
    return axios({
        url: '/user/login',
        method: 'post',
        data
    })
}

export function logout(params) {
  return axios({
    url: '/user/logout',
    method: 'post',
    params
  })
}


export function getProfile(params) {
  return axios({
    url: '/user/profile',
    method: 'get',
    params
  })
}