import {BaseModel} from "./base"

export interface ICommon_Model_Plan {
    id :string ,
    name:string,
    start_time:Date,
    organization_user_id:string,
    project_id:string,
    organization_id:string
}
export const Table_Plan="plan"

class PlanModel extends BaseModel {
    table=Table_Plan
    model=<ICommon_Model_Plan>{}
}

export let planModel=new PlanModel