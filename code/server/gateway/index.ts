import * as child_process from "child_process";
import * as path from "path";
import Application, { ECommon_Application_Mode } from "../common/app/app";
import GateWay from "./app/app";
var application = new GateWay()
application.start((app)=>{
    if(Application.mode!=ECommon_Application_Mode.MICRO) {
        var childUser=child_process.fork(Application.debug?"../user/dist/server/user/index.js":path.join(__dirname,"../../../../user/dist/server/user/index.js"),["--name","user"])
        var childCooperation=child_process.fork(Application.debug?"../cooperation/dist/server/cooperation/index.js":path.join(__dirname,"../../../../cooperation/dist/server/cooperation/index.js"),["--name","cooperation"])
        var childFile=child_process.fork(Application.debug?"../file/dist/server/file/index.js":path.join(__dirname,"../../../../file/dist/server/file/index.js"),["--name","file"])
        process.on("SIGTERM",()=>{
            console.log("exit")
            childUser.kill();
            childCooperation.kill();
            childFile.kill();
            process.exit(0)
        })
        process.on("SIGINT",()=>{
            console.log("exit")
            childUser.kill();
            childCooperation.kill();
            childFile.kill();
            process.exit(0)
        })
    }
});


   
