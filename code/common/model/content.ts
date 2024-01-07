import {BaseModel} from "./base"

export enum ECommon_Content_Line_Config_Type {
    TEXT,
    LINK,
    IMAGE,
    FILE,
    PROJECT,
    PROJECT_ISSUE,
    PROJECT_RELEASE,
    WIKI,
    WIKI_ITEM,
    CALENDAR_EVENT,
    MEETING_ROOM,
    QUOTE_PERSON,
    BOARD_SPRINT
}

export type ICommon_Content_Line_Style ={
    fontStyle?:string
    fontWeight?:string,
    color?:string,
    backgroundColor?:string,
    textDecoration?:string,
    fontSize?:string
}

export type ICommon_Content_Line_Config ={
    style?:ICommon_Content_Line_Style,
    value:string
    link?:string,
    type:ECommon_Content_Line_Config_Type,
    width?:number,
    label?:string
}

export type ICommon_Content_Line ={
    arr:ICommon_Content_Line_Config[],
    selectStartIndexPath?:number[],
    selectEndIndexPath?:number[]
}
export enum ECommon_Model_Content_Type {
    PROJECT_ISSUE_COMMENT,
    PROJECT_ISSUE_DESCRIPTION,
    WIKI_ITEM,
    MEETING_CHAT,
    CALENDAR_EVENT_AGENDA,
    PROJECT_ISSUE_REJECT,
    STICKY_NOTE
}

export interface ICommon_Model_Content {
    id:string,
    type:ECommon_Model_Content_Type,
    ref_id:string,
    created_by:string,
    content:string,
    created_time:Date,
    modified_time:Date,
    organization_id:string,
    modified_by:string,
    created_by_pure:string
}
export const Table_Content="content"

class ContentModel extends BaseModel {
    table=Table_Content
    model=<ICommon_Model_Content>{}
}

export let contentModel=new ContentModel