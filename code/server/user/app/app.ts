import { DefaultContext, DefaultState } from "koa";
import Application from "../../common/app/app";
import "../http/admin";
import "../http/organization";
import "../http/team";
import "../http/user";
import "../rpc/user";
export default class User extends Application {
    override async config(app: import("koa")<DefaultState, DefaultContext>) {
        
    }
}

