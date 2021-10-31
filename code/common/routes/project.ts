import { Permission_Types } from '../permission/permission';
import { ICommon_Model_Project } from './../model/project';
import { ICommon_Model_Project_Module } from './../model/project_module';
import { ICommon_Model_User } from './../model/user';
import { ECommon_Services } from './../types';
import { ICommon_Route_Res_Project_CreateModule_Data, ICommon_Route_Res_Project_Member } from './response';
import { ECommon_HttpApi_Method } from "./types";
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
            permission:[Permission_Types.Project.READ]
        },
        create:{
            method:ECommon_HttpApi_Method.POST,
            path:"/create",
            req:<{
                keyword :string,
                name :string,
                image? :string,
                description? :string,                
            }>{},
            res:<ICommon_Model_Project>{}
        },
        edit:{
            method:ECommon_HttpApi_Method.PUT,
            path:"/edit",
            req:<{
                keyword? :string,
                name? :string,
                image? :string,
                description? :string,       
                projectId:string         
            }>{},
            res:<ICommon_Model_Project>{}
        },
        listTag:{
            method:ECommon_HttpApi_Method.GET,
            path:"/tag/list",
            req:<{
                projectId:string,
                page:number,
                size:number,
                keyword:string  
            }>{},
            res:<{
                totalPage:number,
                page:number,
                data:{
                    id:string,
                    name:string
                }[]
            }>{}
        },
        createTag:{
            method:ECommon_HttpApi_Method.POST,
            path:"/tag/item",
            req:<{
                projectId:string,
                name:string     
            }>{},
            res:<{
                id:string,
                name:string
            }>{}
        },
        editTag:{
            method:ECommon_HttpApi_Method.PUT,
            path:"/tag/item",
            req:<{
                tagId:string,
                name:string     
            }>{},
            res:<{
                id:string,
                name:string
            }>{}
        },
        removeTag:{
            method:ECommon_HttpApi_Method.DELETE,
            path:"/tag/item",
            req:<{
                tagId:string 
            }>{},
            res:{}
        },
        listModule:{
            method:ECommon_HttpApi_Method.GET,
            path:"/module/list",
            req:<{
                projectId:string  
            }>{},
            res:<{
                totalPage:number,
                page:number,
                data:ICommon_Route_Res_Project_CreateModule_Data[]
            }>{}
        },
        createModule:{
            method:ECommon_HttpApi_Method.POST,
            path:"/module/item",
            req:<{
                projectId:string,
                parentModuleId?:string,
                name:string  
            }>{},
            res:<ICommon_Model_Project_Module>{}
        },
        editModule:{
            method:ECommon_HttpApi_Method.PUT,
            path:"/module/item",
            req:<{
                projectId:string,
                parentModuleId?:string,
                name?:string
                moduleId:string  
            }>{},
            res:<ICommon_Model_Project_Module>{}
        },
        removeModule:{
            method:ECommon_HttpApi_Method.DELETE,
            path:"/module/item",
            req:<{
                moduleId:string  
            }>{},
            res:{}
        },
        listMember:{
            method:ECommon_HttpApi_Method.GET,
            path:"/member/list",
            req:<{
                projectId:string,
                keyword:string  
            }>{},
            res:<{
                totalPage:number,
                page:number,
                data:ICommon_Route_Res_Project_Member[]
            }>{}
        },
    }
}
export=api