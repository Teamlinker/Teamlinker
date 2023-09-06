import {BaseModel} from "./base"

export interface ICommon_Model_Sticky_Note {
    id :string ,
    content_id:string,
    user_id:string,
    x:string,
    y:string,
    width:string,
    height:string
}
export const Table_Sticky_Note="sticky_note"

class StickyNoteModel extends BaseModel {
    table=Table_Sticky_Note
    model=<ICommon_Model_Sticky_Note>{}
}

export let stickyNoteModel=new StickyNoteModel