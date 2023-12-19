import * as path from "path";
import * as Importer from "@pivvenit/mysql-import";
import {getConfigInstance} from "../common/config/config";

export default async function() {
    let config=getConfigInstance()
    let sqlPath=path.join(__dirname,"0.1.1.sql")
    let importer = new Importer({
        host:config.mysqlInfo.url,
        user:config.mysqlInfo.username,
        password:config.mysqlInfo.password,
        database:config.mysqlInfo.database,
        port:config.mysqlInfo.port,
        charsetNumber:224
    })
    console.log("0.1.1 start")
    await importer.import(sqlPath)
    console.log("0.1.1 end")
}