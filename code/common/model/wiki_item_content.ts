import {BaseModel} from "./base"

export enum ECommon_Wiki_Content_Line_Config_Type {
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
    QUOTE_PERSON
}

export type ICommon_Wiki_Content_Line_Style ={
    fontStyle?:string
    fontWeight?:string,
    color?:string,
    backgroundColor?:string,
    textDecoration?:string,
    fontSize?:string
}

export type ICommon_Wiki_Content_Line_Config ={
    style?:ICommon_Wiki_Content_Line_Style,
    value:string
    link?:string,
    type:ECommon_Wiki_Content_Line_Config_Type,
    width?:number,
    label?:string
}

export type ICommon_Wiki_Content_Line ={
    arr:ICommon_Wiki_Content_Line_Config[],
    selectStartIndexPath?:number[],
    selectEndIndexPath?:number[]
}
export interface ICommon_Model_Wiki_Item_Content {
    id :string ,
    wiki_item_id:string,
    content:string,
    modified_time:string,
    modified_by:string
}
export const Table_Wiki_Item_Content="wiki_item_content"

class WikiItemContentModel extends BaseModel {
    table=Table_Wiki_Item_Content
    model=<ICommon_Model_Wiki_Item_Content>{}
}

export  let wikiItemContentModel=new WikiItemContentModel