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
        if(token){
            config.headers.Authorization =  'Bearer ' + token;
        }
        return config
    },
    function (error) {
        return Promise.reject(error)
    }
)

_axios.interceptors.response.use(
    function (response) {
        console.log(response,'response')
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
        return Promise.reject(error)
    }
)

export default _axios