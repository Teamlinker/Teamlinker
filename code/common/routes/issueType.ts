import {ICommon_Model_Issue_Type} from './../model/issue_type';
import {ICommon_Model_Issue_Type_Solution} from './../model/issue_type_solution';
import {ECommon_Services} from './../types';
import {
    ICommon_Route_Res_IssueTypeSolution_List_Item,
    ICommon_Route_Res_IssueTypeSolution_Project_List
} from './response';
import {ECommon_HttpApi_Method} from "./types";
import {Permission_Types} from "../permission/permission";

const api={
    baseUrl:"/issuetype",
    service:ECommon_Services.Cooperation,
    routes:{
        reserved:{
            method:ECommon_HttpApi_Method.GET,
            path:"/reserved",
            req:{},
            res:<ICommon_Model_Issue_Type_Solution>{},
            permission:[Permission_Types.Organization.READ]
        },
        list:{
            method:ECommon_HttpApi_Method.GET,
            path:"/list",
            req:<{
                issueTypeSolutionId:string
            }>{},
            res:<ICommon_Model_Issue_Type[]>{},
            permission:[Permission_Types.Organization.READ]
        },
        info:{
            method:ECommon_HttpApi_Method.GET,
            path:"/item",
            req:<{
                issueTypeId:string           
            }>{},
            res:<ICommon_Model_Issue_Type>{},
            permission:[Permission_Types.Organization.READ]
        },
        create:{
            method:ECommon_HttpApi_Method.POST,
            path:"/item",
            req:<{
                issueTypeSolutionId:string,
                name:string,
                icon?:string,
                description?:string       
            }>{},
            res:<ICommon_Model_Issue_Type>{},
            permission:[Permission_Types.Organization.ADMIN]
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
            res:<ICommon_Model_Issue_Type>{},
            permission:[Permission_Types.Organization.ADMIN]
        },
        delete:{
            method:ECommon_HttpApi_Method.DELETE,
            path:"/item",
            req:<{
                issueTypeId:string,
                convertIssueTypeId:string
            }>{},
            res:{},
            permission:[Permission_Types.Organization.ADMIN]
        },
        solutionList:{
            method:ECommon_HttpApi_Method.GET,
            path:"/solution/list",
            req:<{
                           
            }>{},
            res:<ICommon_Route_Res_IssueTypeSolution_List_Item[]>{},
            permission:[Permission_Types.Organization.READ]
        },
        solutionInfo:{
            method:ECommon_HttpApi_Method.GET,
            path:"/solution/item",
            req:<{
                issueTypeSolutionId:string           
            }>{},
            res:<ICommon_Route_Res_IssueTypeSolution_List_Item>{},
            permission:[Permission_Types.Organization.READ]
        },
        solutionCreate:{
            method:ECommon_HttpApi_Method.POST,
            path:"/solution/item",
            req:<{
                name:string,
                description?:string       
            }>{},
            res:<ICommon_Model_Issue_Type_Solution>{},
            permission:[Permission_Types.Organization.ADMIN]
        },
        solutionUpdate:{
            method:ECommon_HttpApi_Method.PUT,
            path:"/solution/item",
            req:<{
                issueTypeSolutionId:string,
                name?:string,
                description?:string           
            }>{},
            res:<ICommon_Model_Issue_Type_Solution>{},
            permission:[Permission_Types.Organization.ADMIN]
        },
        solutionDelete:{
            method:ECommon_HttpApi_Method.DELETE,
            path:"/solution/item",
            req:<{
                issueTypeSolutionId:string,
                relationship?:{
                    [id:string]:string
                }
            }>{},
            res:{},
            permission:[Permission_Types.Organization.ADMIN]
        },
        solutionBindProject:{
            method:ECommon_HttpApi_Method.POST,
            path:"/solution/project",
            req:<{
                issueTypeSolutionId:string,
                projectId:string,
                relationship?:{
                    [id:string]:string
                }
            }>{},
            res:{},
            permission:[Permission_Types.Project.ADMIN]
        },
        solutionUnbindProject:{
            method:ECommon_HttpApi_Method.DELETE,
            path:"/solution/project",
            req:<{
                projectId:string,
                relationship?:{
                    [id:string]:string
                }
            }>{},
            res:{},
            permission:[Permission_Types.Organization.ADMIN]
        },
        solutionProjectList:{
            method:ECommon_HttpApi_Method.GET,
            path:"/solution/project",
            req:<{
                issueTypeSolutionId:string,
                page:number,
                size:number,
                keyword?:string
            }>{},
            res:<ICommon_Route_Res_IssueTypeSolution_Project_List>{},
            permission:[Permission_Types.Organization.READ]
        },
        copy:{
            method:ECommon_HttpApi_Method.POST,
            path:"/copy",
            req:<{
                issueTypeId:string,
                newIssueTypeSolutionId:string,
                name:string
            }>{},
            res:<ICommon_Model_Issue_Type>{},
            permission:[Permission_Types.Organization.ADMIN]
        },
        copySolution:{
            method:ECommon_HttpApi_Method.POST,
            path:"/solution/copy",
            req:<{
                issueTypeSolutionId:string,
                name:string
            }>{},
            res:<ICommon_Model_Issue_Type_Solution>{},
            permission:[Permission_Types.Organization.ADMIN]
        },
        solutionInfoByProjectId:{
            method:ECommon_HttpApi_Method.GET,
            path:"/solution/byprojectid",
            req:<{
                projectId:string
            }>{},
            res:<ICommon_Model_Issue_Type_Solution>{},
            permission:[Permission_Types.Organization.READ]
        },
    }
}
export default api