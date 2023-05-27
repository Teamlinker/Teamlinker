import {getMysqlInstance} from '../../common/db/mysql';
import {DComponent} from "../../common/decorate/component";
import {DEventListener} from "../../common/event/event";
import {generateUpdateSql} from '../../common/util/sql';
import {fileModel} from './../../../common/model/file';

@DComponent
class FileEvents {
    @DEventListener("fileRef")
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
    @DEventListener("fileUnref")
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
