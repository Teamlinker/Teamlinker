import { ECommon_Services } from "../types"
import { ECommon_HttpApi_Method } from "./types"

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
            res:<string>{}
        },
        getPath:{
            method:ECommon_HttpApi_Method.GET,
            path:"/item",
            req:<{
                fileId:string                
            }>{},
            res:<string>{}
        }
    }
}

export default api