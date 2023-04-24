import {BaseModel} from "./base"

export interface ICommon_Model_Wiki {
    id :string ,
    name :string,
    photo:string,
    description :string,
    organization_id:string,
    created_by:string,
    created_time:string,
    modified_time:string
}
export const Table_Wiki="wiki"

class WikiModel extends BaseModel {
    table=Table_Wiki
    model=<ICommon_Model_Wiki>{}
}

export  let wikiModel=new WikiModel