import * as log from "log4js"
import * as path from "path"
import * as os from "os"
export class Log {
    constructor() {
        var config={
            appenders:{
                console:{
                    type:"console"
                },
                file:{
                    type: 'file',
                    filename:path.resolve(os.homedir(),`teamlinker-log/${process.env.nacosNamespace}`,`teamlinker.log`),
                    maxLogSize:200*1024*1024,
                    encoding : 'utf-8'
                }
            },
            categories:{
                default:{
                    appenders:["console","file"],
                    level:"all"
                },
            }
        }
        log.configure(config)
        let logger=log.getLogger();
        console.info=console.log=logger.info.bind(logger)
        console.warn=console.warn.bind(logger)
        console.error=console.error.bind(logger)
    }
}