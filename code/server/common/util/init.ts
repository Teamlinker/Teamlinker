import Mysql from "../../common/db/mysql";
import {Redis} from "../cache/redis";
import {getConfigInstance} from '../config/config';
import {IServer_Common_Config_Base} from "../types/config";
import {BaseMq} from "../mq/mq";
import {Mail} from "../mail/mail";
import "../i18n/i18n";

import "../log/log"

export async function init<T extends IServer_Common_Config_Base>() {

    new Redis(getConfigInstance().redisInfo)
    new Mysql(getConfigInstance().mysqlInfo);
    new Mail(getConfigInstance().mailInfo)
    await BaseMq.initChannel(getConfigInstance().mqUri)
}