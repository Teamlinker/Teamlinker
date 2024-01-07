import * as log from "log4js"
import * as os from "os"
import * as path from "path"

export class Log {
    constructor() {
        let filePath=path.resolve(os.homedir(),`teamlinker-log/teamlinker.log`)
        var config={
            appenders:{
                console:{
                    type:"console"
                },
                file:{
                    type: 'file',
                    filename:filePath,
                    maxLogSize:200*1024*1024,
                    encoding : 'utf-8'
                },
            
            },
            categories:{
                default:{
                    appenders:["console","file"],
                    level:"all"
                },
                teamlinker:{
                    appenders:["console","file"],
                    level:"all"
                }
            }
        }
        log.configure(config)
        let logger=log.getLogger("teamlinker");
        console.info=console.log=logger.info.bind(logger)
        console.warn=logger.warn.bind(logger)
        console.error=logger.error.bind(logger)    
    }
}