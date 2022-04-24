import Mysql from "../../common/db/mysql";
import Application, { ECommon_Application_Mode } from '../app/app';
import { Redis } from "../cache/redis";
import { getConfigInstance } from '../config/config';
import Nacos from "../nacos/nacos";
import { IServer_Common_Config_Base } from "../types/config";
import { Log } from './../log/log';
export async function init<T extends IServer_Common_Config_Base>() {
    new Log()
    if(Application.mode==ECommon_Application_Mode.MICRO) {
        let nacos=new Nacos<T>(process.env.nacosUrl,Number(process.env.nacosPort),process.env.nacosName,process.env.nacosId,process.env.nacosUsername,process.env.nacosPassword ,process.env.nacosNamespace)
        await nacos.init()
    }
    new Redis(getConfigInstance().redisInfo)
    new Mysql(getConfigInstance().mysqlInfo)
}