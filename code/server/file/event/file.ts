import { getMysqlInstance } from '../../common/db/mysql';
import { DComponent } from "../../common/decorate/component";
import { DEventListener } from "../../common/event/event";
import { EServer_Common_Event_Types } from "../../common/event/types";
import { generateUpdateSql } from '../../common/util/sql';
import { fileModel } from './../../../common/model/file';
@DComponent
class FileEvents {
    @DEventListener(EServer_Common_Event_Types.File.REF)
    async refFile(fileId:string){
        let mysql=getMysqlInstance()
        await mysql.execute(generateUpdateSql(fileModel,{
            ref:{
                exp:"+",
                value:1
            }
        },{
            id:fileId
        }))
    }
    @DEventListener(EServer_Common_Event_Types.File.UNREF)
    async unrefFile(fileId:string){
        let mysql=getMysqlInstance()
        await mysql.execute(generateUpdateSql(fileModel,{
            ref:{
                exp:"-",
                value:1
            }
        },{
            id:fileId
        }))
    }
}
