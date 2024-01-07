import {ICommon_Model_Workflow_Node_Field_Type} from "../model/workflow_node_field_type";
import {ICommon_Model_Workflow_Node_Field_Type_Config} from "../model/workflow_node_field_type_config";
import {ICommon_Model_Issue_Type} from "../model/issue_type";
import {ICommon_Model_Organization} from "../model/organization";
import {ICommon_Model_Project} from "../model/project";
import {ICommon_Model_Team} from '../model/team';
import {ICommon_Model_User} from '../model/user';
import {ICommon_Model_Issue_Type_Solution} from './../model/issue_type_solution';
import {ICommon_Model_Organization_User} from './../model/organization_user';
import {ECommon_Model_Project_Issue_Priority, ICommon_Model_Project_Issue} from './../model/project_issue';
import {ICommon_Model_Project_Issue_Field_Value} from './../model/project_issue_field_value';
import {ECommon_Model_Organization_Member_Type} from './../model/organization';
import {ICommon_Model_Project_Release} from './../model/project_release';
import {ICommon_Model_Workflow_Action} from './../model/workflow_action';
import {ICommon_Model_Workflow_Node} from './../model/workflow_node';
import {ICommon_Model_Role} from "../model/role";
import {Permission_Base} from "../permission/permission";
import {ICommon_Model_Member_Tag} from "../model/member_tag";
import {ICommon_Field_Type} from "../field/type";
import {ICommon_Model_Wiki} from "../model/wiki";
import {ICommon_Model_Calendar_Event} from "../model/calendar_event";
import {ECommon_Calendar_Color, ICommon_Model_Calendar} from "../model/calendar";
import {ICommon_Model_Finder_Item} from "../model/finder_item";
import {ICommon_Model_File} from "../model/file";
import {ICommon_Model_Wiki_Item} from "../model/wiki_item";
import {ICommon_Model_Meeting_Room} from "../model/meeting_room";
import {ICommon_Model_Notification} from "../model/notification";
import {ICommon_Model_Meeting_Miss_Call} from "../model/meeting_miss_call";
import {ICommon_Model_Workflow_Approval} from "../model/workflow_approval";
import {ICommon_Model_Project_Issue_Approval} from "../model/project_issue_approval";
import {ICommon_Model_Board_Sprint} from "../model/board_sprint";
import {ICommon_Model_Board_Sprint_SwimLane} from "../model/board_sprint_swimlane";
import {ICommon_Model_Board} from "../model/board";
import {ICommon_Model_Board_Column} from "../model/board_column";
import {ICommon_Model_Sticky_Note} from "../model/sticky_note";
import {ICommon_Model_Content} from "../model/content";
import {ICommon_Model_Photo} from "../model/photo";
import {ICommon_Model_Plan_Table} from "../model/plan_table";
import {ICommon_Model_Plan} from "../model/plan";

export interface ICommon_Route_Res_Project_CreateModule_Data {
    id:string,
    name:string,
    data:ICommon_Route_Res_Project_CreateModule_Data[]
}

export type ICommon_Route_Res_Role_Member_Item = {
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

export type ICommon_Route_Res_Role_ListMember ={
    count:number,
    totalPage:number,
    page:number,
    data:ICommon_Route_Res_Role_Member_Item[]
}

export type ICommon_Route_Res_User_Profile={
    info:Omit<ICommon_Model_User,"password">,
    team:ICommon_Route_Res_User_TeamList,
    organizationUser:ICommon_Model_Organization_User
}

export type ICommon_Route_Res_Wiki_Item_Info=ICommon_Model_Wiki_Item & {
    wiki:ICommon_Model_Wiki
}

export type ICommon_Route_Res_Wiki_Item_Filter={
    data:ICommon_Route_Res_Wiki_Item_Info[],
    count:number,
    totalPage:number,
    page:number
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
    nodes:(ICommon_Model_Workflow_Node & {
        approval?:ICommon_Model_Workflow_Approval
    })[],
    actions:ICommon_Model_Workflow_Action[]
}

export interface ICommon_Route_Res_Workflow_Node_Field {
    field: ICommon_Model_Workflow_Node_Field_Type,
    fieldType: ICommon_Field_Type,
    values?: ICommon_Model_Workflow_Node_Field_Type_Config[]
}


export type ICommon_Route_Req_ProjectIssue_Field={
    fieldId:string,
    value?:string[]|number|string
}

export type ICommon_Route_Req_ProjectIssue_Field_Value={
    fieldId:string,
    fieldValueId:string,
    value?:string[]|number|string
}

export interface ICommon_Route_Res_ProjectIssue_BasicInfo extends Omit<ICommon_Model_Project_Issue,"workflow_node_id"|"issue_type_id"|"project_id"> {
    workflowNode:ICommon_Model_Workflow_Node
    issueType:ICommon_Model_Issue_Type,
    project:ICommon_Model_Project,
    approval?:ICommon_Model_Project_Issue_Approval & {
        reason?:string,
        workflowNode:ICommon_Model_Workflow_Node
    }
}

export type ICommon_Route_Res_ProjectIssue_fieldsInfo = {
    nodeField:ICommon_Route_Res_Workflow_Node_Field,
    issueFieldValue:ICommon_Model_Project_Issue_Field_Value
}


export interface ICommon_Route_Res_recentProjectList_Item {
    keyword:string,
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

export interface ICommon_Route_Res_userWikiList {
    count:number,
    totalPage:number,
    page:number,
    data:ICommon_Model_Wiki[]
}

export interface ICommon_Route_Res_Project_Issue_filter_Item {
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
    created_time:Date,
    created_by:string,
    priority:ECommon_Model_Project_Issue_Priority,
    project:ICommon_Model_Project
}

export interface ICommon_Route_Res_Project_Issue_filter {
    data:ICommon_Route_Res_Project_Issue_filter_Item[],
    count:number,
    totalPage:number,
    page:number,
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
    done:number,
    project:ICommon_Model_Project
}

export type ICommon_Route_Res_Release_Info_Issue_Item = Omit<ICommon_Model_Project_Issue,"issue_type_id"|"workflow_node_id"> & {
    issueType:ICommon_Model_Issue_Type,
    workflowNode:ICommon_Model_Workflow_Node
}

export interface ICommon_Route_Res_Release_Info extends ICommon_Route_Res_Release_Item{
    issueList:ICommon_Route_Res_Release_Info_Issue_Item[]
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

export type ICommon_Route_Res_Wiki_Info_Item={
    id:string,
    name:string,
    data?:ICommon_Route_Res_Wiki_Info_Item[]
}

export type ICommon_Route_Res_Wiki_Info=ICommon_Model_Wiki & {
    data?:ICommon_Route_Res_Wiki_Info_Item[]
}

export type ICommon_Route_Res_Calendar_ListEvent_Item = {
    id:string,
    name:string,
    color:ECommon_Calendar_Color,
    start_time:Date,
    end_time:Date,
    calendar:{
        id:string,
        name:string
    },
    all_day:number,
    reminder_minutes:number,
    created_by:string
}

export type ICommon_Route_Res_Calendar_Event_Info = ICommon_Model_Calendar_Event & {
    guestList:{
        userId:string,
        organizationUserId:string,
        nickname:string,
        photo?:string
    }[],
    agenda:string,
    meeting?:string
}

export type ICommon_Route_Res_Calendar_Event_Filter={
    count:number,
    totalPage:number,
    page:number,
    data:(ICommon_Model_Calendar_Event & {
        calendar:ICommon_Model_Calendar
    })[]
}

export type ICommon_Route_Res_Organization_FilterUserAndTeam = {
    users:{
        id:string,
            name:string,
            photo:string
    }[],
    teams:{
        id:string,
            name:string,
            photo:string
    }[]
}

export type ICommon_Route_Res_Finder_Info = ICommon_Model_Finder_Item &  {
    file?:ICommon_Model_File,
    organization?:ICommon_Model_Organization,
    shortcut?:ICommon_Model_Project|ICommon_Model_Project_Issue|ICommon_Model_Project_Release|ICommon_Model_Wiki|ICommon_Model_Wiki_Item|ICommon_Model_Calendar_Event|ICommon_Model_Meeting_Room|ICommon_Model_Board_Sprint,
    parentFolderList:{
        id:string,
        name:string
    }[]
}

export type ICommon_Route_Res_Organization_User=ICommon_Model_Organization_User & {
    user:ICommon_Model_User
}

export type ICommon_Route_Res_Notification_Item = ICommon_Model_Notification & {
    data:ICommon_Model_Organization|ICommon_Model_Team|{
        issue:ICommon_Model_Project_Issue,
        project:ICommon_Model_Project
    }|ICommon_Model_Wiki_Item|ICommon_Model_Calendar_Event|ICommon_Model_Meeting_Room,
    operationOrganizationUser?:{
        id:string,
        photo?:string,
        name:string
    },
    organization?:ICommon_Model_Organization
}

export type ICommon_Route_Res_Meeting_Miss_Call = (ICommon_Model_Meeting_Miss_Call & {
    organizationUser:ICommon_Model_Organization_User
})

export type ICommon_Route_Res_Board_Sprint_Info_Issue=ICommon_Model_Project_Issue & {
    workflowNode:ICommon_Model_Workflow_Node,
    issueType:ICommon_Model_Issue_Type,
    approval?:ICommon_Model_Project_Issue_Approval & {
        reason?:string,
        workflowNode:ICommon_Model_Workflow_Node
    }
}

export type ICommon_Route_Res_Board_Sprint_Info = ICommon_Model_Board_Sprint & {
    swimLanes:ICommon_Model_Board_Sprint_SwimLane[],
    issues:(ICommon_Route_Res_Board_Sprint_Info_Issue & {
        swimLaneId:string,
    })[],
    board:ICommon_Model_Board,
    project:ICommon_Model_Project
}

export type ICommon_Route_Res_Board_List={
    count:number,
    totalPage:number,
    page:number,
    data:ICommon_Model_Board[]
}

export type ICommon_Route_Res_Board_Sprint_List={
    count:number,
    totalPage:number,
    page:number,
    data:ICommon_Model_Board_Sprint[]
}

export type ICommon_Route_Res_Board_Column_Workflow_Node_Item={
    workflowNode:ICommon_Model_Workflow_Node,
    issueType:ICommon_Model_Issue_Type,
    boardColumn:ICommon_Model_Board_Column
}

export type ICommon_Route_Res_Board_Sprint_Issue_Item=ICommon_Model_Project_Issue & {
    swimLane?:ICommon_Model_Board_Sprint_SwimLane,
    approval?:ICommon_Model_Project_Issue_Approval & {
        reason?:string,
        workflowNode:ICommon_Model_Workflow_Node
    }
}

export type ICommon_Route_Res_Board_Issue_Action ={
    nextActionList:ICommon_Model_Workflow_Action[]
    isDirect:boolean
}

export type ICommon_Route_Res_Board_Sprint_filter_Item=ICommon_Model_Board_Sprint & {
    board:ICommon_Model_Board,
    project:ICommon_Model_Project
}

export interface ICommon_Route_Res_Board_Sprint_filter {
    data:ICommon_Route_Res_Board_Sprint_filter_Item[],
    count:number,
    totalPage:number,
    page:number,
}

export type ICommon_Route_Res_Project_Statics={
    issueCount:number,
    issueUnDoneCount:number,
    releaseCount:number,
    sprintCount:number,
    myRecentIssueList:ICommon_Model_Project_Issue[],
    recentReleaseList:ICommon_Model_Project_Release[],
    userIssueList:{
        count:number,
        user:{
            organizationUserId:string,
            name:string,
            photo:string
        }
    }[],
    userUnDoneIssueList:{
        count:number,
        user:{
            organizationUserId:string,
            name:string,
            photo:string
        }
    }[]
}

export type ICommon_Route_Res_Organization_Statics={
    projectCount:number,
    issueCount:number,
    wikiSpaceCount:number,
    wikiItemCount:number,
    userCount:number,
    teamCount:number,
    projectWithIssueList:{
       project:ICommon_Model_Project,
       issueCount:number
    }[]
    projectWithUnDoneIssueList:{
        project:ICommon_Model_Project,
        issueCount:number
    }[]
    wikiSpaceWithWikiItemList:{
        wikiSpace:ICommon_Model_Wiki,
        wikiItemCount:number
    }[],
    teamWithUserList:{
        team:ICommon_Model_Team,
        userCount:number
    }[]
}

export type ICommon_Route_Res_Global_Search_Board_Item=ICommon_Model_Board & {
    project:ICommon_Model_Project
}

export type ICommon_Route_Res_Global_Search_Board_Sprint_Item=ICommon_Model_Board_Sprint & {
    project:ICommon_Model_Project,
    board:ICommon_Model_Board
}

export type ICommon_Route_Res_Global_Search_Project_Issue_Item=ICommon_Model_Project_Issue & {
    project:ICommon_Model_Project
}

export type ICommon_Route_Res_Global_Search_Project_Release_Item=ICommon_Model_Project_Release & {
    project:ICommon_Model_Project
}

export type ICommon_Route_Res_Global_Search_Wiki_Item=ICommon_Model_Wiki_Item & {
    wiki:ICommon_Model_Wiki
}

export type ICommon_Route_Res_Sticky_Note_Item = ICommon_Model_Sticky_Note & {
    content:ICommon_Model_Content
}

export type ICommon_Route_Res_Photo_item =ICommon_Model_Photo & {
    path:string
}

export type ICommon_Route_Res_RecentIssue_Item= ICommon_Model_Project_Issue & {
    project:ICommon_Model_Project
}

export type ICommon_Route_Res_Plan_Info_Item=ICommon_Model_Plan_Table & {
    issue?:ICommon_Model_Project_Issue,
    workflow?:ICommon_Model_Workflow_Node,
    children?:ICommon_Route_Res_Plan_Info_Item[]
}

export type ICommon_Route_Res_Plan_Info = ICommon_Model_Plan & {
    data:ICommon_Route_Res_Plan_Info_Item[]
}

export type ICommon_Route_Res_Plan_List={
    count:number,
    totalPage:number,
    page:number,
    data:ICommon_Model_Plan[]
}