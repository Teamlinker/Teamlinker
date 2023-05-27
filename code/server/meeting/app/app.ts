import "../http/meeting"
import {handleMeetingConnection} from "../socket/meeting";
import getJobInstance from "../../common/job/job";
import {getMysqlInstance} from "../../common/db/mysql";
import {generateDeleteSql} from "../../common/util/sql";
import {ECommon_Model_Meeting_Room_Type, meetingRoomModel} from "../../../common/model/meeting_room";
import moment = require("moment");

export async function initMeeting() {
    await handleMeetingConnection()
    let job = getJobInstance();
    job.create("remove-schedule-meeting", {
        hour: 0
    }, async (fireDate: Date) => {
        let date=moment(fireDate).subtract(24,"hour").format("YYYY-MM-DD HH:mm:ss")
        let mysql = getMysqlInstance()
        await mysql.execute(generateDeleteSql(meetingRoomModel,{
            type:ECommon_Model_Meeting_Room_Type.SCHEDULE,
            end_time:{
                exp:"<=",
                value:date
            }
        }))
    })
}