import * as Koa from "koa"
import * as body from 'koa-bodyparser';
import form from "koa2-formidable"
import * as session from 'koa-session2';
import * as http from "http"
import single from "./util/single";
import { init } from "./util/util";
import userApi from "./rpc/user"
var app = new Koa();
(async function(){
    await init()
    var root=await import("./routes/root")
    app.keys=["woclever"]
    app.use(session({
        maxAge: 86400000,
        overwrite: true,
        httpOnly: true,
        signed: true,
        rolling: false,
        renew: false,
        key: 'WOClever'
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
        }, 2000);
    })
})()

export = app;



