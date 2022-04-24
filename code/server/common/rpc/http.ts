import * as Koa from "koa";
import * as Router from "koa-router";
import Application from "../app/app";
import { getMysqlInstance } from "../db/mysql";
import { DComponent, getComponent } from "../decorate/component";
export enum ECommon_Internal_Http {
    RELOAD_DATABASE="reload_database"
}
var g_internalCallCls:string
export let internalRouter=new Router()
internalRouter.post(`/${ECommon_Internal_Http.RELOAD_DATABASE}`,async (ctx,next)=>{
    console.log(ECommon_Internal_Http.RELOAD_DATABASE);
    let obj=getComponent<InstanceType<typeof InternalCall>>(g_internalCallCls);
    await obj.reloadDataBase(ctx);
    await next();
})


function DInternalCall(target) {
    let name=target.name;
    g_internalCallCls=name
}

@DComponent
@DInternalCall
export class InternalCall {
    async reloadDataBase(ctx:Koa.ParameterizedContext<any, Router.IRouterParamContext<any, {}>, any>) {
        delete require.cache[Application.configPath];
        Application.privateConfig=require(Application.configPath);
        let mysql=getMysqlInstance()
        mysql.reload(Application.privateConfig.mysql);
    }
}