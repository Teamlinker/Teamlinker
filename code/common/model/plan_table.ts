import {BaseModel} from "./base"

export enum ECommon_Model_Plan_Table {
    STAGE,
    MILESTONE,
    ISSUE
}
export interface ICommon_Model_Plan_Table {
    id :string,
    sort:number,
    type:ECommon_Model_Plan_Table
    name:string,
    ref_id:string,
    progress:number,
    depend_id:string,
    delay:number,
    parent_id:string,
    plan_id:string,
    project_id:string
}
export const Table_Plan_Table="plan_table"

class PlanTableModel extends BaseModel {
    table=Table_Plan_Table
    model=<ICommon_Model_Plan_Table>{}
}

export let planTableModel=new PlanTableModel