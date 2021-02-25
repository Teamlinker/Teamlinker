export enum EServer_Common_Http_Structure_HandleParam_Category {
    Param,
    Header,
    Cookie
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
    user?:boolean,
    admin?:boolean,
    handle:(...args: any[]) => any,
    handleParam:IServer_Common_Http_Structure_HandleParam[]
}
