import {BaseModel} from "./base"

export interface ICommon_Model_Wiki_Item_Content {
    id :string ,
    wiki_item_id:string,
    content:string,
    modified_time:string,
    modified_by:string
}
export const Table_Wiki_Item_Content="wiki_item_content"

class WikiItemContentModel extends BaseModel {
    table=Table_Wiki_Item_Content
    model=<ICommon_Model_Wiki_Item_Content>{}
}

export  let wikiItemContentModel=new WikiItemContentModel