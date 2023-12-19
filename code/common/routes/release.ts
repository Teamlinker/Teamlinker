import {ECommon_Model_Project_Release_Status} from '../model/project_release';
import {Permission_Types} from '../permission/permission';
import {ICommon_Model_Project_Release} from './../model/project_release';
import {ECommon_Services} from './../types';
import {
    ICommon_Route_Res_Global_Search_Project_Release_Item,
    ICommon_Route_Res_Release_IfCanRelease,
    ICommon_Route_Res_Release_Info,
    ICommon_Route_Res_Release_List
} from './response';
import {ECommon_HttpApi_Method} from "./types";

const api={
    baseUrl:"/release",
    service:ECommon_Services.Cooperation,
    routes:{
        list:{
            method:ECommon_HttpApi_Method.GET,
            path:"/list",
            req:<{
                projectId?:string,
                name?:string,
                status?:ECommon_Model_Project_Release_Status,
                projectReleaseIds?:string[],
                page:number,
                size:number       
            }>{},
            res:<ICommon_Route_Res_Release_List>{},
            permission:[Permission_Types.Organization.READ]
        },
        info:{
            method:ECommon_HttpApi_Method.GET,
            path:"/item",
            req:<{
                projectReleaseId:string       
            }>{},
            res:<ICommon_Route_Res_Release_Info>{},
            permission:[Permission_Types.Project.READ]
        },
        create:{
            method:ECommon_HttpApi_Method.POST,
            path:"/item",
            req:<{
                name :string,
                start_time? :string,
                release_time? :string,
                description? :string,    
                projectId:string   
            }>{},
            res:<ICommon_Model_Project_Release>{},
            permission:[Permission_Types.Project.CREATE]
        },
        edit:{
            method:ECommon_HttpApi_Method.PUT,
            path:"/item",
            req:<{
                projectReleaseId:string,
                name? :string,
                start_time? :string,
                release_time? :string,
                description? :string,     
            }>{},
            res:<ICommon_Model_Project_Release>{},
            permission:[Permission_Types.Project.CREATE]
        },
        remove:{
            method:ECommon_HttpApi_Method.DELETE,
            path:"/item",
            req:<{
                projectReleaseId:string 
            }>{},
            res:{},
            permission:[Permission_Types.Project.DELETE,Permission_Types.Common.SELF],
            permissionOr:true
        },
        addIssue:{
            method:ECommon_HttpApi_Method.POST,
            path:"/issue",
            req:<{
                projectReleaseId:string,
                projectIssueId:string
            }>{},
            res:{},
            permission:[Permission_Types.Project.EDIT]
        },
        removeIssue:{
            method:ECommon_HttpApi_Method.DELETE,
            path:"/issue",
            req:<{
                projectReleaseId:string,
                projectIssueId:string
            }>{},
            res:{},
            permission:[Permission_Types.Project.EDIT]
        },
        checkIfCanRelease:{
            method:ECommon_HttpApi_Method.GET,
            path:"/ifcan",
            req:<{
                projectReleaseId:string
            }>{},
            res:<ICommon_Route_Res_Release_IfCanRelease>{},
            permission:[Permission_Types.Project.READ]
        },
        changeStatus:{
            method:ECommon_HttpApi_Method.PUT,
            path:"/release",
            req:<{
                projectReleaseId:string,
                status:ECommon_Model_Project_Release_Status
            }>{},
            res:<ICommon_Model_Project_Release>{},
            permission:[Permission_Types.Project.EDIT]
        },
        globalSearchRelease:{
            method:ECommon_HttpApi_Method.GET,
            path:"/global/release",
            req:<{
                keyword:string,
                size:number
            }>{},
            res:<ICommon_Route_Res_Global_Search_Project_Release_Item[]>{},
            permission:[Permission_Types.Organization.READ]
        }
    }
}
export default api