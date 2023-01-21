import {ICommon_Model_Workflow_Node_Field_Type} from "../model/workflow_node_field_type";
import {ICommon_Model_Workflow_Node_Field_Type_Config} from "../model/workflow_node_field_type_config";
import {ICommon_Model_Issue_Type} from "../model/issue_type";
import {ICommon_Model_Organization} from "../model/organization";
import {ICommon_Model_Project} from "../model/project";
import {ICommon_Model_Team} from '../model/team';
import {ICommon_Model_User} from '../model/user';
import {ICommon_Model_Issue_Type_Solution} from './../model/issue_type_solution';
import {ICommon_Model_Organization_User} from './../model/organization_user';
import {ICommon_Model_Project_Issue} from './../model/project_issue';
import {ICommon_Model_Project_Issue_Field_Value} from './../model/project_issue_field_value';
import {ECommon_Model_Organization_Member_Type} from './../model/organization';
import {ICommon_Model_Project_Release} from './../model/project_release';
import {ICommon_Model_Workflow_Action} from './../model/workflow_action';
import {ICommon_Model_Workflow_Node} from './../model/workflow_node';
import {ICommon_Model_Role} from "../model/role";
import {Permission_Base} from "../permission/permission";
import {ICommon_Model_Member_Tag} from "../model/member_tag";
import {ICommon_Field_Type} from "../field/type";

export interface ICommon_Route_Res_Project_CreateModule_Data {
    id:string,
    name:string,
    data:ICommon_Route_Res_Project_CreateModule_Data[]
}

export type ICommon_Route_Res_Project_Member = {
    member?:ICommon_Model_Organization_User,
    memberType:ECommon_Model_Organization_Member_Type
    role:ICommon_Model_Role,
    user?:ICommon_Model_User,
    team?:ICommon_Model_Team,
    tag?:ICommon_Model_Member_Tag
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

export type ICommon_Route_Res_Project_ListMember ={
    count:number,
    totalPage:number,
    page:number,
    data:ICommon_Route_Res_Project_Member[]
}

export type ICommon_Route_Res_User_Profile={
    info:Omit<ICommon_Model_User,"password">,
    team:ICommon_Route_Res_User_TeamList
}

export type ICommon_Route_Res_User_List = {
    count:number,
    totalPage:number,
    page:number,
    data:Omit<ICommon_Model_User,"password">[]
}

export type ICommon_Route_Res_User_TeamList = {
    manage:ICommon_Model_Team[],
    join:ICommon_Model_Team[]
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

export interface ICommon_Route_Res_IssueTypeSolution_List_Item extends ICommon_Model_Issue_Type_Solution {
    issueTypeList:ICommon_Model_Issue_Type[]
}

export type ICommon_Route_Res_IssueTypeSolution_Project_List = {
    count:number,
    totalPage:number,
    page:number,
    data:ICommon_Model_Project[]
}

export type ICommon_Route_Res_IssueTypeSolution_IssueType_List = (ICommon_Model_Issue_Type_Solution & {
    issueTypeList:ICommon_Model_Issue_Type[]
})[]

export interface ICommon_Route_Res_Workflow_Info_Node {
    node:ICommon_Model_Workflow_Node,
    fields?:{
        field:ICommon_Model_Workflow_Node_Field_Type,
        fieldType:ICommon_Field_Type,
        values?:ICommon_Model_Workflow_Node_Field_Type_Config[]
    }[]
    actions:ICommon_Route_Res_Workflow_Info_Action[]
}

export interface ICommon_Route_Res_Workflow_Info_Action {
    action:ICommon_Model_Workflow_Action,
    destNode:ICommon_Route_Res_Workflow_Info_Node
}

export interface ICommon_Route_Res_Workflow_Info {
    nodes:ICommon_Model_Workflow_Node[],
    actions:ICommon_Model_Workflow_Action[]
}

export interface ICommon_Route_Res_Workflow_Node_Field {
    field: ICommon_Model_Workflow_Node_Field_Type,
    fieldType: ICommon_Field_Type,
    values?: ICommon_Model_Workflow_Node_Field_Type_Config[]
}


export type ICommon_Route_Req_ProjectIssue_Field={
    fieldId:string,
    value?:string[]|number|string,
    configIds?:string[]
}

export interface ICommon_Route_Res_ProjectIssue_BasicInfo extends Omit<ICommon_Model_Project_Issue,"workflow_node_id"|"issue_type_id"|"project_id"> {
    workflowNode:ICommon_Model_Workflow_Node
    issueType:ICommon_Model_Issue_Type,
    project:ICommon_Model_Project
}

export type ICommon_Route_Res_ProjectIssue_fieldsInfo = ICommon_Route_Res_Workflow_Node_Field & ICommon_Model_Project_Issue_Field_Value


export interface ICommon_Route_Res_recentProjectList_Item {
    id:string,
    name:string,
    photo:string,
    notstart:number,
    inprogress:number,
    done:number
}

export interface ICommon_Route_Res_userProjectList {
    count:number,
    totalPage:number,
    page:number,
    data:ICommon_Route_Res_recentProjectList_Item[]
}

export interface ICommon_Route_Res_Project_filter {
    id:string,
    name:string,
    unique_id:number,
    status:number,
    issueType:{
        id:string,
        icon:string,
        name:string
    },
    assigner_id:string,
    reporter_id:string,
    created_time:Date|string,
    created_by:string
}

export interface ICommon_Route_Res_Release_List {
    count:number,
    totalPage:number,
    page:number,
    data:ICommon_Route_Res_Release_Item[]
}

export interface ICommon_Route_Res_Release_Item extends ICommon_Model_Project_Release {
    notstart:number,
    inprogress:number,
    done:number
}

export interface ICommon_Route_Res_Release_Info extends ICommon_Route_Res_Release_Item{
    issueList:(Omit<ICommon_Model_Project_Issue,"issue_type_id"|"workflow_node_id"> & {
        issueType:ICommon_Model_Issue_Type,
        workflowNode:ICommon_Model_Workflow_Node
    })[]
}

export interface ICommon_Route_Res_Release_IfCanRelease {
    result:boolean,
    unDoneIssueList?:ICommon_Model_Project_Issue[]
}

export interface ICommon_Route_Res_Project_User_Item {
    id:string,
    photo:string,
    username:string
}

export interface ICommon_Route_Res_Organization_User_Item {
    organizationUser:ICommon_Model_Organization_User
    user:ICommon_Model_User,
    role:ICommon_Model_Role,
    tag?:ICommon_Model_Member_Tag[]
}

export interface ICommon_Route_Res_Organization_User_List {
    count:number,
    totalPage:number,
    data:ICommon_Route_Res_Organization_User_Item[]
}

export interface ICommon_Route_Res_Organization_List {
    create:ICommon_Model_Organization[],
    join:ICommon_Model_Organization[]
}

export interface ICommon_Route_Res_Organization_User_Profile {
    teamList:ICommon_Model_Team[],
    organizationUser:ICommon_Model_Organization_User,
    user:ICommon_Model_User
}

export type ICommon_Route_Res_Role_Item = ICommon_Model_Role & {
    permissions:Permission_Base[]
    global?:boolean
}

export interface ICommon_Route_Res_Role_List {
    admin:ICommon_Model_Role,
    users:ICommon_Route_Res_Role_Item[]
}

export interface ICommon_Route_Res_Member_Tag_Member {
    user:ICommon_Model_User,
    organizationUser:ICommon_Model_Organization_User,
    tag:ICommon_Model_Member_Tag
}

export type ICommon_Route_Res_Workflow_Node_List_Item =  {
    id:string,
    name:string,
    data:{
        id:string,
        name:string,
        data:{
            id:string,
            name:string
        }[]
    }[]
}