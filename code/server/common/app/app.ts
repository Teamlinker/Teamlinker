import { Rpc } from './../rpc/rpc';
import { IServer_Common_Config_Base } from "../types/config";
import { init } from "../util/init";
import { getNacosInstance } from '../nacos/nacos';

export default abstract class Application{
    Application(){
        
    }
    async start() {
        await init()
        if(getNacosInstance().rpcServer) {
            await Rpc.start(getNacosInstance().serverPort)
        }
        await this.config();
    }
    async config(){}
    
}