import {BaseModel} from "./base"

export enum ECommon_Model_File_Type {
    LOCAL
}
export interface ICommon_Model_File {
    id :string,
    created_by_pure :string,
    size: number ,
    type :ECommon_Model_File_Type,
    created_time :Date,
    path :string,
    ref:number,
    md5:string
}
export const Table_File="file"


class FileModel extends BaseModel {
    table=Table_File
    model=<ICommon_Model_File>{}
  }
  
export let fileModel=new FileModel