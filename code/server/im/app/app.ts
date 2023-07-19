import "../socket/socket"
import "../event/event"
import {handleImConnection} from "../socket/socket";
import getJobInstance from "../../common/job/job";
import {getMysqlInstance} from "../../common/db/mysql";
import {generateDeleteSql, generateQuerySql} from "../../common/util/sql";
import {iMFavoriteMessageModel} from "../../../common/model/im_favorite_message";
import * as moment from "moment/moment";
import {ECommon_IM_Message_ContentType} from "../../../common/model/im_user_message";
import {ECommon_Content_Line_Config_Type, ICommon_Content_Line} from "../../../common/model/content";
import {emitServiceEvent} from "../../common/event/event";

export async function initIM() {
    await handleImConnection()
    let job = getJobInstance();
    job.create("remove-im-messages", {
        minute: 0
    }, async (fireDate: Date) => {
        try {
            let mysql=getMysqlInstance()
            let date=moment().subtract(30,"days")
            let ret=await mysql.execute(generateQuerySql(iMFavoriteMessageModel,null,{
                created_time:{
                    exp:"<",
                    value:date.format("YYYY-MM-DD HH:mm:ss.SSS")
                }
            }))
            for(let obj of ret) {
                if(obj.content_type===ECommon_IM_Message_ContentType.RICH_TEXT) {
                    let objContent=JSON.parse(obj.content) as ICommon_Content_Line[]
                    for(let line of objContent) {
                        for(let config of line.arr) {
                            if(config.type===ECommon_Content_Line_Config_Type.IMAGE || config.type===ECommon_Content_Line_Config_Type.FILE) {
                                emitServiceEvent("fileUnref",config.value)
                            }
                        }
                    }
                }
            }
            await mysql.execute(generateDeleteSql(iMFavoriteMessageModel,{
                created_time:{
                    exp:"<",
                    value:date.format("YYYY-MM-DD HH:mm:ss.SSS")
                }
            }))
        } catch (err) {
            console.error(err)
        }

    })
}