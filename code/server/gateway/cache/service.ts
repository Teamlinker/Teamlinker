import { ECommon_Services } from "../../../common/types";
import { REDIS_GATEWAY } from "../../common/cache/keys/gateway";
import { getRedisInstance } from "../../common/cache/redis";
import { getConfigInstance } from '../../common/config/config';
import CommonUtil from "../../common/util/common";

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
        while(Object.keys(ret).length<Object.keys(ECommon_Services).length) {
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
}