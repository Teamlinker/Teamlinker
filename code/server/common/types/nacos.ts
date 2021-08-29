
export interface IServer_Common_Nacos_Instance {
    ip:string,
    port:number
}

export type IServer_Common_Nacos_Instance_List = {
    [k:string]:IServer_Common_Nacos_Instance[]
}