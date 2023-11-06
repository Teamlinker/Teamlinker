import gateApi from "../../../common/routes/gateway";
import Application from "../../common/app/app";
import {DComponent} from "../../common/decorate/component";
import {DHttpApi, DHttpController, DHttpReqParam, DHttpReqParamRequired} from "../../common/http/http";
import {GateWayService} from './../service/http';

@DComponent
@DHttpController(gateApi)
class GatewayController {
    @DHttpApi(gateApi.routes.needConfig)
    async needConfig():Promise<typeof gateApi.routes.needConfig.res>{
        let ret=await GateWayService.needConfig()
        return ret;
    }

    @DHttpApi(gateApi.routes.editConfig)
    async editConfig(@DHttpReqParamRequired("dbUrl") dbUrl:string,@DHttpReqParam("dbPort") dbPort:number,@DHttpReqParam("dbDatabase") dbDatabase:string,@DHttpReqParam("dbUsername") dbUsername:string,@DHttpReqParam("dbPassword") dbPassword:string) {
        await GateWayService.editConfig(dbUrl,dbPort,dbDatabase,dbUsername,dbPassword);
    }

    @DHttpApi(gateApi.routes.deployInfo)
    async deployInfo():Promise<typeof gateApi.routes.deployInfo.res> {
        return {
            type:Application.mode
        }
    }

    @DHttpApi(gateApi.routes.wechatAppId)
    async wechatAppId():Promise<typeof gateApi.routes.wechatAppId.res> {
        return {
            appId:Application.privateConfig.wechat.appId
        }
    }
}