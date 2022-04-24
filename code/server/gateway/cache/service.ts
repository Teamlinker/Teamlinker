import { REDIS_GATEWAY } from "../../common/cache/keys/gateway";
import { getConfigInstance } from '../../common/config/config';

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
    start(){
        this.handle()
    }
    private async handle(){
        let ret=await this.config.getInstances()
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