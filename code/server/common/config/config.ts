import Application from "../app/app";
import { getNacosInstance } from "../nacos/nacos";
import { IServer_Common_Config_Mysql, IServer_Common_Config_Redis, IServer_Common_Global_Config } from "../types/config";
import { IServer_Common_Nacos_Instance_List } from "../types/nacos";
import { ECommon_Application_Mode } from './../app/app';

class Config {
    configObj:typeof Application.privateConfig["services"][string]
    constructor() {
        
    }
    get version():string {
        return Application.mode!=ECommon_Application_Mode.MICRO?Application.privateConfig.version: getNacosInstance().version;
    }
    get serviceName():string {
        return Application.mode!=ECommon_Application_Mode.MICRO?Application.serviceName: getNacosInstance().serviceName;
    }
    get serverPort():number {
        return Application.mode!=ECommon_Application_Mode.MICRO?Application.currentConfigObj.port: getNacosInstance().serverPort;
    }
    get rpcServer():boolean {
        return Application.mode!=ECommon_Application_Mode.MICRO?Application.currentConfigObj.rpcServer: getNacosInstance().rpcServer;
    }
    get globalConfig():IServer_Common_Global_Config {
        return Application.mode!=ECommon_Application_Mode.MICRO?Application.currentConfigObj.global as any: getNacosInstance().globalConfig;
    }

    get redisInfo():IServer_Common_Config_Redis {
        return Application.mode!=ECommon_Application_Mode.MICRO?Application.privateConfig.redis: getNacosInstance().redisInfo;
    }
    get mysqlInfo():IServer_Common_Config_Mysql {
        return Application.mode!=ECommon_Application_Mode.MICRO?Application.privateConfig.mysql: getNacosInstance().mysqlInfo;
    }

    async getInstances():Promise<IServer_Common_Nacos_Instance_List> {
        if(Application.mode!=ECommon_Application_Mode.MICRO) {
            let obj=<IServer_Common_Nacos_Instance_List>{}
            for(let serviceName in Application.privateConfig.services) {
                let service=Application.privateConfig.services[serviceName]
                obj[serviceName]=[{
                    port:service.port,
                    name:serviceName,
                    ip:"127.0.0.1"
                }]
            }
            return obj;
        } else {
            return await getNacosInstance().getInstances()
        }
    }
}
var g_config:InstanceType<typeof Config>
export function getConfigInstance() {
    if(!g_config) {
        g_config=new Config
    }
    return g_config;
}