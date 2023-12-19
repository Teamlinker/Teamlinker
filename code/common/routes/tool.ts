import {ECommon_Services} from "../types";
import {ECommon_HttpApi_Method} from "./types";
import {ICommon_Model_Sticky_Note} from "../model/sticky_note";
import {ICommon_Route_Res_Photo_item, ICommon_Route_Res_Sticky_Note_Item} from "./response";
import {ICommon_Model_Photo} from "../model/photo";

const api= {
    baseUrl: "/tool",
    service: ECommon_Services.User,
    routes: {
        addNote: {
            method: ECommon_HttpApi_Method.POST,
            path: "/note",
            req: <{
                x:string,
                y:string,
                width:string,
                height:string
            }>{},
            res: <ICommon_Model_Sticky_Note>{},
        },
        editNote:{
            method: ECommon_HttpApi_Method.PUT,
            path: "/note",
            req: <{
                noteId:string,
                content?:string,
                x?:string,
                y?:string,
                width?:string,
                height?:string
            }>{},
            res: <ICommon_Model_Sticky_Note>{},
        },
        removeNote:{
            method: ECommon_HttpApi_Method.DELETE,
            path: "/note",
            req: <{
                noteId:string
            }>{},
            res: {},
        },
        listNote:{
            method: ECommon_HttpApi_Method.GET,
            path: "/note/list",
            req: {},
            res: <ICommon_Route_Res_Sticky_Note_Item[]>{},
        },
        addPhoto: {
            method: ECommon_HttpApi_Method.POST,
            path: "/photo",
            req: <{
                fileId?:string,
                x:string,
                y:string,
                width:string,
                height:string
            }>{},
            res: <ICommon_Model_Photo>{},
        },
        editPhoto:{
            method: ECommon_HttpApi_Method.PUT,
            path: "/photo",
            req: <{
                photoId:string,
                fileId?:string,
                x?:string,
                y?:string,
                width?:string,
                height?:string
            }>{},
            res: <ICommon_Route_Res_Photo_item>{},
        },
        removePhoto:{
            method: ECommon_HttpApi_Method.DELETE,
            path: "/photo",
            req: <{
                photoId:string
            }>{},
            res: {},
        },
        listPhoto:{
            method: ECommon_HttpApi_Method.GET,
            path: "/photo/list",
            req: {},
            res: <ICommon_Route_Res_Photo_item[]>{},
        },

    }
}

export  default  api