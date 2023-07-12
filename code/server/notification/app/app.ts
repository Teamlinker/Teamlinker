import "../http/notification"
import {handleNotificationConnection} from "../socket/socket";
import getJobInstance from "../../common/job/job";
import {getMysqlInstance} from "../../common/db/mysql";
import {generateDeleteSql} from "../../common/util/sql";
import {notificationModel} from "../../../common/model/notification";
import * as moment from "moment/moment";

export async function initNotification() {
    await handleNotificationConnection()
    let job = getJobInstance();
    job.create("remove-notifications", {
        minute: 0
    }, async (fireDate: Date) => {
        let mysql = getMysqlInstance()
        await mysql.execute(generateDeleteSql(notificationModel,{
            created_time:{
                exp:"<",
                value:moment().subtract("30","days").format("YYYY-MM-DD HH:mm:ss")
            },
        }))
    })
}