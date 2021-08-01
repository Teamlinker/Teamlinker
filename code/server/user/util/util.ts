import { Redis, } from "../../common/cache/redis";
import Nacos from "../../common/nacos/nacos"
import single from "./single";
import {cacheRedisType} from "../../common/types/cache"
import { IServer_Common_Nacos_Instance_List } from '../../common/types/nacos';
import {IServer_User_Config} from "../types/config"
import {Rpc} from "../../common/rpc/rpc"
import "../rpc/user"
export async function init() {
    let nacos=new Nacos<IServer_User_Config>(process.env.nacosUrl,Number(process.env.nacosPort),process.env.nacosName,process.env.nacosId,process.env.nacosNamespace)
    await nacos.init()
    single.config=nacos.configInfo
    new Redis(nacos.redisInfo);
}