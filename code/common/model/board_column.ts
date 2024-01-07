import {BaseModel} from "./base";

export interface ICommon_Model_Board_Column {
    id:string,
    name:string,
    board_id:string,
    weight:number
}
export const Table_Board_Column="board_column"

class BoardColumnModel extends BaseModel {
    table=Table_Board_Column
    model=<ICommon_Model_Board_Column>{}
}

export let boardColumnModel=new BoardColumnModel