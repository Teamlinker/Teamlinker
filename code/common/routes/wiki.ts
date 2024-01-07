import {ECommon_Services} from "../types";
import {ECommon_HttpApi_Method} from "./types";
import {Permission_Types} from "../permission/permission";
import {ICommon_Model_Wiki} from "../model/wiki";
import {
    ICommon_Route_Res_Global_Search_Wiki_Item,
    ICommon_Route_Res_Role_Item,
    ICommon_Route_Res_Role_List,
    ICommon_Route_Res_Role_ListMember,
    ICommon_Route_Res_userWikiList,
    ICommon_Route_Res_Wiki_Info,
    ICommon_Route_Res_Wiki_Item_Filter,
    ICommon_Route_Res_Wiki_Item_Info
} from "./response";
import {ICommon_Model_Wiki_Item} from "../model/wiki_item";
import {ECommon_Model_Organization_Member_Type} from "../model/organization";
import {ICommon_Model_Role} from "../model/role";
import {ICommon_Model_Content} from "../model/content";

const api= {
    baseUrl: "/wiki",
    service: ECommon_Services.Wiki,
    routes: {
        recentWikiList: {
            method: ECommon_HttpApi_Method.GET,
            path: "/recent/list",
            req: <{

            }>{},
            res: <ICommon_Model_Wiki[]>{},
            permission: [Permission_Types.Organization.READ]
        },
        userWikiList: {
            method: ECommon_HttpApi_Method.GET,
            path: "/user/list",
            req: <{
                keyword?:string,
                page:number,
                size:number,
                type:"all"|"created"|"joined",
                sort?:"name"|"created_time"
            }>{},
            res: <ICommon_Route_Res_userWikiList>{},
            permission: [Permission_Types.Organization.READ]
        },
        list: {
            method: ECommon_HttpApi_Method.GET,
            path: "/list",
            req: <{
                keyword?:string,
                page:number,
                size:number,
                organizationUserId?:string
            }>{},
            res: <ICommon_Route_Res_userWikiList>{},
            permission: [Permission_Types.Organization.READ]
        },
        addWiki: {
            method: ECommon_HttpApi_Method.POST,
            path: "/recent/list",
            req: <{
                name :string,
                photo? :string,
                description? :string
            }>{},
            res: <ICommon_Model_Wiki>{},
            permission: [Permission_Types.Organization.CREATE_WIKI]
        },
        editWiki: {
            method: ECommon_HttpApi_Method.PUT,
            path: "/recent/list",
            req: <{
                wikiId:string,
                name? :string,
                photo? :string,
                description? :string,
            }>{},
            res: <ICommon_Model_Wiki>{},
            permission: [Permission_Types.Wiki.EDIT]
        },
        deleteWiki: {
            method: ECommon_HttpApi_Method.DELETE,
            path: "/recent/list",
            req: <{
                wikiId:string
            }>{},
            res: {},
            permission: [Permission_Types.Wiki.ADMIN]
        },
        wikiInfo: {
            method: ECommon_HttpApi_Method.GET,
            path: "/info",
            req: <{
                wikiId:string,
                keyword?:string
            }>{},
            res: <ICommon_Route_Res_Wiki_Info>{},
            permission: [Permission_Types.Wiki.READ]
        },
        addWikiItem: {
            method: ECommon_HttpApi_Method.POST,
            path: "/item",
            req: <{
                wikiId:string,
                name:string,
                parentWikiItemId?:string
            }>{},
            res: <ICommon_Model_Wiki_Item>{},
            permission: [Permission_Types.Wiki.EDIT]
        },
        editWikiItem: {
            method: ECommon_HttpApi_Method.PUT,
            path: "/item",
            req: <{
                wikiItemId:string,
                name:string
            }>{},
            res: <ICommon_Model_Wiki_Item>{},
            permission: [Permission_Types.Wiki.EDIT]
        },
        deleteWikiItem: {
            method: ECommon_HttpApi_Method.DELETE,
            path: "/item",
            req: <{
                wikiItemId:string,
                isChildren:boolean
            }>{},
            res: {},
            permission: [Permission_Types.Wiki.EDIT]
        },
        moveWikiItem: {
            method: ECommon_HttpApi_Method.PUT,
            path: "/item/move",
            req: <{
                wikiItemId:string,
                newWikiItemId:string,
                action:"up"|"down"|"child"
            }>{},
            res: <ICommon_Route_Res_Wiki_Info>{},
            permission: [Permission_Types.Wiki.EDIT]
        },
        listRole: {
            method: ECommon_HttpApi_Method.GET,
            path: "/role/list",
            req: <{
                wikiId?:string
            }>{},
            res: <ICommon_Route_Res_Role_List>{},
            permission: [Permission_Types.Wiki.READ]
        },
        addRole: {
            method: ECommon_HttpApi_Method.POST,
            path: "/role",
            req: <{
                wikiId?:string,
                name :string,
                description?:string,
                value:number
            }>{},
            res: <ICommon_Route_Res_Role_Item>{},
            permission: [Permission_Types.Wiki.ADMIN]
        },
        editRole: {
            method: ECommon_HttpApi_Method.PUT,
            path: "/role",
            req: <{
                roleId:string,
                name?:string,
                description?:string,
                value?:number
            }>{},
            res: <ICommon_Route_Res_Role_Item>{},
            permission: [Permission_Types.Wiki.ADMIN]
        },
        removeRole: {
            method: ECommon_HttpApi_Method.DELETE,
            path: "/role",
            req: <{
                roleId:string,
            }>{},
            res: {},
            permission: [Permission_Types.Wiki.ADMIN]
        },
        getPermission: {
            method: ECommon_HttpApi_Method.GET,
            path: "/permission",
            req: <{
                wikiId:string
            }>{},
            res: <{
                value:number
            }>{},
            permission: [Permission_Types.Wiki.READ]
        },
        saveItemContent: {
            method: ECommon_HttpApi_Method.PUT,
            path: "/item/content",
            req: <{
                wikiItemId:string,
                content:string
            }>{},
            res: {},
            permission: [Permission_Types.Wiki.EDIT]
        },
        getItemContent: {
            method: ECommon_HttpApi_Method.GET,
            path: "/item/content",
            req: <{
                wikiItemId:string
            }>{},
            res: <ICommon_Model_Content>{},
            permission: [Permission_Types.Wiki.READ]
        },
        listMember: {
            method: ECommon_HttpApi_Method.GET,
            path: "/member/list",
            req: <{
                wikiId:string,
                memberType:ECommon_Model_Organization_Member_Type,
                page?:number,
                size?:number,
                key?:string
            }>{},
            res: <ICommon_Route_Res_Role_ListMember>{},
            permission: [Permission_Types.Wiki.READ]
        },
        addMember: {
            method: ECommon_HttpApi_Method.POST,
            path: "/member/item",
            req: <{
                wikiId:string,
                memberId?:string,
                type:ECommon_Model_Organization_Member_Type,
                roleId:string
            }>{},
            res: <ICommon_Model_Role>{},
            permission: [Permission_Types.Wiki.ADMIN]
        },
        editMember: {
            method: ECommon_HttpApi_Method.PUT,
            path: "/member/item",
            req: <{
                wikiId:string,
                memberId?:string,
                type:ECommon_Model_Organization_Member_Type,
                roleId:string
            }>{},
            res: <ICommon_Model_Role>{},
            permission: [Permission_Types.Wiki.ADMIN]
        },
        removeMember: {
            method: ECommon_HttpApi_Method.DELETE,
            path: "/member/item",
            req: <{
                wikiId:string,
                memberId?:string,
                type:ECommon_Model_Organization_Member_Type,
            }>{},
            res: {},
            permission: [Permission_Types.Wiki.ADMIN]
        },
        wikiItemInfo: {
            method: ECommon_HttpApi_Method.GET,
            path: "/item/info",
            req: <{
                wikiItemId:string,
            }>{},
            res: <ICommon_Route_Res_Wiki_Item_Info>{},
            permission: [Permission_Types.Wiki.READ]
        },
        filterWikiItem:{
            method: ECommon_HttpApi_Method.GET,
            path: "/item/filter",
            req: <{
                wikiId?:string,
                name?:string,
                size:number,
                page:number
            }>{},
            res: <ICommon_Route_Res_Wiki_Item_Filter>{},
            permission: [Permission_Types.Organization.READ]
        },
        globalSearchWikiItem:{
            method:ECommon_HttpApi_Method.GET,
            path:"/global/wikiitem",
            req:<{
                keyword:string,
                size:number
            }>{},
            res:<ICommon_Route_Res_Global_Search_Wiki_Item[]>{},
            permission:[Permission_Types.Organization.READ]
        }
    }
}
export  default  api