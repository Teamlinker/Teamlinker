import { DefaultContext, DefaultState } from "koa";
import Application from "../../common/app/app";
import "../http/field";
import "../http/issue";
import "../http/issueType";
import "../http/module";
import "../http/project";
import "../http/release";
import "../http/tag";
import "../http/workflow";
import "../rpc/cooperation";
export default class Cooperation extends Application {
    override async config(app: import("koa")<DefaultState, DefaultContext>) {
        
    }
}
