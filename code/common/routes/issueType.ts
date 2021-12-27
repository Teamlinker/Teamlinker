import { ICommon_Model_Issue_Type } from './../model/issue_type';
import { ECommon_Services } from './../types';
import { ECommon_HttpApi_Method } from "./types";
const api={
    baseUrl:"/issuetype",
    service:ECommon_Services.Cooperation,
    routes:{
        list:{
            method:ECommon_HttpApi_Method.GET,
            path:"/list",
            req:<{
                           
            }>{},
            res:<ICommon_Model_Issue_Type[]>{}
        },
        info:{
            method:ECommon_HttpApi_Method.GET,
            path:"/item",
            req:<{
                issueTypeId:string           
            }>{},
            res:<ICommon_Model_Issue_Type>{}
        },
        create:{
            method:ECommon_HttpApi_Method.POST,
            path:"/item",
            req:<{
                name:string,
                icon?:string,
                description?:string       
            }>{},
            res:<ICommon_Model_Issue_Type>{}
        },
        update:{
            method:ECommon_HttpApi_Method.PUT,
            path:"/item",
            req:<{
                issueTypeId:string,
                name?:string,
                icon?:string,
                description?:string           
            }>{},
            res:<ICommon_Model_Issue_Type>{}
        },
        delete:{
            method:ECommon_HttpApi_Method.DELETE,
            path:"/item",
            req:<{
                issueTypeId:string           
            }>{},
            res:{}
        },
    }
}
export=api