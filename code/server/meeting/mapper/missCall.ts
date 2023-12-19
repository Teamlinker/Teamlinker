import {Mapper} from "../../common/entity/mapper";
import {meetingMissCallModel} from "../../../common/model/meeting_miss_call";
import {Err} from "../../../common/status/error";
import {getMysqlInstance} from "../../common/db/mysql";
import {generateQuerySql, generateUpdateSql} from "../../common/util/sql";

class MeetingMissCallMapper extends Mapper<typeof meetingMissCallModel> {
    constructor() {
        super(meetingMissCallModel)
    }
    async list(organizationUserId:string) {
        if(!organizationUserId) {
            throw Err.Meeting.organizationUserNotFound
        }
        let mysql=getMysqlInstance()
        let ret=await mysql.execute(generateQuerySql(meetingMissCallModel,null,{
            to_organization_user_id:organizationUserId
        },"and",{
            type:"desc",
            field:"created_time"
        }))
        return ret;
    }
    async readAll(organizationUserId:string) {
        if(!organizationUserId) {
            throw Err.Meeting.organizationUserNotFound
        }
        let mysql=getMysqlInstance()
        await mysql.execute(generateUpdateSql(meetingMissCallModel,{
            is_read:1
        },{
            to_organization_user_id:organizationUserId
        }))
    }
    async unReadCount(organizationUserId:string) {
        if (!organizationUserId) {
            throw Err.Meeting.organizationUserNotFound
        }
        let mysql = getMysqlInstance()
        let ret=await mysql.execute(generateQuerySql(meetingMissCallModel,["id"],{
            is_read:0,
            to_organization_user_id:organizationUserId
        }))
        return ret.length
    }
}

export const meetingMissCallMapper=new MeetingMissCallMapper