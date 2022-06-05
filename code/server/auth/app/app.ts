import { DefaultContext, DefaultState } from "koa";
import Application from "../../common/app/app";
import "../rpc/auth";
export default class Auth extends Application {
    override async config(app: import("koa")<DefaultState, DefaultContext>) {
        
    }
}

