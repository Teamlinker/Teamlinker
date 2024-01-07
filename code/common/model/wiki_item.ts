import {BaseModel} from "./base"

export interface ICommon_Model_Wiki_Item {
    id :string ,
    name :string,
    wiki_id:string,
    parent_id:string,
    created_by:string,
    created_time:string,
    weight:number
}
export const Table_Wiki_Item="wiki_item"

class WikiItemModel extends BaseModel {
    table=Table_Wiki_Item
    model=<ICommon_Model_Wiki_Item>{}
}

export  let wikiItemModel=new WikiItemModel