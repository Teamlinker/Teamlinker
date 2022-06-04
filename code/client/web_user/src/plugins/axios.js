import axios from "axios";
import { message } from 'ant-design-vue'
import router from '@/router'
let config = {
    baseURL: '/api',
}
const _axios = axios.create(config)

_axios.interceptors.request.use(
    function (config) {
        let token = sessionStorage.getItem('token')
        let orgId = sessionStorage.getItem('orgId')
        if(token){
            config.headers.Authorization =  'Bearer ' + token;
        }
        if(orgId){
            config.headers.organizationid =  orgId;
        }
        return config
    },
    function (error) {
        return Promise.reject(error)
    }
)

_axios.interceptors.response.use(
    function (response) {
        if(response.headers.token){
            sessionStorage.setItem('token',response.headers.token)
        }
        let rdata = null;
        if(response.data.code==0){
            rdata = response.data
        }else{
            let error = response.data.msg || '系统异常';
            message.error(error)
            rdata = Promise.reject(response)
            if(response.data.code===1005){
                sessionStorage.removeItem('token')
                router.push('/login');
            }
        }
        return rdata
    },
    function (error) {
        if (error && error.response) {
            switch (error.response.status) {
                case 400:
                    error.message = '错误请求';
                    break;
                case 401:
                    error.message = '未授权，请重新登录';
                    break;
                case 403:
                    error.message = '拒绝访问';
                    break;
                case 404:
                    error.message = '请求错误,未找到该资源';
                    break;
                case 405:
                    error.message = '请求方法未允许';
                    break;
                case 408:
                    error.message = '请求超时';
                    break;
                case 500:
                    error.message = '服务器端出错';
                    break;
                case 501:
                    error.message = '网络未实现';
                    break;
                case 502:
                    error.message = '网络错误';
                    break;
                case 503:
                    error.message = '服务不可用';
                    break;
                case 504:
                    error.message = '网络超时';
                    break;
                case 505:
                    error.message = 'http版本不支持该请求';
                    break;
                default:
                    error.message = `连接错误${error.response.status}`;
            }
        }
        message.error(error.message)
        return Promise.reject(error)
    }
)

export default _axios