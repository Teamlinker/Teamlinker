import { ECommon_Services } from './../types';
import { ICommon_Http_User_Test_Res } from "./userRes";
import {ECommon_HttpApi_Method, ICommon_HttpApi} from "./types"
const api={
    baseUrl:"/user",
    service:ECommon_Services.User,
    routes:{
        test:{
            method:ECommon_HttpApi_Method.POST,
            path:"/test",
            req:<{
                name:string,
                age:number                 
            }>{},
            res:<ICommon_Http_User_Test_Res>{},
        }
    }
}
export=api