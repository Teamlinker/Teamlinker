import * as fs from "fs";
import {ECommon_Application_Mode} from "../../common/types";
import * as process from "process";
import * as path from "path";
import * as yargs from "yargs";
import * as util from "util";

(async function (){
    ///(<any>process).pkg=true;
    const exec = util.promisify(require('child_process').exec);
    let argv=yargs.argv
    if(!argv["debug"] && (<any>process).pkg) {
        let mediasoupWorkerPath=path.join(process.cwd(),"mediasoup-worker")
        if(!fs.existsSync(mediasoupWorkerPath)) {
            fs.copyFileSync("/snapshot/dist/server/node_modules/mediasoup/worker/out/Release/mediasoup-worker",mediasoupWorkerPath)
        }
        process.env.MEDIASOUP_WORKER_BIN=mediasoupWorkerPath
        await exec(`chmod a+x ${mediasoupWorkerPath}`)
    }
    const GateWay =await import("./app/app");
    var application = new GateWay.default()
    application.start(ECommon_Application_Mode.OFFLINE);
})()



   
