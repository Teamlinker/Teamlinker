import GateWay from "./app/app";
import {ECommon_Application_Mode} from "../common/app/app";

var application = new GateWay()
application.start((<any>process).pkg?ECommon_Application_Mode.OFFLINE:ECommon_Application_Mode.ONLINE);


   
