import {IServer_Common_RPC_User_CheckSession} from "../../user/types/config";

export enum EServer_Common_Http_Structure_HandleParam_Category {
    Content,
    File,
    Param,
    Header,
    Cookie,
    Context,
    User
}
export interface IServer_Common_Http_Structure_HandleParam {
    name:string,
    index:number,
    type:string,
    defaultValue?:any,
    category:EServer_Common_Http_Structure_HandleParam_Category,
    required?:boolean
}
export interface IServer_Common_Http_Structure {
    method:string,
    path:string,
    ignoreValidate?:boolean,
    handle:(...args: any[]) => any,
    handleParam:IServer_Common_Http_Structure_HandleParam[]
}

export enum EServer_Common_Http_Body_Type {
    NONE,
    URIENCODED,
    JSON,
    FORMDATA,
    BINARY
}

export interface IServer_Common_Http_Proxy {
    status:number,
    path:string,
    method:string,
    headers:{
        [param:string]:string
    },
    data:any,
    bodyType:EServer_Common_Http_Body_Type,
    user?:IServer_Common_RPC_User_CheckSession
}

export interface IServer_Common_Http_Req_File {
    fileName:string,
    data:Buffer,
    md5:string,
    size:number
}