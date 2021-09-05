import * as Koa from "koa"
import * as body from 'koa-bodyparser';

import Application from "../../common/app/app"
import "../http/user"
import "../rpc/user"
export default class User extends Application {
    override async config() {
        
    }
}

