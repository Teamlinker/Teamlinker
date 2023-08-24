import {BaseModel} from "./base";

export interface ICommon_Model_Board {
    id:string,
    name:string,
    project_id:string,
    description:string
}
export const Table_Board="board"

class BoardModel extends BaseModel {
    table=Table_Board
    model=<ICommon_Model_Board>{}
}

export let boardModel=new BoardModel