import Application from "../app/app";
import { getNacosInstance } from "../nacos/nacos";
import { IServer_Common_Config_Mysql, IServer_Common_Config_Redis, IServer_Common_Global_Config } from "../types/config";
import { IServer_Common_Nacos_Instance_List } from "../types/nacos";

class Config {
    get version():string {
        return Application.privateMode?Application.privateConfig.version: getNacosInstance().version;
    }
    get serviceName():string {
        return Application.privateMode?Application.serviceName: getNacosInstance().serviceName;
    }
    get serverPort():number {
        return Application.privateMode?Application.currentConfigObj.port: getNacosInstance().serverPort;
    }
    get rpcServer():boolean {
        return Application.privateMode?Application.currentConfigObj.rpcServer: getNacosInstance().rpcServer;
    }
    get globalConfig():IServer_Common_Global_Config {
        return Application.privateMode?Application.currentConfigObj.gloabl as any: getNacosInstance().globalConfig;
    }

    get redisInfo():IServer_Common_Config_Redis {
        return Application.privateMode?Application.privateConfig.redis: getNacosInstance().redisInfo;
    }
    get mysqlInfo():IServer_Common_Config_Mysql {
        return Application.privateMode?Application.privateConfig.mysql: getNacosInstance().mysqlInfo;
    }

    async getInstances():Promise<IServer_Common_Nacos_Instance_List> {
        if(Application.privateMode) {
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
var g_config=new Config
export function getConfigInstance() {
    return g_config;
}