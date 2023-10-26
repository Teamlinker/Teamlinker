import Mysql from "../../common/db/mysql";
import {Redis} from "../cache/redis";
import {getConfigInstance} from '../config/config';
import {IServer_Common_Config_Base} from "../types/config";
import {Log} from './../log/log';
import {BaseMq} from "../mq/mq";
import {Mail} from "../mail/mail";
import "../i18n/i18n"

export async function init<T extends IServer_Common_Config_Base>() {
    new Log()
    new Redis(getConfigInstance().redisInfo)
    new Mysql(getConfigInstance().mysqlInfo);
    new Mail(getConfigInstance().mailInfo)
    await BaseMq.initChannel(getConfigInstance().mqUri)
}