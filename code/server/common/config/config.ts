import Application from "../app/app";
import {IServer_Common_Config_Mysql, IServer_Common_Config_Redis} from "../types/config";

class Config {
    constructor() {
        
    }
    get version():string {
        return Application.privateConfig.version
    }
    get serverPort():number {
        return Application.privateConfig.port
    }

    get redisInfo():IServer_Common_Config_Redis {
        return Application.privateConfig.redis
    }
    get mysqlInfo():IServer_Common_Config_Mysql {
        return Application.privateConfig.mysql
    }
    get jwt():string {
        return  Application.privateConfig.jwt
    }
    get mqUri():string {
        return Application.privateConfig.mq
    }
}
var g_config:InstanceType<typeof Config>
export function getConfigInstance() {
    if(!g_config) {
        g_config=new Config
    }
    return g_config;
}