import {ECommon_Application_Mode, ECommon_Services} from "../types";
import {ECommon_HttpApi_Method} from "./types";

const api={
    baseUrl:"/gateway",
    service:ECommon_Services.GateWay,
    routes:{
        needConfig:{
            method:ECommon_HttpApi_Method.GET,
            path:"/needconfig",
            req:<{
                              
            }>{},
            res:<number>{},
            ignoreValidate:true
        },
        editConfig:{
            method:ECommon_HttpApi_Method.POST,
            path:"/config",
            req:<{
                dbUrl:string,
                dbPort?:number,
                dbDatabase?:string,
                dbUsername?:string,
                dbPassword?:string       
            }>{},
            res:{},
            ignoreValidate:true
        },
        deployInfo:{
            method:ECommon_HttpApi_Method.GET,
            path:"/deploy",
            req:{},
            res:<{
                type:ECommon_Application_Mode
            }>{},
            ignoreValidate:true
        },
        wechatAppId:{
            method:ECommon_HttpApi_Method.GET,
            path:"/wechat/appid",
            req:{},
            res:<{
                appId:string
            }>{},
            ignoreValidate:true
        }
    }
}

export default api