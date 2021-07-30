import { IServer_GateWay_Config } from './../types/config';
import { getRedisInstance, Redis } from '../../common/cache/redis';

import Nacos, { getNacosInstance } from '../../common/nacos/nacos';
import {REDIS_GATEWAY} from "../../common/cache/keys/gateway"
export class CacheService {
    private redis:InstanceType<typeof Redis>
    private timer:NodeJS.Timeout
    private timerCount:number=5000
    private instanceTTL:number=10*1000
    private nacos:InstanceType<typeof Nacos>
    constructor(){
        this.nacos=getNacosInstance();
        this.redis=getRedisInstance()
    }
    start(){
        this.handle()
    }
    private async handle(){
        let ret=await this.nacos.getInstances()
        for(let key in ret) {
            let obj=ret[key]
            let objRedis=REDIS_GATEWAY.instance(key)
            await objRedis.set(obj,this.instanceTTL)
        }
        this.timer=setTimeout(this.handle.bind(this),this.timerCount)
    }
    stop(){
        if(this.timer)
        {
            clearTimeout(this.timer)
            this.timer=null
        }
    }
}