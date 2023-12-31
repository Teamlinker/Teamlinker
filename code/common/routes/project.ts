import {ICommon_Model_Issue_Type} from '../model/issue_type';
import {ECommon_Model_Organization_Member_Type} from '../model/organization';
import {Permission_Types} from '../permission/permission';
import {ICommon_Model_Project} from './../model/project';
import {ICommon_Model_Project_Module} from './../model/project_module';
import {ECommon_Services} from './../types';
import {
    ICommon_Route_Res_Project_CreateModule_Data,
    ICommon_Route_Res_Project_List,
    ICommon_Route_Res_Project_ListTag,
    ICommon_Route_Res_Project_Statics,
    ICommon_Route_Res_recentProjectList_Item,
    ICommon_Route_Res_Role_Item,
    ICommon_Route_Res_Role_List,
    ICommon_Route_Res_Role_ListMember,
    ICommon_Route_Res_userProjectList
} from './response';
import {ECommon_HttpApi_Method} from "./types";
import {ICommon_Model_Role} from "../model/role";
import {ICommon_Model_Project_Label} from "../model/project_label";

const api={
    baseUrl:"/project",
    service:ECommon_Services.Cooperation,
    routes:{
        basic:{//项目基本信息
            method:ECommon_HttpApi_Method.GET,
            path:"/basic",
            req:<{
                projectId:string                
            }>{},
            res:<ICommon_Model_Project>{},
            permission:[Permission_Types.Project.READ]
        },
        create:{//创建项目
            method:ECommon_HttpApi_Method.POST,
            path:"/create",
            req:<{
                keyword :string,
                name :string,
                issueTypeSolutionId?:string,
                photo? :string,
                description? :string,                
            }>{},
            res:<ICommon_Model_Project>{},
            permission:[Permission_Types.Organization.CREATE_PROJECT]
        },
        edit:{//编辑项目
            method:ECommon_HttpApi_Method.PUT,
            path:"/edit",
            req:<{
                keyword? :string,
                name? :string,
                photo? :string,
                description? :string,       
                projectId:string         
            }>{},
            res:<ICommon_Model_Project>{},
            permission:[Permission_Types.Project.ADMIN]
        },
        remove:{//删除项目
            method:ECommon_HttpApi_Method.DELETE,
            path:"/remove",
            req:<{ 
                projectId:string         
            }>{},
            res:{},
            permission:[Permission_Types.Project.ADMIN]
        },
        listLabel:{//tag列表
            method:ECommon_HttpApi_Method.GET,
            path:"/tag/list",
            req:<{
                projectId:string,
                page:number,
                size:number,
                keyword?:string  
            }>{},
            res:<ICommon_Route_Res_Project_ListTag>{},
            permission:[Permission_Types.Project.READ]
        },
        getLabel:{
            method:ECommon_HttpApi_Method.GET,
            path:"/tag/item",
            req:<{
                labelId:string
            }>{},
            res:<ICommon_Model_Project_Label>{},
            permission:[Permission_Types.Project.READ]
        },
        createLabel:{//创建tag
            method:ECommon_HttpApi_Method.POST,
            path:"/tag/item",
            req:<{
                projectId:string,
                name:string     
            }>{},
            res:<{
                id:string,
                name:string
            }>{},
            permission:[Permission_Types.Project.EDIT]
        },
        editLabel:{//编辑tag
            method:ECommon_HttpApi_Method.PUT,
            path:"/tag/item",
            req:<{
                labelId:string,
                name:string     
            }>{},
            res:<{
                id:string,
                name:string
            }>{},
            permission:[Permission_Types.Project.EDIT]
        },
        removeLabel:{//删除tag
            method:ECommon_HttpApi_Method.DELETE,
            path:"/tag/item",
            req:<{
                labelId:string
            }>{},
            res:{},
            permission:[Permission_Types.Project.EDIT]
        },
        listModule:{//module列表
            method:ECommon_HttpApi_Method.GET,
            path:"/module/list",
            req:<{
                projectId:string  
            }>{},
            res:<ICommon_Route_Res_Project_CreateModule_Data[]>{},
            permission:[Permission_Types.Project.READ]
        },
        createModule:{//创建module
            method:ECommon_HttpApi_Method.POST,
            path:"/module/item",
            req:<{
                projectId:string,
                parentModuleId?:string,
                name:string  
            }>{},
            res:<ICommon_Model_Project_Module>{},
            permission:[Permission_Types.Project.EDIT]
        },
        editModule:{//编辑module
            method:ECommon_HttpApi_Method.PUT,
            path:"/module/item",
            req:<{
                parentModuleId?:string,
                name?:string
                moduleId:string  
            }>{},
            res:<ICommon_Model_Project_Module>{},
            permission:[Permission_Types.Project.EDIT]
        },
        removeModule:{//删除module
            method:ECommon_HttpApi_Method.DELETE,
            path:"/module/item",
            req:<{
                moduleId:string  
            }>{},
            res:{},
            permission:[Permission_Types.Project.EDIT]
        },
        listMember:{//成员列表
            method:ECommon_HttpApi_Method.GET,
            path:"/member/list",
            req:<{
                projectId:string,
                memberType:ECommon_Model_Organization_Member_Type,
                page?:number,
                size?:number,
                key:string
            }>{},
            res:<ICommon_Route_Res_Role_ListMember>{},
            permission:[Permission_Types.Project.READ]
        },
        addMember:{//添加成员（用户，团队）
            method:ECommon_HttpApi_Method.POST,
            path:"/member/item",
            req:<{
                projectId:string,
                memberId?:string,
                type:ECommon_Model_Organization_Member_Type,
                roleId:string
            }>{},
            res:<ICommon_Model_Role>{},
            permission:[Permission_Types.Project.ADMIN]
        },
        editMember:{//编辑成员
            method:ECommon_HttpApi_Method.PUT,
            path:"/member/item",
            req:<{
                projectId:string,
                memberId?:string,
                type:ECommon_Model_Organization_Member_Type,
                roleId:string
            }>{},
            res:<ICommon_Model_Role>{},
            permission:[Permission_Types.Project.ADMIN]
        },
        removeMember:{//删除成员
            method:ECommon_HttpApi_Method.DELETE,
            path:"/member/item",
            req:<{
                projectId:string,
                memberId?:string,
                type:ECommon_Model_Organization_Member_Type,
            }>{},
            res:{},
            permission:[Permission_Types.Project.ADMIN]
        },
        list:{
            method:ECommon_HttpApi_Method.GET,
            path:"/list",
            req:<{
                keyword?:string,
                page:number,
                size:number,
                organizationUserId?:string
            }>{},
            res:<ICommon_Route_Res_Project_List>{},
            permission:[Permission_Types.Organization.READ]
        },
        issueTypeList:{
            method:ECommon_HttpApi_Method.GET,
            path:"/issuetype/list",
            req:<{
                  projectId:string         
            }>{},
            res:<ICommon_Model_Issue_Type[]>{},
            permission:[Permission_Types.Project.READ]
        },
        recentProjectList:{
            method:ECommon_HttpApi_Method.GET,
            path:"/recent/list",
            req:<{
                       
            }>{},
            res:<ICommon_Route_Res_recentProjectList_Item[]>{},
            permission:[Permission_Types.Organization.READ]
        },
        userProjectList:{
            method:ECommon_HttpApi_Method.GET,
            path:"/user/list",
            req:<{
                keyword?:string,
                page:number,
                size:number,
                type:"all"|"created"|"joined"
                sort?:"name"|"created_time"
            }>{},
            res:<ICommon_Route_Res_userProjectList>{},
            permission:[Permission_Types.Organization.READ]
        },
        listRole:{
            method:ECommon_HttpApi_Method.GET,
            path:"/rolelist",
            req:<{
                projectId?:string,
            }>{},
            res:<ICommon_Route_Res_Role_List>{},
            permission:[Permission_Types.Project.READ]
        },
        addRole:{
            method:ECommon_HttpApi_Method.POST,
            path:"/role",
            req:<{
                projectId?:string,
                name :string,
                description?:string,
                value:number
            }>{},
            res:<ICommon_Route_Res_Role_Item>{},
            permission:[Permission_Types.Project.ADMIN]
        },
        editRole:{
            method:ECommon_HttpApi_Method.PUT,
            path:"/role",
            req:<{
                roleId:string,
                name?:string,
                description?:string,
                value?:number
            }>{},
            res:<ICommon_Route_Res_Role_Item>{},
            permission:[Permission_Types.Project.ADMIN]
        },
        removeRole:{
            method:ECommon_HttpApi_Method.DELETE,
            path:"/role",
            req:<{
                roleId:string,
            }>{},
            res:{},
            permission:[Permission_Types.Project.ADMIN]
        },
        getPermission:{
            method:ECommon_HttpApi_Method.GET,
            path:"/permission",
            req:<{
                projectId:string,
            }>{},
            res:<{
                value:number
            }>{},
            permission:[Permission_Types.Project.READ]
        },
        statics:{
            method:ECommon_HttpApi_Method.GET,
            path:"/statics",
            req:<{
                projectId:string
            }>{},
            res:<ICommon_Route_Res_Project_Statics>{},
            permission:[Permission_Types.Project.READ]
        },
    }
}
export default api