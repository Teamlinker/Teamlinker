import {ECommon_Services} from "../types"
import {ECommon_HttpApi_Method} from "./types"
import {ECommon_Model_Finder_Shortcut_Type, ICommon_Model_Finder_Item} from "../model/finder_item";
import {ICommon_Route_Res_Finder_Info} from "./response";
import {Permission_Types} from "../permission/permission";

const api= {
    baseUrl: "/finder",
    service: ECommon_Services.Finder,
    routes: {
        listChild: {
            method: ECommon_HttpApi_Method.GET,
            path: "/list",
            req: <{
                folderId?: string,
                type:"all"|"folder"
            }>{},
            res: <ICommon_Model_Finder_Item[]>{}
        },
        createFile:{
            method: ECommon_HttpApi_Method.POST,
            path: "/create_file",
            req: <{
                parentFolderId?:string,
                name:string
            }>{},
            res: <ICommon_Model_Finder_Item>{}
        },
        linkFile:{
            method: ECommon_HttpApi_Method.POST,
            path: "/link_file",
            req: <{
                fileId: string,
                parentFolderId?:string,
                name:string
            }>{},
            res: <ICommon_Model_Finder_Item>{}
        },
        createShortcut:{
            method: ECommon_HttpApi_Method.POST,
            path: "/create_shortcut",
            req: <{
                itemId: string,
                parentFolderId?:string,
                name:string,
                shortcutType:ECommon_Model_Finder_Shortcut_Type
            }>{},
            res: <ICommon_Model_Finder_Item>{},
            permission: [Permission_Types.Organization.READ]
        },
        createFolder:{
            method: ECommon_HttpApi_Method.POST,
            path: "/create_folder",
            req: <{
                parentFolderId?:string,
                name:string
            }>{},
            res: <ICommon_Model_Finder_Item>{}
        },
        copy:{
            method: ECommon_HttpApi_Method.POST,
            path: "/copy",
            req: <{
                finderItemId:string,
                destParentFolderId?:string
            }>{},
            res: <ICommon_Model_Finder_Item>{}
        },
        move:{
            method: ECommon_HttpApi_Method.POST,
            path: "/move",
            req: <{
                finderItemId:string,
                destParentFolderId?:string
            }>{},
            res: <ICommon_Model_Finder_Item>{}
        },
        delete:{
            method: ECommon_HttpApi_Method.DELETE,
            path: "/delete",
            req: <{
                finderItemId:string
            }>{},
            res: <ICommon_Model_Finder_Item>{}
        },
        rename:{
            method: ECommon_HttpApi_Method.PUT,
            path: "/rename",
            req: <{
                finderItemId:string,
                name:string
            }>{},
            res: <ICommon_Model_Finder_Item>{}
        },
        info:{
            method: ECommon_HttpApi_Method.GET,
            path: "/item",
            req: <{
                finderItemId:string,
            }>{},
            res: <ICommon_Route_Res_Finder_Info>{}
        },
        getFullPath:{
            method: ECommon_HttpApi_Method.GET,
            path: "/full_path",
            req: <{
                finderItemId:string,
            }>{},
            res: <{
                path:string
            }>{}
        },
        search:{
            method: ECommon_HttpApi_Method.GET,
            path: "/search",
            req: <{
                keyword:string,
                folderId?:string
            }>{},
            res: <ICommon_Model_Finder_Item[]>{}
        }
    }
}

export default api