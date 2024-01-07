import {BaseModel} from "./base";
import {ECommon_Model_Project_Issue_Priority} from "./project_issue";

export interface ICommon_Model_Board_Sprint_SwimLane {
    id:string,
    name:string,
    board_id:string,
    board_sprint_id:string,
    priority:ECommon_Model_Project_Issue_Priority,
    created_time:Date
}
export const Table_Board_Sprint_SwimLane="board_sprint_swimlane"

class BoardSprintSwimLaneModel extends BaseModel {
    table=Table_Board_Sprint_SwimLane
    model=<ICommon_Model_Board_Sprint_SwimLane>{}
}

export let boardSprintSwimLaneModel=new BoardSprintSwimLaneModel