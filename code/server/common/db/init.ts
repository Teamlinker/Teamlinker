import "reflect-metadata"
import {Connection, createConnection} from "typeorm"
import * as fs from "fs-extra"
import * as path from "path"
export var g_mysqlConnection:Connection
export var g_nosqlConnection:Connection
export async function createMysqlConnection(ip:string,port:number,username:string,password:string,database:string){
    let files=await fs.readdir(path.join(__dirname,"./model/mysql"))
    let arrCls=[]
    for(let file of files){
        let filePath=path.join(__dirname,"./model/mysql",file)
        let cls=await import(filePath)
        arrCls.push(cls)
    }
    let con=await createConnection({
        type:"mongodb",
        host:ip,
        port:port,
        username:username,
        password:password,
        database:database,
        entities:arrCls,
        synchronize:true,
        logging:false
    })
    g_mysqlConnection=con;
    return con;
}

export async function createNosqlConnection(ip:string,port:number,password:string,database:string) {
    const connection = await createConnection({
        type: "mongodb",
        host: ip,
        port: port,
        database: database,
        password:password,
        synchronize:true,
        logging:false
      });
    g_nosqlConnection=connection
    return connection
}