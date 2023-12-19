import path = require("path");
import os = require("os");
import * as https from "https";
import * as Koa from "koa";
import * as body from 'koa-bodyparser';
import {PassThrough} from "stream";
import * as yargs from "yargs";
import {getConfigInstance} from '../config/config';
import {initComponent} from "../decorate/component";
import {IServer_Common_Http_Req_File} from "../types/http";
import CommonUtil from "../util/common";
import {generateHttpErrorResponse} from "../util/http";
import {init} from "../util/init";
import * as fs from "fs-extra";
import {SocketIO} from "../socket/socket";
import {ECommon_Application_Mode} from "../../../common/types";

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

export default abstract class Application{
    private app=new Koa()
    public static needReset:boolean=false
    public static debug:boolean=false
    public static mode:ECommon_Application_Mode;
    public static teamlinkerPath:string=(os.platform()=="darwin" || os.platform()=="win32")?path.resolve(os.homedir(),"teamlinker-files"):"/opt/teamlinker-files"
    public static uploadPath=path.join(Application.teamlinkerPath,"upload")
    public static uploadTempPath=path.join(Application.uploadPath,"temp")
    public static configPath:string=path.join(this.teamlinkerPath,"extra.config.json")
    public static certsPath=path.join(this.teamlinkerPath,"certs")
    public static extraConfig:{
        "mysql":{
            "url":string,
            "port":number,
            "database":string,
            "username":string,
            "password":string
        },
        "listenIps": {
            "ip": string,
            "announcedIp": string
        }[],
        "rtcMinPort": number,
        "rtcMaxPort": number
    }
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
        "mq":string,
        "mail":{
            "host": string,
            "port": number,
            "user":string,
            "pass":string
        },
        wechat:{
            appId:string,
            appSecret:string
        }
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
            Application.privateConfig = JSON.parse(fs.readFileSync(Application.configPath,"utf-8"))
            Application.certsPath=path.join(__dirname,"../../certs")
        } else {
            let selfConfig=JSON.parse(fs.readFileSync(path.join(__dirname,"../../teamlinker.config.json"),"utf-8"))
            Application.extraConfig=JSON.parse(fs.readFileSync(Application.configPath,"utf-8"))
            Application.privateConfig=Object.assign({},selfConfig,{
                mysql:Application.extraConfig.mysql
            })
        }
        await fs.ensureDir(Application.uploadPath)
        await fs.ensureDir(Application.uploadTempPath)
        Application.mode = mode
        initComponent()
        await init()
        await this.initKoa();
        let httpServer = https.createServer({
            cert:fs.readFileSync(path.join(Application.certsPath,"cert.pem")),
            key:fs.readFileSync(path.join(Application.certsPath,"key.pem")),
            rejectUnauthorized:false
        },this.app.callback())
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
                if(err.message) {
                    console.error(err.message)
                }
                ctx.body = generateHttpErrorResponse(err.data??err,ctx.headers["accept-language"])
            }
        })
    }
    abstract config(app:InstanceType<typeof Koa>);

}
