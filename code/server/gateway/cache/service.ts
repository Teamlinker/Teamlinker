import { REDIS_GATEWAY } from "../../common/cache/keys/gateway";
import { getRedisInstance, Redis } from '../../common/cache/redis';
import Nacos, { getNacosInstance } from '../../common/nacos/nacos';

export class CacheService {
    private redis:InstanceType<typeof Redis>
    private timer:NodeJS.Timeout
    private timerCount:number=5000
    private instanceTTL:number=10*1000
    private nacos:InstanceType<typeof Nacos>
    private instanceMap:{
        [param:string]:string
    }={}
    constructor(){
        this.nacos=getNacosInstance();
        this.redis=getRedisInstance()
    }
    start(){
        this.handle()
    }
    private async handle(){
        let ret=await this.nacos.getInstances()
        this.instanceMap={}
        for(let key in ret) {
            let obj=ret[key]
            this.instanceMap[key]=obj[0].ip
            let objRedis=REDIS_GATEWAY.instances(key)
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