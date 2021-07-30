import { IServer_Common_Config_Mysql } from './../types/config';

import "reflect-metadata"
import * as mysql from "mysql2"
import {Pool as PromisePool} from "mysql2/promise"
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
            queueLimit: 0
        })
        this.sql=con.promise();
        g_mysqlConnection=this;
    }
    async execute<T>(sqlText:string,returnOne:boolean=false):Promise<T> {
        try{
            let [rows]=await this.sql.query(sqlText);
            if(returnOne){
                if((rows as any[]).length>0){
                    return rows[0]
                } else {
                    return null;
                }
            } else {
                return <T><unknown>rows
            }

        } catch(err){
            return null
        }
    }
}