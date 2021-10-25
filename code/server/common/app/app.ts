import * as yargs from "yargs";
import { initComponent } from "../decorate/component";
import { getNacosInstance } from '../nacos/nacos';
import { init } from "../util/init";
import { Rpc } from './../rpc/rpc';
export default abstract class Application{
    Application(){

    }
    async start() {
        let argv=yargs.argv
        if(argv["nacosPort"]) {
            process.env.nacosPort=argv["nacosPort"]
        }
        if(argv["nacosUrl"]) {
            process.env.nacosUrl=argv["nacosUrl"]
        }
        if(argv["nacosName"]) {
            process.env.nacosName=argv["nacosName"]
        }
        if(argv["nacosId"]) {
            process.env.nacosId=argv["nacosId"]
        }
        if(argv["nacosNamespace"]) {
            process.env.nacosNamespace=argv["nacosNamespace"]
        }
        if(argv["nacosUsername"]) {
            process.env.nacosUsername=argv["nacosUsername"]
        }
        if(argv["nacosPassword"]) {
            process.env.nacosPassword=argv["nacosPassword"]
        }
        initComponent()
        await init()
        if(getNacosInstance().rpcServer) {
            await Rpc.start(getNacosInstance().serverPort)
        }
        await this.config();
    }
    async config(){}
    
}