import Mysql from "../../common/db/mysql";
import {Redis} from "../cache/redis";
import {getConfigInstance} from '../config/config';
import {IServer_Common_Config_Base} from "../types/config";
import {Log} from './../log/log';

export async function init<T extends IServer_Common_Config_Base>() {
    new Log()
    new Redis(getConfigInstance().redisInfo)
    new Mysql(getConfigInstance().mysqlInfo)
}