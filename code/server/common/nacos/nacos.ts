import { IServer_Common_Config_Mysql } from './../types/config';
import { IServer_Common_Nacos_Instance_List } from './../types/nacos';
import {IServer_Common_Config,IServer_Common_Config_Redis,IServer_Common_Config_Base} from "../types/config"
import * as nacos from "nacos"
import got from "got"
const NacosConfigClient=nacos.NacosConfigClient
const NacosNamingClient=(<any>nacos).NacosNamingClient
var g_nacos:InstanceType<typeof Nacos>;
export function getNacosInstance() {
    return g_nacos;
}
export default class Nacos<T extends IServer_Common_Config_Base> {
    private client:any
    private config:InstanceType<typeof NacosConfigClient>
    private name:string
    private objConfigCurrent:T
    private configName:string
    private objConfig:IServer_Common_Config
    private nacosUrl:string
    private nacosPort:number
    constructor(url:string,port:number,name:string,configName:string,logger=console)
    {
        this.nacosUrl=url;
        this.nacosPort=port
        this.name=name
        this.configName=configName
        this.client=new NacosNamingClient({
            logger,
            serverList:`${url}:${port}`,
            namespace:"public"
        })
        this.config=new NacosConfigClient({
            serverAddr:`${url}:${port}`
        })
        g_nacos=this;
    }
    async init(){
        const content= await this.config.getConfig(this.configName, 'DEFAULT_GROUP');
        const obj=JSON.parse(content)
        this.objConfig=obj
        this.objConfigCurrent=this.objConfig.services[this.name]
        await this.client.ready()
        await this.client.registerInstance(this.name, {
            ip: this.objConfigCurrent.ip || '127.0.0.1',
            port: this.objConfigCurrent.port,
        });
    }
    get configInfo():T {
        return this.objConfigCurrent
    }
    get redisInfo():IServer_Common_Config_Redis {
        return this.objConfig.redis
    }
    get mysqlInfo():IServer_Common_Config_Mysql {
        return this.objConfig.mysql
    }
    async getInstances():Promise<IServer_Common_Nacos_Instance_List> {
        let services=this.objConfig.services
        let arrPromise=[]
        for(let key in services){
            arrPromise.push(got(`http://${this.nacosUrl}:${this.nacosPort}/nacos/v1/ns/instance/list?serviceName=${key}&healthyOnly=true`))
        }
        try {
            let arrRes=await Promise.all(arrPromise)
            let ret=<IServer_Common_Nacos_Instance_List>{}
            arrRes.forEach(function(obj){
                let body=JSON.parse(obj.body)
                if(body && body.hosts && body.hosts.length>0)
                {
                    ret[body.dom]=[]
                    let ele=ret[body.dom]
                    body.hosts.forEach(element => {
                        if(element.valid)
                        {
                            ele.push({
                                ip:element.ip,
                                port:element.port
                            })
                        }
                    });
                }
            })
            return ret
        } catch(err) {
            return null
        }
    }
}

