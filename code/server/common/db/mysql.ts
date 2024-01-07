import * as mysql from "mysql2";
import {Pool as PromisePool} from "mysql2/promise";
import "reflect-metadata";
import {Err} from '../../../common/status/error';
import {IServer_Common_Config_Mysql} from './../types/config';

var g_mysqlConnection:InstanceType<typeof Mysql>
export function getMysqlInstance(){
    return g_mysqlConnection;
}

export default class Mysql {
    private sql:PromisePool;
    constructor(info:IServer_Common_Config_Mysql){
        if(info.url) {
            let con=mysql.createPool({
                host:info.url,
                port:info.port??3306,
                user:info.username??"",
                password:info.password??"",
                database:info.database??"",
                waitForConnections: true,
                connectionLimit: 10,
                queueLimit: 0,
                supportBigNumbers:true,
                bigNumberStrings:true
            })
            this.sql=con.promise();
        }
        g_mysqlConnection=this;
    }
    async reload(info:IServer_Common_Config_Mysql) {
        if(info.url) {
            let con=mysql.createPool({
                host:info.url,
                port:info.port??3306,
                user:info.username??"",
                password:info.password??"",
                database:info.database??"",
                waitForConnections: true,
                connectionLimit: 10,
                queueLimit: 0,
                supportBigNumbers:true,
                bigNumberStrings:true
            })
            this.sql=con.promise();
        }
    }
    async executeOne<T>(sqlText:string|{
        value:string,
        type:T,
        aggregation?:{
            [key:string]:string
        }
    }):Promise<T> {
        try{
            if(!this.sql) {
                throw Err.Common.mysqlNotConfig
            }
            let [rows]=await this.sql.query(typeof(sqlText)=="string"?sqlText:sqlText.value);
            if((rows as any[]).length>0){
                if(typeof(sqlText)=="string" || !sqlText.aggregation)
                {
                    return rows[0]
                } else {
                    let aggregation=sqlText.aggregation
                    let item=rows[0]
                    let ret={}
                    for(let key in item) {
                        if(key.startsWith("_")) {
                            let table=key.substring(1,key.indexOf("__"))
                            if(table in aggregation) {
                                if(aggregation[table]) {
                                    if(!(aggregation[table] in ret) || typeof(ret[aggregation[table]])!="object"){
                                        ret[aggregation[table]]={}
                                    }
                                    ret[aggregation[table]][key.substr(table.length+3)]=item[key]
                                } else {
                                    ret[key.substr(table.length+3)]=item[key]
                                }
                            }
                        } else {
                            ret[key]=item[key]
                        }
                    }
                    for(let key in ret) {
                        let obj=ret[key]
                        if(typeof(obj)==="object") {
                            let set=new Set
                            for(let k in obj) {
                                set.add(obj[k])
                            }
                            if(set.size==1 && set.has(null)) {
                                delete ret[key]
                            }
                        }
                    }
                    return ret as any;
                }
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
        type:T,
        aggregation?:{
            [key:string]:string
        }
    }):Promise<T[]> {
        try{
            if(!this.sql) {
                throw Err.Common.mysqlNotConfig
            }
            let [rows]=await this.sql.query(typeof(sqlText)=="string"?sqlText:sqlText.value);
            if(typeof(sqlText)=="string" || !sqlText.aggregation)
            {
                return <T[]><unknown>rows
            } else {
                let aggregation=sqlText.aggregation
                rows=(<T[]><unknown>rows).map(item=>{
                    let ret={}
                    for(let key in item) {
                        if(key.startsWith("_")) {
                            let table=key.substring(1,key.indexOf("__"))
                            if(table in aggregation) {
                                if(aggregation[table]) {
                                    if(!(aggregation[table] in ret) || typeof(ret[aggregation[table]])!="object"){
                                        ret[aggregation[table]]={}
                                    }
                                    ret[aggregation[table]][key.substr(table.length+3)]=item[key]
                                } else {
                                    ret[key.substr(table.length+3)]=item[key]
                                }
                            }
                        } else {
                            ret[key as any]=item[key]
                        }
                    }
                    for(let key in ret) {
                        let obj=ret[key]
                        if(typeof(obj)==="object") {
                            let set=new Set
                            for(let k in obj) {
                                set.add(obj[k])
                            }
                            if(set.size==1 && set.has(null)) {
                                delete ret[key]
                            }
                        }
                    }
                    return ret as any;
                })
                return <T[]><unknown>rows
            }
        } catch(err){
            console.error("mysql error:",err,sqlText)
            throw Err.Common.mysqlError
        }
    }
}