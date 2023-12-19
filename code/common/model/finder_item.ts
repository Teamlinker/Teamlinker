import {BaseModel} from "./base"

export enum ECommon_Model_Finder_Item_Type {
    FILE,
    SHORTCUT,
    FOLDER
}

export enum ECommon_Model_Finder_Shortcut_Type {
    PROJECT="project",
    PROJECT_ISSUE="project_issue",
    PROJECT_RELEASE="project_release",
    BOARD_SPRINT="board_sprint",
    WIKI="wiki",
    WIKI_ITEM="wiki_item",
    CALENDAR_EVENT="calendar_event",
    MEETING_ROOM="meeting_room"
}

export enum ECommon_Model_Finder_Status {
    READY,
    PROCESSING
}

export interface ICommon_Model_Finder_Item {
    id :string,
    name :string,
    type :ECommon_Model_Finder_Item_Type,
    created_time :Date,
    created_by_pure :string,
    ref_id:string,
    parent_folder_id:string,
    organization_id:string,
    file_id:string,
    shortcut_type:ECommon_Model_Finder_Shortcut_Type,
    status:ECommon_Model_Finder_Status
}
export const Table_Finder_Item="finder_item"


class FinderItemModel extends BaseModel {
    table=Table_Finder_Item
    model=<ICommon_Model_Finder_Item>{}
}

export let finderItemModel=new FinderItemModel