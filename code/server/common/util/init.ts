import { Log } from './../log/log';
import Nacos from "../nacos/nacos"
import { Redis } from "../cache/redis";
import { IServer_Common_Config_Base } from "../types/config";
import Mysql from "../../common/db/mysql"
export async function init<T extends IServer_Common_Config_Base>() {
    new Log()
    let nacos=new Nacos<T>(process.env.nacosUrl,Number(process.env.nacosPort),process.env.nacosName,process.env.nacosId,process.env.nacosUsername,process.env.nacosPassword ,process.env.nacosNamespace)
    await nacos.init()
    new Redis(nacos.redisInfo)
    new Mysql(nacos.mysqlInfo)
}