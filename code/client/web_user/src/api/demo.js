import axios from '@/plugins/axios'

const Api = {
    tableList: '/demo/tableList',
}
/**
 * @description: 测试可拖拽表单
 */

 export function getTableList(data) {
    return axios({
        url: Api.tableList,
        method: 'post',
        data
    })
  }