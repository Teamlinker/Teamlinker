import { init } from "../util/init";

export default abstract class Application{
    Application(){
        
    }
    async start() {
        await init()
        await this.config();
    }
    async config(){}
    
}