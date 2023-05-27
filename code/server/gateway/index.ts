import GateWay from "./app/app";
import {ECommon_Application_Mode} from "../../common/types";
import * as process from "process";

//(<any>process).pkg=true;
var application = new GateWay()
application.start((<any>process).pkg?ECommon_Application_Mode.OFFLINE:ECommon_Application_Mode.ONLINE);


   
