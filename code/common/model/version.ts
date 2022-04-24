import { BaseModel } from "./base"

export interface ICommon_Model_Version {
    version:string
}
export const Table_Version="version"

class VersionModel extends BaseModel {
    table=Table_Version
    model=<ICommon_Model_Version>{}
  }
  
export  let versionModel=new VersionModel