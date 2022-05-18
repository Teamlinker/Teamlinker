import got from 'got';
import { ECommon_Services } from "../../../common/types";
import { REDIS_GATEWAY } from "../../common/cache/keys/gateway";
import { getRedisInstance } from "../../common/cache/redis";
import { getConfigInstance } from '../../common/config/config';
import CommonUtil from "../../common/util/common";
import { IServer_Common_Nacos_Instance, IServer_Common_Nacos_Instance_List } from './../../common/types/nacos';

export class CacheService {
    private timer:NodeJS.Timeout
    private timerCount:number=5000
    private instanceTTL:number=10*1000
    private config:ReturnType<typeof getConfigInstance>
    private instanceMap:{
        [param:string]:string
    }={}
    constructor(){
        this.config=getConfigInstance();
    }
    async start(){
        let redis=getRedisInstance()
        await redis.flush();
        await this.handle()
    }
    private async handle(){
        let ret=await this.config.getInstances()
        while(!await this.checkHealth(ret)) {
            await CommonUtil.sleep(100)
            ret=await this.config.getInstances()
        }
        this.instanceMap={}
        for(let key in ret) {
            let obj=ret[key]
            this.instanceMap[key]=obj[0].ip
            let objRedis=await REDIS_GATEWAY.instances(key)
            await objRedis.set(obj,this.instanceTTL)
        }
        this.timer=setTimeout(this.handle.bind(this),this.timerCount)
    }
    private getInstanceMap() {
        return this.instanceMap
    }
    stop(){
        if(this.timer)
        {
            clearTimeout(this.timer)
            this.timer=null
        }
    }
    private async checkHealth(instances:IServer_Common_Nacos_Instance_List):Promise<boolean> {
        if(Object.keys(instances).length<Object.keys(ECommon_Services).length) {
            return false
        } else {
            let arr:IServer_Common_Nacos_Instance[]=[]
            for(let instanceName in instances) {
                if(instanceName.toLowerCase()!="gateway") {
                    let arrInstance=instances[instanceName]
                    if(arrInstance.length==0) {
                        return false;
                    } else {
                        arr.push(arrInstance[0])
                    }
                }
            }
            let arrPromise=[]
            for(let obj of arr) {
                arrPromise.push(got(`http://${obj.ip}:${obj.port}/healthcheck`))
            }
            try {
                let ret=await Promise.all(arrPromise)
                for(let obj of ret) {
                    if(obj.body!="ok") {
                        return false;
                    }
                }
                return true;
            } catch (err) {
                return false;
            }
            
        }
    }
}