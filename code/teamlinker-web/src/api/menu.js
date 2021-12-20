import axios from '@/plugins/axios'

const Api = {
    adminMenus: '/admin/menus',
    GetBtnCodeListByUserId : '/getBtnCodeListByUserId'
}
/**
 * @description: 根据用户id获取用户菜单
 */

 export function adminMenus(data) {
    return axios({
        url: Api.adminMenus,
        method: 'post',
        data
    })
  }