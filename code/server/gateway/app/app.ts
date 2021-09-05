import * as Koa from "koa"
import * as body from 'koa-bodyparser';
import * as http from "http"
import userRpcApi from '../rpc/user';
import Application from "../../common/app/app"
import { getNacosInstance } from "../../common/nacos/nacos";
import { CacheService } from './../cache/service';
import {generateHttpErrorResponse} from "../../common/util/http"
import * as userApi from "../../../common/routes/user"
import { ICommon_HttpApi } from "../../../common/routes/types";
import {  EServer_Common_Http_Body_Type, IServer_Common_Http_Proxy, IServer_Common_Http_Req_File } from "../../common/types/http";
import { parseFormData } from "../util/util";
import { PassThrough } from "stream";
import { proxyRequest } from "../../common/rpc/rpc";
import { Err } from "../../../common/status/error";
import { ECommon_Services } from "../../../common/types";
var apis:ICommon_HttpApi[]=[userApi];
var app = new Koa();
var pipe=function (from,to) :Promise<string>{
    return new Promise(function (resolve) {
        let p=from.pipe(to);
        let stream=new PassThrough();
        from.pipe(stream);
        p.on("finish",function () {
            const originalReqData = [];
            let size = 0;
            stream.on("data",function (chunk) {
                originalReqData.push(chunk);
                size += chunk.length;
            })
            stream.on("end",function () {
                resolve(Buffer.concat(originalReqData, size).toString());
            })
        })
    })
}
export default class GateWay extends Application {
    override async config() {
        let cacheService=new CacheService()
        cacheService.start()
        await this.initKoa();
    }
    async initKoa() {
        let apiMap=<{
            [param:string]:{
                [parem:string]:{
                    service:string,
                    ignoreValidate:boolean
                }
            }
        }>{}
        for(let obj of apis){
            let baseUrl=obj.baseUrl.substr(1)
            if(!apiMap[baseUrl])
            {
                apiMap[baseUrl]={}
            }
            for(let key in obj.routes) {
                let objApi=obj.routes[key];
                apiMap[baseUrl][objApi.method+" "+objApi.path]={
                    service:obj.service,
                    ignoreValidate:!!objApi.ignoreValidate
                };
            }
        }
        app.use(async (ctx, next) => {
            if (ctx.headers['content-type'] && ctx.headers['content-type'].split(';')[0] === 'multipart/form-data') {
                const maxLength = 1024 * 1024 * 5;
                if (ctx.headers && ctx.headers['content-length'] && Number(ctx.headers['content-length']) > maxLength) {
                    ctx.body = generateHttpErrorResponse(new Err.Http.OverFileSize)
                    return;
                }
                let stream=new PassThrough()
                let ret=await pipe(ctx.req,stream)
                let arr = parseFormData(ret);
                    let obj=<{
                        [param:string]:string|IServer_Common_Http_Req_File
                    }>{}
                    for(let o of arr) {
                        if(o.isFile) {
                            obj[o.name]={
                                data:o.data,
                                fileName:o.fileName
                            }
                        } else {
                            obj[o.name]=o.data
                        }
                    }
                    ctx.state.formData=obj
                    await next();
            } else {
                await next()
            }
        })
        app.use(body());
        app.use(async (ctx, next) => {
            try {
                await next()
            } catch (err) {
                ctx.body = generateHttpErrorResponse(err.data??err)
            }
        })
        app.use(async function (ctx, next) {
            let path = ctx.path
            if(path.startsWith("/api/")) {
                path = path.substr("/api".length)
                let method = ctx.req.method;
                let baseUrl = path.substring(1, path.indexOf("/", 1))
                let apiPath = path.substr(1 + baseUrl.length)
                if (apiMap[baseUrl] && apiMap[baseUrl][method + " " + apiPath]) {
                    let microServer = apiMap[baseUrl][method + " " + apiPath].service
                    let ignoreValidate = apiMap[baseUrl][method + " " + apiPath].ignoreValidate
                    if(!ignoreValidate) {
                        let authorization = ctx.get("Authorization")
                        if(!authorization) {
                            throw new Err.User.NotAuth
                        }
                        let ret= await userRpcApi.checkSession(authorization.substr(7))
                        if(!ret) {
                            throw new Err.User.NotAuth
                        }
                    }
                    let obj = <IServer_Common_Http_Proxy>{}
                    if (ctx.req.method == "POST" || ctx.req.method == "PUT" || ctx.req.method == "PATCH") {
                        if (!ctx.state.p) {
                            ctx.state.p = ctx.request.body;
                        }
                    }
                    else {
                        ctx.state.p = ctx.request.query;
                    }
                    obj.method = ctx.req.method
                    obj.headers = <any>ctx.req.headers
                    obj.data = ctx.state.formData ?? ctx.state.p
                    obj.path = apiPath
                    if (ctx.state.formData) {
                        obj.bodyType = EServer_Common_Http_Body_Type.FORMDATA
                    }
                    let ret = await proxyRequest(obj, microServer as ECommon_Services)
                    ctx.response.status = ret.status;
                    for (let key in ret.headers) {
                        if (key == "set-cookie") {
                            let obj = JSON.parse(ret.headers[key])
                            for (let o of obj) {
                                ctx.set("set-cookie", o)
                            }
                        } else {
                            ctx.set(key, ret.headers[key]);
                        }
                    }
                    ctx.body = ret.data;
                    await next()
                } else {
                    await next()
                }
            } else {
                await next()
            }
        })
        http.createServer(app.callback()).listen(getNacosInstance().serverPort,function(){
            console.log(`start`);
        })
    }
}


