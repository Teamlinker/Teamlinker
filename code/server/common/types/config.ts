export interface IServer_Common_Config_Base {
    
}

export interface IServer_Common_Config_Redis {
    url:string,
    port:number,
    db:number,
    password?:string
}

export interface IServer_Common_Config_Mysql {
    url:string,
    port:number,
    database:string,
    username:string,
    password:string
}

export enum EServer_Common_Config_Services {
    GateWay="gateway",
    User="user"
}

export interface IServer_Common_Config {
    services:{
        [name:string]:any
    }
    redis:IServer_Common_Config_Redis
    mysql:IServer_Common_Config_Mysql
}
