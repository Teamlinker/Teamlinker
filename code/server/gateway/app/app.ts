
import * as Koa from "koa";
import * as koaStaticServer from "koa-static-server";
import * as path from "path";
import { Permission_Base } from '../../../common/permission/permission';
import * as fieldApi from "../../../common/routes/field";
import * as fileApi from "../../../common/routes/file";
import * as gatewayApi from "../../../common/routes/gateway";
import * as issueApi from "../../../common/routes/issue";
import * as issueTypeApi from "../../../common/routes/issueType";
import * as projectApi from "../../../common/routes/project";
import * as releaseApi from "../../../common/routes/release";
import * as teamApi from "../../../common/routes/team";
import { ICommon_HttpApi } from "../../../common/routes/types";
import * as userApi from "../../../common/routes/user";
import * as workflowApi from "../../../common/routes/workflow";
import { Err } from "../../../common/status/error";
import { ECommon_Services } from "../../../common/types";
import Application, { ECommon_Application_Mode } from "../../common/app/app";
import { deletePermission, processPermission } from '../../common/permission/base';
import { proxyRequest } from "../../common/rpc/rpc";
import { EServer_Common_Http_Body_Type, IServer_Common_Http_Proxy } from "../../common/types/http";
import { EServer_Common_User_Type } from '../../common/types/user';
import { generateHttpOkResponse } from "../../common/util/http";
import "../http/gateway";
import userRpcApi from '../rpc/user';
import { checkIfNeedInit, handleImageFields } from "../util/util";
import { CacheService } from './../cache/service';
var apis:ICommon_HttpApi[]=[userApi,projectApi,teamApi,fileApi,issueTypeApi,workflowApi,fieldApi,issueApi,releaseApi,gatewayApi];
export default class GateWay extends Application {
    override async config(app: Koa<Koa.DefaultState, Koa.DefaultContext>) {
        let cacheService=new CacheService()
        cacheService.start()
        await checkIfNeedInit()
        let apiMap=<{
            [param:string]:{
                [parem:string]:{
                    service:string,
                    ignoreValidate:boolean,
                    permission:Permission_Base[]|{
                        data:Permission_Base[],
                        delete:boolean
                    }
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
                    ignoreValidate:!!objApi.ignoreValidate,
                    permission:objApi.permission??[]
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
                    let microServer = apiMap[baseUrl][method + " " + apiPath].service
                    let ignoreValidate = apiMap[baseUrl][method + " " + apiPath].ignoreValidate
                    let permission=apiMap[baseUrl][method + " " + apiPath].permission
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
                    let permissionDelete:object;
                    if(permission && ((Array.isArray(permission) && permission.length>0) || (typeof(permission)=="object" && !Array.isArray(permission) && Array.isArray(permission.data) && permission.data.length>0))) {
                        if(ctx.state.user) {
                            if(ctx.state.user.type==EServer_Common_User_Type.USER) {
                                let per=Array.isArray(permission)?permission:permission.data;
                                let [isCheck,map] =await processPermission(per,Object.assign({},obj.data,{
                                    userId:ctx.state.user?ctx.state.user.userId:undefined,
                                    isAdmin:ctx.state.user.type===EServer_Common_User_Type.ADMIN
                                }))
                                if(isCheck && typeof(permission)=="object" && !Array.isArray(permission) && Array.isArray(permission.data)) {
                                    permissionDelete=map;
                                }
                                if(!isCheck) {
                                    throw Err.User.accessDenied
                                }
                            }
                        } else {
                            throw Err.User.accessDenied
                        }
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
                    if(ret.data===undefined || typeof(ret.data)=="string" || typeof(ret.data)=="number" || typeof(ret.data)=="boolean" || typeof(ret.data)=="object")
                    {
                        if(typeof(ret.data)=="object") {
                            await handleImageFields(ret.data);
                        }
                        ctx.body = generateHttpOkResponse(ret.data);
                    } else {
                        ctx.body = ret.data;
                    }
                    if(permissionDelete) {
                        deletePermission(permissionDelete)
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
            rootDir:Application.teamlinkerPath,
            rootPath:"/file",
            last:false
        }))
        if(Application.mode!=ECommon_Application_Mode.MICRO) {
            app.use(koaStaticServer({
                rootDir:Application.debug?path.resolve(__dirname,"../../../client/dist"):path.join(__dirname,"../../../../../../client/dist"),
                rootPath:"/",
                last:false
            }))
        }
    }
}



