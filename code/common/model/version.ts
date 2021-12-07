import { BaseModel } from "./base"

export interface ICommon_Version_Config {
    fileBasePath:string
}
export interface ICommon_Model_Version {
    version:string,
    config:string
}
export const Table_Version="version"

class VersionModel extends BaseModel {
    table=Table_Version
    model=<ICommon_Model_Version>{}
  }
  
  export  let versionModel=new VersionModel