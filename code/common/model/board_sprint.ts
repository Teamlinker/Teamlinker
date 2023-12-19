import {BaseModel} from "./base";

export enum ECommon_Model_Board_Sprint_Status {
    NOTSTART,
    STARTING,
    COMPLETED
}

export interface ICommon_Model_Board_Sprint {
    id:string,
    name:string,
    board_id:string,
    start_time:string,
    end_time:string,
    status:ECommon_Model_Board_Sprint_Status
}
export const Table_Board_Sprint="board_sprint"

class BoardSprintModel extends BaseModel {
    table=Table_Board_Sprint
    model=<ICommon_Model_Board_Sprint>{}
}

export let boardSprintModel=new BoardSprintModel