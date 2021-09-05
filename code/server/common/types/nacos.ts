
export interface IServer_Common_Nacos_Instance {
    name:string,
    ip:string,
    port:number
}

export type IServer_Common_Nacos_Instance_List = {
    [k:string]:IServer_Common_Nacos_Instance[]
}