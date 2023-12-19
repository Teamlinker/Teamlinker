import {BaseModel} from "./base"

export interface ICommon_Model_Photo {
    id :string ,
    file_id:string,
    user_id:string,
    x:string,
    y:string,
    width:string,
    height:string
}
export const Table_Photo="photo"

class PhotoModel extends BaseModel {
    table=Table_Photo
    model=<ICommon_Model_Photo>{}
}

export let photoModel=new PhotoModel