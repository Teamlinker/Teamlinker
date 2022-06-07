import { Permission_Base } from "../permission/permission";
import { ECommon_Application_Deploy } from './../types';

export enum ECommon_HttpApi_Method {
    GET="GET",
    POST="POST",
    DELETE="DELETE",
    PUT="PUT"
}

export interface ICommon_Http_Route {
    method:ECommon_HttpApi_Method,
    path:string,
    req:any,
    res:any,
    ignoreValidate?:boolean,
    permission?:Permission_Base[]|{
        data:Permission_Base[],
        delete:boolean
    },
    onlyAdmin?:boolean,
    onlyOn?: ECommon_Application_Deploy
}

export interface ICommon_HttpApi {
    baseUrl:string,
    service:string,
    routes:{
        [param:string]:ICommon_Http_Route
    }
}