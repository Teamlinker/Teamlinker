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
    ignoreValidate?:boolean
}

export interface ICommon_HttpApi {
    baseUrl:string,
    service:string,
    routes:{
        [param:string]:ICommon_Http_Route
    }
}