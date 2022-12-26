import {ECommon_Services} from "../types"
import {ECommon_HttpApi_Method} from "./types"
import {Permission_Types} from "../permission/permission";

const api={
    baseUrl:"/file",
    service:ECommon_Services.File,
    routes:{
        upload:{
            method:ECommon_HttpApi_Method.POST,
            path:"/upload",
            req:<{
                file:string                
            }>{},
            res:<{
                id:string
            }>{},
            permission:[Permission_Types.Organization.EDIT]
        },
        getPath:{
            method:ECommon_HttpApi_Method.GET,
            path:"/item",
            req:<{
                fileId:string                
            }>{},
            res:<{
                uri:string
            }>{}
        }
    }
}

export default api