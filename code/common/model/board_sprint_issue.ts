import {BaseModel} from "./base";

export interface ICommon_Model_Board_Sprint_Issue {
    id:string,
    board_sprint_swimlane_id:string
    board_id:string,
    project_issue_id:string,
    board_sprint_id:string
}
export const Table_Board_Sprint_Issue="board_sprint_issue"

class BoardSprintIssueModel extends BaseModel {
    table=Table_Board_Sprint_Issue
    model=<ICommon_Model_Board_Sprint_Issue>{}
}

export let boardSprintIssueModel=new BoardSprintIssueModel