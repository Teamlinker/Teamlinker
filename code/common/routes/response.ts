import { ICommon_Model_Field_Solution_Workflow_Node_Field_Type } from "../model/field_solution_workflow_node_field_type";
import { ICommon_Model_Field_Type } from "../model/field_type";
import { ICommon_Model_Field_Type_Config_Value } from "../model/field_type_config_value";
import { ICommon_Model_Issue_Type } from "../model/issue_type";
import { ICommon_Model_Project } from "../model/project";
import { ICommon_Model_Team } from '../model/team';
import { ICommon_Model_User } from '../model/user';
import { ICommon_Model_Field_Solution } from './../model/field_solution';
import { ICommon_Model_Issue_Type_Solution } from './../model/issue_type_solution';
import { ICommon_Model_Project_Issue } from './../model/project_issue';
import { ICommon_Model_Project_Issue_Field_Value } from './../model/project_issue_field_value';
import { ECommon_Model_Project_Member_Type } from './../model/project_member';
import { ICommon_Model_Workflow } from './../model/workflow';
import { ICommon_Model_Workflow_Action } from './../model/workflow_action';
import { ICommon_Model_Workflow_Node } from './../model/workflow_node';
import { ICommon_Model_Workflow_Solution } from './../model/workflow_solution';
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

export interface ICommon_Route_Res_IssueTypeSolution_List_Item extends ICommon_Model_Issue_Type_Solution {
    issueTypeList:ICommon_Model_Issue_Type[],
    projectList:Pick<ICommon_Model_Project,"name"|"photo"|"id"|"description">[]
}

export interface ICommon_Route_Res_Workflow_Info_Node {
    node:ICommon_Model_Workflow_Node,
    fields?:{
        field:ICommon_Model_Field_Solution_Workflow_Node_Field_Type,
        fieldType:ICommon_Model_Field_Type,
        values?:ICommon_Model_Field_Type_Config_Value[]
    }[]
    actions:ICommon_Route_Res_Workflow_Info_Action[]
}

export interface ICommon_Route_Res_Workflow_Info_Action {
    action:ICommon_Model_Workflow_Action,
    destNode:ICommon_Route_Res_Workflow_Info_Node
}

export interface ICommon_Route_Res_Workflow_Info extends ICommon_Model_Workflow {
    data:{
        nodes:ICommon_Model_Workflow_Node[],
        actions:ICommon_Model_Workflow_Action[]
    }
}

export interface ICommon_Route_Res_WorkflowSolution_Info extends ICommon_Model_Workflow_Solution {
    data:{
        issueTypeSolution:ICommon_Model_Issue_Type_Solution,
        data:{
            issueType:ICommon_Model_Issue_Type,
            workflow:ICommon_Model_Workflow
        }[]
    }[]
}

export interface ICommon_Route_Res_FieldSolution_Info extends ICommon_Model_Field_Solution {
    data:{
        workflowSolution:ICommon_Model_Workflow_Solution,
        data:{
            workflow:ICommon_Model_Workflow,
            node:ICommon_Route_Res_Workflow_Info_Node
        }[]
    }[]
}

export interface ICommon_Route_Res_FieldSolution_ListWorkflowNodeField {
    field: ICommon_Model_Field_Solution_Workflow_Node_Field_Type,
    fieldType: ICommon_Model_Field_Type,
    values?: ICommon_Model_Field_Type_Config_Value[]
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

export type ICommon_Route_Res_ProjectIssue_fieldsInfo = ICommon_Route_Res_FieldSolution_ListWorkflowNodeField & ICommon_Model_Project_Issue_Field_Value


export interface ICommon_Route_Res_recentProjectList_Item {
    id:string,
    name:string,
    photo:string,
    notstart:number,
    inprogress:number,
    done:number
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