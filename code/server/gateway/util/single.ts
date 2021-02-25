import { Redis } from '../../common/cache/redis';
import {IServer_GateWay_Config} from "../types/config"
var obj={
    config:<IServer_GateWay_Config>{},
    redis:<InstanceType<typeof Redis>>{}
};
export default obj