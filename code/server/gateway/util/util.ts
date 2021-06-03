import { CacheService } from './../cache/service';
import { IServer_GateWay_Config } from "types/config";
import { Redis, } from "../../common/cache/redis";
import Nacos from "../../common/nacos/nacos"
import single from "./single";
import {cacheRedisType} from "../../common/types/cache"
import { IServer_Common_Nacos_Instance_List } from '../../common/types/nacos';
export async function init() {
    let nacos=new Nacos<IServer_GateWay_Config>(process.env.nacosUrl,Number(process.env.nacosPort),process.env.nacosName,process.env.nacosId)
    await nacos.init()
    single.config=nacos.configInfo
    new Redis(nacos.redisInfo);
    let cacheService=new CacheService(nacos)
    cacheService.start()
}