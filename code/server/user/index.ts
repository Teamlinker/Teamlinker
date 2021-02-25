import { Rpc } from './../common/rpc/rpc';
import * as Koa from "koa"
import * as body from 'koa-bodyparser';
import form from "koa2-formidable"
import * as session from 'koa-session2';
import * as http from "http"
import single from "./util/single";
import { init } from "./util/util";
var app = new Koa();
(async function(){
    await init()
    Rpc.start(single.config.port)
})()

export = app;



