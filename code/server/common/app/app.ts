import path = require("path");
import os = require("os");
import * as http from "http";
import * as Koa from "koa";
import * as body from 'koa-bodyparser';
import {PassThrough} from "stream";
import * as yargs from "yargs";
import {Err} from "../../../common/status/error";
import {getConfigInstance} from '../config/config';
import {initComponent} from "../decorate/component";
import {IServer_Common_Http_Req_File} from "../types/http";
import CommonUtil from "../util/common";
import {generateHttpErrorResponse} from "../util/http";
import {init} from "../util/init";
import * as fs from "fs";
import {SocketIO} from "../socket/socket";

var pipe = function (from, to): Promise<Buffer> {
    return new Promise(function (resolve) {
        from.pipe(to);
        const originalReqData = [];
        let size = 0;
        to.on("data", function (chunk) {
            originalReqData.push(chunk);
            size += chunk.length;
        })
        to.on("end", function () {
            resolve(Buffer.concat(originalReqData, size));
        })
    })
}
export enum ECommon_Application_Mode {
    ONLINE,
    OFFLINE
}
export default abstract class Application{
    private app=new Koa()
    public static needReset:boolean=false
    public static debug:boolean=false
    public static mode:ECommon_Application_Mode;
    public static teamlinkerPath:string=(os.platform()=="darwin" || os.platform()=="win32")?path.resolve(os.homedir(),"teamlinker-files"):"/opt/teamlinker-files"
    public static configPath:string=path.join(this.teamlinkerPath,"teamlinker.config.json")

    public static privateConfig:{
        "redis":{
            "url":string,
            "port":number,
            "db":number
        },
        "mysql":{
            "url":string,
            "port":number,
            "database":string,
            "username":string,
            "password":string
        },
        "port":number,
        "jwt": string,
        "version":string,
        "mq":string
    }
    Application(){

    }
    async start(mode:ECommon_Application_Mode) {
        let argv=yargs.argv
        if(argv["reset"])
        {
            Application.needReset=true
        }
        if(argv["debug"]) {
            Application.debug=true
            Application.configPath=path.join(__dirname,"../../teamlinker.config.json")
        }

        Application.privateConfig = JSON.parse(fs.readFileSync(Application.configPath,"utf-8"))
        Application.mode = mode
        initComponent()
        await init()
        await this.initKoa();
        let httpServer = http.createServer(this.app.callback())
        let port=getConfigInstance().serverPort
        httpServer.listen(port,async ()=>{
            await SocketIO.start(httpServer)
            await this.config(this.app);
            console.log(`start`);
        })
    }
    async initKoa() {
        this.app.use(async (ctx, next) => {
            ctx.set("Access-Control-Allow-Origin", ctx.get("origin"));
            ctx.set("Access-Control-Allow-Headers", "X-Requested-With");
            ctx.set("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE");
            ctx.set("Access-Control-Allow-Credentials", "true");
            if (ctx.get["access-control-request-headers"]) {
                ctx.set("Access-Control-Allow-Headers", ctx.get("access-control-request-headers"))
            }
            ctx.set("Access-Control-Expose-Headers", "connection,content-length,date,x-powered-by,content-encoding,server,etag,accept-ranges,allow,content-language,set-cookie,doclever-request");
            await next();
        })
        this.app.use(async (ctx, next) => {
            if (ctx.headers['content-type'] && ctx.headers['content-type'].split(';')[0] === 'multipart/form-data') {
                const maxLength = 1024 * 1024 * 5;
                if (ctx.headers && ctx.headers['content-length'] && Number(ctx.headers['content-length']) > maxLength) {
                    ctx.body = generateHttpErrorResponse(Err.Http.overFileSize)
                    return;
                }
                let stream = new PassThrough()
                let ret = await pipe(ctx.req, stream)
                const boundary = `--${ctx.headers['content-type'].split('; ')[1].split('=')[1]}`
                let arr = CommonUtil.parseFormData(ret, boundary);
                let obj = <{
                    [param: string]: string | IServer_Common_Http_Req_File
                }>{}
                for (let o of arr) {
                    if (o.isFile) {
                        obj[o.name] = {
                            data: o.data as Buffer,
                            fileName: o.fileName,
                            size: o.size,
                            md5: o.md5
                        }
                    } else {
                        obj[o.name] = o.data as string
                    }
                }
                ctx.state.formData = obj
                await next();
            } else {
                await next()
            }
        })
        this.app.use(body());
        this.app.use(async (ctx, next) => {
            try {
                await next()
            } catch (err) {
                ctx.body = generateHttpErrorResponse(err.data??err)
            }
        })
    }
    abstract config(app:InstanceType<typeof Koa>);

}
