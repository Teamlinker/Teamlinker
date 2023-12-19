import {BaseModel} from "./base";

export interface ICommon_Model_Board_Issue_Type {
    id:string,
    board_id:string,
    issue_type_id:string
}
export const Table_Board_Issue_type="board_issue_type"

class BoardIssueTypeModel extends BaseModel {
    table=Table_Board_Issue_type
    model=<ICommon_Model_Board_Issue_Type>{}
}

export let boardIssueTypeModel=new BoardIssueTypeModel