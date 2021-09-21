
import { IServer_Common_Config_Mysql } from './../types/config';

import "reflect-metadata"
import * as mysql from "mysql2"
import {Pool as PromisePool} from "mysql2/promise"
import { Err } from '../../../common/status/error';
var g_mysqlConnection:InstanceType<typeof Mysql>
export function getMysqlInstance(){
    return g_mysqlConnection;
}

export default class Mysql {
    private sql:PromisePool;
    constructor(info:IServer_Common_Config_Mysql){
        let con=mysql.createPool({
            host:info.url,
            port:info.port,
            user:info.username,
            password:info.password,
            database:info.database,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0,
            supportBigNumbers:true,
            bigNumberStrings:true
        })
        this.sql=con.promise();
        g_mysqlConnection=this;
    }
    async executeOne<T>(sqlText:string|{
        value:string,
        type:T
    }):Promise<T> {
        try{
            let [rows]=await this.sql.query(typeof(sqlText)=="string"?sqlText:sqlText.value);
            if((rows as any[]).length>0){
                return rows[0]
            } else {
                return null;
            }

        } catch(err){
            console.error("mysql error:",err,sqlText)
            throw Err.Common.mysqlError
        }
    }
    async execute<T>(sqlText:string|{
        value:string,
        type:T
    }):Promise<T[]> {
        try{
            let [rows]=await this.sql.query(typeof(sqlText)=="string"?sqlText:sqlText.value);
            return <T[]><unknown>rows

        } catch(err){
            console.error("mysql error:",err,sqlText)
            throw Err.Common.mysqlError
        }
    }
}