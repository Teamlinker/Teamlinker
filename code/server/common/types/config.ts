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

export interface IServer_Common_Config_Mail {
    "host": string,
    "port": number,
    "user":string,
    "pass":string
}

export interface IServer_Common_Config_Wechat {
    appId:string,
    appSecret:string
}

export interface IServer_Common_Config {
    services:{
        [name:string]:any
    }
    redis:IServer_Common_Config_Redis
    mysql:IServer_Common_Config_Mysql
    version:string
}
export interface IServer_Common_Global_Config {
    jwt:string
}