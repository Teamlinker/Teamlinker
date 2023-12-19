import * as Koa from "koa";
import * as koaStaticServer from "koa-static-server";
import * as path from "path";
import {ECommon_User_Type} from "../../../common/model/user";
import {Permission_Base} from '../../../common/permission/permission';
import fieldApi from "../../../common/routes/field";
import fileApi from "../../../common/routes/file";
import gatewayApi from "../../../common/routes/gateway";
import issueApi from "../../../common/routes/issue";
import issueTypeApi from "../../../common/routes/issueType";
import organizationApi from "../../../common/routes/organization";
import projectApi from "../../../common/routes/project";
import releaseApi from "../../../common/routes/release";
import teamApi from "../../../common/routes/team";
import {ICommon_HttpApi} from "../../../common/routes/types";
import userApi from "../../../common/routes/user";
import workflowApi from "../../../common/routes/workflow";
import wikiApi from "../../../common/routes/wiki";
import calendarApi from "../../../common/routes/calendar";
import meetingApi from "../../../common/routes/meeting";
import finderApi from "../../../common/routes/finder";
import notificationApi from "../../../common/routes/notification";
import boardApi from "../../../common/routes/board";
import toolApi from "../../../common/routes/tool";
import planApi from "../../../common/routes/plan";
import {Err} from "../../../common/status/error";
import Application from "../../common/app/app";
import {EServer_Common_Http_Body_Type, IServer_Common_Http_Proxy} from "../../common/types/http";
import {generateHttpErrorResponse, generateHttpOkResponse} from "../../common/util/http";
import "../http/gateway";
import {checkIfNeedInit, handleImageFields} from "../util/util";
import {proxyRequest} from "./http";
import "../../user/app/app"
import "../../cooperation/app/app"
import {config as configFile} from "../../file/app/app"
import "../../wiki/app/app"
import "../../meeting/app/app"
import "../../finder/app/app"
import "../../notification/app/app"
import {initCalendar} from "../../calendar/app/app"
import {initIM} from "../../im/app/app";
import {initMeeting} from "../../meeting/app/app";
import authRpcApi from "../../auth/rpc/auth"
import userRpcApi from "../../user/rpc/user"
import {getRedisInstance} from "../../common/cache/redis";
import {initNotification} from "../../notification/app/app";

var apis:ICommon_HttpApi[]=[userApi,projectApi,teamApi,fileApi,issueTypeApi,workflowApi,fieldApi,issueApi,releaseApi,gatewayApi,organizationApi,wikiApi,calendarApi,meetingApi,finderApi,notificationApi,boardApi,toolApi,planApi];
export default class GateWay extends Application {
    override async config(app: Koa<Koa.DefaultState, Koa.DefaultContext>) {
        let redis=getRedisInstance();
        await Promise.all([
            redis.flush(),
            checkIfNeedInit()
        ])
        await Promise.all([
            configFile(),
            initCalendar(),
            initIM(),
            initMeeting(),
            initNotification()
        ])
        let apiMap=<{
            [param:string]:{
                [parem:string]:{
                    permissionModule:string,
                    service:string,
                    ignoreValidate:boolean,
                    permission:Permission_Base[],
                    permissionOr?:boolean
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
                    permissionModule:baseUrl,
                    service:obj.service,
                    ignoreValidate:!!objApi.ignoreValidate,
                    permission:objApi.permission??[],
                    permissionOr:!!objApi.permissionOr
                };
            }
        }
        app.use(async function (ctx, next) {
            let path = ctx.path
            if(path.startsWith("/api/")) {
                path = path.substring("/api".length)
                let method = ctx.req.method;
                let baseUrl = path.substring(1, path.indexOf("/", 1))
                let apiPath = path.substring(1 + baseUrl.length)
                if (apiMap[baseUrl] && apiMap[baseUrl][method + " " + apiPath]) {
                    let ignoreValidate = apiMap[baseUrl][method + " " + apiPath].ignoreValidate
                    let permission=apiMap[baseUrl][method + " " + apiPath].permission
                    let permissionOr=apiMap[baseUrl][method + " " + apiPath].permissionOr
                    if(!ignoreValidate) {
                        let authorization = ctx.get("Authorization")
                        if(!authorization) {
                            throw Err.User.notAuth
                        }
                        let ret= await userRpcApi.checkSession(authorization.substr(7))
                        if(!ret) {
                            throw Err.User.notAuth
                        }
                        ctx.state.user=ret;
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
                    obj.path = path
                    obj.user = ctx.state.user
                    if (ctx.state.formData) {
                        obj.bodyType = EServer_Common_Http_Body_Type.FORMDATA
                    }
                    let lang=ctx.headers["accept-language"]
                    if(permission && Array.isArray(permission) && permission.length>0) {
                        if(obj.user) {
                            if(obj.user.type==ECommon_User_Type.USER) {
                                obj.user.organizationInfo=await userRpcApi.checkOrganizationInfo(obj.user.platform,obj.user.userId);
                                if(!obj.user.organizationInfo) {
                                    if(obj.data["organizationId"]) {
                                        obj.user.organizationInfo={
                                            organizationId:obj.data["organizationId"],
                                            organizationUserId:await userRpcApi.getOrganizationUserId(obj.data["organizationId"],obj.user.userId),
                                            fake:true
                                        }
                                    }
                                }
                                let isCheck =await authRpcApi.processPermission(permissionOr,permission,Object.assign({},obj.data,{
                                    userId:obj.user?obj.user.userId:undefined,
                                    organizationId:obj.user.organizationInfo.organizationId,
                                    organizationUserId:obj.user.organizationInfo.organizationUserId
                                }))
                                if(!isCheck) {
                                    throw Err.User.accessDenied
                                }
                            }
                        } else {
                            throw Err.User.accessDenied
                        }
                    }
                    let ret = await proxyRequest(obj)
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
                    if(ret.data===undefined || typeof(ret.data)=="string" || typeof(ret.data)=="number" || typeof(ret.data)=="boolean" || typeof(ret.data)=="object")
                    {
                        if(ret.status==500) {
                            ctx.body = generateHttpErrorResponse(ret.data,lang);
                        } else {
                            if(typeof(ret.data)=="object" && obj.user) {
                                await handleImageFields(ret.data,obj.data["organizationId"]?obj.data["organizationId"]:obj.user.organizationInfo?.organizationId);
                            }
                            ctx.body = generateHttpOkResponse(ret.data);
                        }
                    } else {
                        ctx.body = ret.data;
                    }
                    await next()
                } else {
                    await next()
                }
            } else {
                await next()
            }
        })
        app.use(koaStaticServer({
            rootDir: Application.uploadPath,
            rootPath: "/file",
            last: false
        }))
        app.use(koaStaticServer({
            rootDir:path.resolve(__dirname,"../../../client"),
            rootPath:"/",
            last:false
        }))
    }
}



