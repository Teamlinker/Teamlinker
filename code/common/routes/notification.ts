import {ECommon_Services} from "../types";
import {ECommon_HttpApi_Method} from "./types";
import {ECommon_Model_Notification_Status, ECommon_Model_Notification_Type} from "../model/notification";
import {ICommon_Route_Res_Notification_Item} from "./response";

const api= {
    baseUrl: "/notification",
    service: ECommon_Services.Notification,
    routes: {
        list: {
            method: ECommon_HttpApi_Method.GET,
            path: "/list",
            req: <{
                types?:ECommon_Model_Notification_Type[],
                page:number,
                size:number,
            }>{},
            res: <ICommon_Route_Res_Notification_Item[]>{}
        },
        unReadCount: {
            method: ECommon_HttpApi_Method.GET,
            path: "/unread",
            req: {},
            res: <{
                count:number
            }>{}
        },
        read: {
            method: ECommon_HttpApi_Method.PUT,
            path: "/read",
            req: <{
                notificationId:string
            }>{},
            res: {}
        },
        setStatus:{
            method: ECommon_HttpApi_Method.PUT,
            path: "/status",
            req: <{
                notificationId:string,
                status:ECommon_Model_Notification_Status
            }>{},
            res: {}
        },
        info:{
            method: ECommon_HttpApi_Method.GET,
            path: "/item",
            req: <{
                notificationId:string
            }>{},
            res: <ICommon_Route_Res_Notification_Item>{}
        },
        remove:{
            method: ECommon_HttpApi_Method.DELETE,
            path: "/item",
            req: <{
                notificationId:string
            }>{},
            res: <ICommon_Route_Res_Notification_Item>{}
        }
    }
}

export default api