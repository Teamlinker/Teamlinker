import * as Koa from "koa"
import * as body from 'koa-bodyparser';
import * as session from 'koa-session2';
import * as http from "http"
import single from "../util/single";
import { init } from "../util/util";
import userApi from "../rpc/user"
import Application from "../../common/app/app"
import {getIssueTypeListMapper} from "../../common/db/command/gateway"
var app = new Koa();
export default class GateWay extends Application {
    override async config() {
        await init()
        await this.initKoa();
    }
    async initKoa() {
        var root=await import("../routes/root")
        app.keys=["teamlinker"]
        app.use(session({
            maxAge: 86400000,
            overwrite: true,
            httpOnly: true,
            signed: true,
            rolling: false,
            renew: false,
            key: 'teamlinker'
        },app))
        app.use(body());
        app.use(root.routes());
        app.use(root.allowedMethods());
        http.createServer(app.callback()).listen(single.config.port,function(){
            console.log(`start`);
            setTimeout(async () => {
                var obj=new userApi()
                let ret=await obj.a({
                    name:"dd",
                    age:23
                })
                console.log(ret)
                let results=await getIssueTypeListMapper()
                console.log(results[0])
            }, 2000);
        })
    }
}

