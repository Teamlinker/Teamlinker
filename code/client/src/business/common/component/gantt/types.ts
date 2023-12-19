import {ECommon_Model_Plan_Table} from "../../../../../../common/model/plan_table";

export type GanttDataItem={
    key:string,
    type:ECommon_Model_Plan_Table,
    uniqueId?:string,   // issue
    projectIssueId?:string // issue
    name:string,
    manDay?:number,     //set :issue,calc:plan
    depend?:string,
    delay?:number,
    progress?:number,    //issue,plan
    showProgress?:number
    completed?:boolean,  // milestone
    startDate?:number,    //plan,issue
    endDate?:number,
    children?:GanttDataItem[]   //issue,plan
    parentId:string
}

export type GanttLine={
    key:string,
    left:number,
    width?:number,
    color:string,
    colorUndone?:string,
    type:ECommon_Model_Plan_Table,
    parentKey:string,
    progress?:number,
    showProgress?:number
    depend?:string,
    delay?:number,
    hasChild?:boolean,
}