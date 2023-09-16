import {Mapper} from "../../common/entity/mapper";
import {ECommon_Model_Meeting_Room_Type, meetingRoomModel} from "../../../common/model/meeting_room";
import {Err} from "../../../common/status/error";
import {generateDeleteSql, generatePageAndCount, generateQuerySql} from "../../common/util/sql";
import {getMysqlInstance} from "../../common/db/mysql";
import * as moment from "moment/moment";

class MeetingRoomMapper extends Mapper<typeof meetingRoomModel> {
    constructor() {
        super(meetingRoomModel)
    }

    async list(organizationUserId:string,page:number,size:number,keyword?:string) {
        if(page===undefined || page<0 || size===undefined || size<=0) {
            throw Err.Common.paramError
        }
        let nowStr=moment().subtract(6,"hour").format("YYYY-MM-DD HH:mm")
        let mysql=getMysqlInstance()
        let sql=generateQuerySql(meetingRoomModel,null,{
            created_by:organizationUserId,
            ...(keyword && {
                name:{
                    exp:"%like%",
                    value:keyword
                }
            }),
            "$or0":{
                start_time:{
                    exp: ">=",
                    value: nowStr
                },
                end_time:{
                    exp:">=",
                    value:nowStr
                }
            },
            type:ECommon_Model_Meeting_Room_Type.SCHEDULE
        },"and",{
            type:"asc",
            field:"start_time"
        },page*size,size)
        let {count,totalPage}=await generatePageAndCount(sql,size)
        let ret=await mysql.execute(sql)
        return {
            data:ret,
            count:count,
            totalPage:totalPage,
            page:page,
        }
    }

    async roomsByRelatedIds(relatedIds:string[]) {
        if(relatedIds.length==0) {
            return []
        }
        let mysql=getMysqlInstance()
        let ret=await mysql.execute(generateQuerySql(meetingRoomModel,null,{
            related_id:{
                exp:"in",
                value:relatedIds
            }
        }))
        return ret;
    }

    async clear(organizationUserId:string) {
        let mysql=getMysqlInstance()
        await mysql.execute(generateDeleteSql(meetingRoomModel,{
            created_by:organizationUserId
        }))
    }

    async clearByOrganizationId(organizationId:string) {
        let mysql=getMysqlInstance()
        await mysql.execute(generateDeleteSql(meetingRoomModel,{
            organization_id:organizationId
        }))
    }

    async clearByRelatedId(relatedId:string) {
        let mysql=getMysqlInstance()
        await mysql.execute(generateDeleteSql(meetingRoomModel,{
            related_id:relatedId
        }))
    }
}

export const meetingRoomMapper=new MeetingRoomMapper
