import { Permission_Types } from '../permission/permission';
import { ICommon_Model_Project } from './../model/project';
import { ECommon_Services } from './../types';
import {ECommon_HttpApi_Method, ICommon_HttpApi} from "./types"
const api={
    baseUrl:"/project",
    service:ECommon_Services.Cooperation,
    routes:{
        basic:{
            method:ECommon_HttpApi_Method.GET,
            path:"/basic",
            req:<{
                projectId:string                
            }>{},
            res:<ICommon_Model_Project>{},
            permission:[Permission_Types.Project.READ],
            ignoreValidate:true
        },
    }
}
export=api