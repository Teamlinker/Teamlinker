import { BaseModel } from "./base"

export enum ECommon_Model_Comment_Type {
    PROJECT
}

export interface ICommon_Model_Comment {
    id:string,
    type:ECommon_Model_Comment_Type,
    type_id:string,
    created_by:string,
    content:string,
    created_time:Date,
    modified_time:Date
}
export const Table_Comment="comment"

class CommentModel extends BaseModel {
    table=Table_Comment
    model=<ICommon_Model_Comment>{}
}

export let commentModel=new CommentModel