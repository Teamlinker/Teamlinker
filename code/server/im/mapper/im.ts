import {Mapper} from "../../common/entity/mapper";
import {ICommon_Model_IM_User_Message, iMUserMessageModel} from "../../../common/model/im_user_message";
import {ICommon_Model_IM_Team_Message, iMTeamMessageModel} from "../../../common/model/im_team_message";
import {
    ECommon_IM_Message_EntityType,
    ICommon_Model_IM_UnRead_Message,
    iMUnReadMessageModel
} from "../../../common/model/im_unread_message";
import {Err} from "../../../common/status/error";
import {getMysqlInstance} from "../../common/db/mysql";
import {generateBatchCreateOnUpdateSql, generateQuerySql, generateSnowId} from "../../common/util/sql";
import * as moment from "moment";

class IMUserMessageMapper extends Mapper<typeof iMUserMessageModel> {
    constructor() {
        super(iMUserMessageModel)
    }
    async list(organizationUserIds:[string,string],size:number,lastTime?:number):Promise<ICommon_Model_IM_User_Message[]> {
        if(!organizationUserIds || organizationUserIds.length!=2) {
            throw Err.IM.userNotFound
        }
        let mysql=getMysqlInstance()
        let ret=await mysql.execute(generateQuerySql(iMUserMessageModel,null,{
            created_time:{
                exp:"<",
                value:lastTime?moment(lastTime).format("YYYY-MM-DD HH:mm:ss:SSS"):moment().format("YYYY-MM-DD HH:mm:ss:SSS")
            },
            from_organization_user_id:{
                exp:"in",
                value:organizationUserIds
            },
            to_organization_user_id:{
                exp:"in",
                value:organizationUserIds
            }
        },"and",{
            type:"desc",
            field:"created_time"
        },0,size))
        return ret;
    }
}

export const iMUserMessageMapper=new IMUserMessageMapper

class IMTeamMessageMapper extends Mapper<typeof iMTeamMessageModel> {
    constructor() {
        super(iMTeamMessageModel)
    }

    async list(teamId:string,size:number,lastTime?:number):Promise<ICommon_Model_IM_Team_Message[]> {
        if(!teamId) {
            throw Err.IM.teamNotFound
        }
        let mysql=getMysqlInstance()
        let ret=await mysql.execute(generateQuerySql(iMTeamMessageModel,null,{
            created_time:{
                exp:"<",
                value:lastTime?moment(lastTime).format("YYYY-MM-DD HH:mm:ss:SSS"):moment().format("YYYY-MM-DD HH:mm:ss:SSS")
            },
            team_id:teamId
        },"and",{
            type:"desc",
            field:"created_time"
        },0,size))
        return ret;
    }
}

export const iMTeamMessageMapper=new IMTeamMessageMapper

class IMUnReadMessageMapper extends Mapper<typeof iMUnReadMessageModel> {
    constructor() {
        super(iMUnReadMessageModel)
    }
    async list(organizationUserId:string):Promise<ICommon_Model_IM_UnRead_Message[]> {
        if(!organizationUserId) {
            throw Err.IM.userNotFound
        }
        let mysql=getMysqlInstance()
        let ret=await mysql.execute(generateQuerySql(iMUnReadMessageModel,null,{
            organization_user_id: organizationUserId
        },"and",{
            type:"desc",
            field:"modified_time"
        }))
        return ret;
    }
    async addUser(organizationUserId:string,otherOrganizationUserId:string) {
        if(!organizationUserId) {
            throw Err.IM.userNotFound
        }
        let mysql=getMysqlInstance()
        await mysql.execute(generateBatchCreateOnUpdateSql(iMUnReadMessageModel,[{
            id:await generateSnowId(),
            count:0,
            entity_id:otherOrganizationUserId,
            entity_type:ECommon_IM_Message_EntityType.USER,
            organization_user_id:organizationUserId,
            unique_id:organizationUserId+otherOrganizationUserId
        }],{
            count:{
                exp:"+",
                value:1
            }
        }))
    }
    async addTeam(organizationUserIds:string[],teamId:string) {
        let mysql=getMysqlInstance()
        if(organizationUserIds.length>0) {
            let arr=await Promise.all(organizationUserIds.map(async organizationUserId=>{
                return {
                    id:await generateSnowId(),
                    count:1,
                    entity_id:teamId,
                    entity_type:ECommon_IM_Message_EntityType.TEAM,
                    organization_user_id:organizationUserId,
                    unique_id:organizationUserId+teamId
                }
            }))
            await mysql.execute(generateBatchCreateOnUpdateSql(iMUnReadMessageModel,arr,{
                count:{
                    exp:"+",
                    value:1
                }
            }))
        }
    }

}

export const iMUnReadMessageMapper=new IMUnReadMessageMapper