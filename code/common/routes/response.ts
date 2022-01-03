import { ICommon_Model_Issue_Type } from "../model/issue_type";
import { ICommon_Model_Project } from "../model/project";
import { ICommon_Model_Team } from '../model/team';
import { ICommon_Model_User } from '../model/user';
import { ICommon_Model_Issue_Type_Solution } from './../model/issue_type_solution';
import { ECommon_Model_Project_Member_Type } from './../model/project_member';
export interface ICommon_Route_Res_Project_CreateModule_Data {
    id:string,
    name:string,
    data:ICommon_Route_Res_Project_CreateModule_Data[]
}

export type ICommon_Route_Res_Project_Member = {
    id:string,
    photo:string,
    name:string
    type:ECommon_Model_Project_Member_Type,
    role:{
        id:string,
        name:string
    }
}

export type ICommon_Route_Res_Project_ListTag = {
    count:number,
    totalPage:number,
    page:number,
    data:{
        id:string,
        name:string
    }[]
}

export type ICommon_Route_Res_Project_ListMemeber ={
    count:number,
    totalPage:number,
    page:number,
    data:ICommon_Route_Res_Project_Member[]
}

export type ICommon_Route_Res_User_Profile={
    info:Omit<ICommon_Model_User,"password">,
    project:ICommon_Model_Project[],
    team:ICommon_Model_Team[]
}

export type ICommon_Route_Res_User_List = {
    count:number,
    totalPage:number,
    page:number,
    data:Omit<ICommon_Model_User,"password">[]
}

export type ICommon_Route_Res_User_TeamList = {
    count:number,
    totalPage:number,
    page:number,
    data:ICommon_Model_Team[]
}

export type ICommon_Route_Res_User_ProjectList = {
    count:number,
    totalPage:number,
    page:number,
    data:ICommon_Model_Project[]
}

export type ICommon_Route_Res_Project_List = {
    count:number,
    totalPage:number,
    page:number,
    data:ICommon_Model_Project[]
}


export type ICommon_Route_Res_Team_List = {
    count:number,
    totalPage:number,
    page:number,
    data:ICommon_Model_Team[]
}

export interface ICommon_Route_Res_IssueTypeSolution_Info extends ICommon_Model_Issue_Type_Solution {
    data:ICommon_Model_Issue_Type[]
}