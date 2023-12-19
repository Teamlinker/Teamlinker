import * as fs from "fs-extra";
import Application from "../../common/app/app";
import {ECommon_Application_Mode} from "../../../common/types";

export class GateWayService  {
    static async needConfig() {
        if(Application.mode===ECommon_Application_Mode.OFFLINE && (!Application.privateConfig.mysql || !Application.privateConfig.mysql.url)) {
            return 1
        } else {
            return 0;
        }
    }

    static async editConfig(dbUrl:string,dbPort:number,dbDatabase:string,dbUsername:string,dbPassword:string) {
        Application.privateConfig.mysql={
            url:dbUrl,
            port:dbPort,
            database:dbDatabase,
            username:dbUsername,
            password:dbPassword
        }
        fs.writeFileSync(Application.configPath,JSON.stringify(Application.privateConfig))
        
    }
}