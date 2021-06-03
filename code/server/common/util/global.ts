import { g_mysqlConnection, g_nosqlConnection } from './../db/init';
import {g_redis} from "../cache/redis"
export function getRedisInstance(){
    return g_redis;
}

export function getMysqlInstance(){
    return g_mysqlConnection;
}

export function getNosqlInstance(){
    return g_nosqlConnection;
}