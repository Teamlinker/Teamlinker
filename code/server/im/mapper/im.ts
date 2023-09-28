import {Mapper} from "../../common/entity/mapper";
import {ICommon_Model_IM_User_Message, iMUserMessageModel} from "../../../common/model/im_user_message";
import {ICommon_Model_IM_Team_Message, iMTeamMessageModel} from "../../../common/model/im_team_message";
import {
    ECommon_IM_Message_At,
    ECommon_IM_Message_EntityType,
    ICommon_Model_IM_UnRead_Message,
    iMUnReadMessageModel
} from "../../../common/model/im_unread_message";
import {Err} from "../../../common/status/error";
import {getMysqlInstance} from "../../common/db/mysql";
import {
    generateBatchCreateOnUpdateSql,
    generateDeleteSql,
    generateQuerySql,
    generateSnowId,
    generateUpdateSql
} from "../../common/util/sql";
import * as moment from "moment";
import {ICommon_Model_IM_Favorite_Message, iMFavoriteMessageModel} from "../../../common/model/im_favorite_message";

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
                value:lastTime?moment(lastTime).format("YYYY-MM-DD HH:mm:ss.SSS"):moment().format("YYYY-MM-DD HH:mm:ss.SSS")
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

    async search(organizationUserId:string,keyword:string):Promise<ICommon_Model_IM_User_Message[]> {
        if(!organizationUserId) {
            throw Err.IM.userNotFound
        }
        let mysql=getMysqlInstance()
        let sql=generateQuerySql(iMUserMessageModel,null,{
            content:{
                exp:"regexp",
                value:`"value":"[^\\"\\:\\,]*${keyword}[^\\"\\:\\,]*"`
            },
            "$or0": {
                from_organization_user_id:organizationUserId,
                to_organization_user_id:organizationUserId
            }
        },"and")
        let ret=await mysql.execute(sql)
        return ret;
    }

    async locate(organizationUserIds:[string,string],messageId:string) {
        if(!organizationUserIds || organizationUserIds.length!=2) {
            throw Err.IM.userNotFound
        } else if(!messageId) {
            throw Err.IM.messageNotFound
        }
        let mysql=getMysqlInstance()
        let ret=await mysql.execute(generateQuerySql(iMUserMessageModel,null,{
            id:{
                exp:">=",
                value:messageId
            },
            from_organization_user_id:{
                exp:"in",
                value:organizationUserIds
            },
            to_organization_user_id:{
                exp:"in",
                value:organizationUserIds
            }
        }))
        return ret;
    }

    async clearByOrganizationId(organizationId:string) {
        if(!organizationId) {
            return
        }
        let mysql=getMysqlInstance()
        await mysql.execute(generateDeleteSql(iMUserMessageModel,{
            organization_id:organizationId
        }))
    }

    async clearByOrganizationUserId(organizationUserId:string) {
        if(!organizationUserId) {
            return
        }
        let mysql=getMysqlInstance()
        await mysql.execute(generateDeleteSql(iMUserMessageModel,{
            from_organization_user_id:organizationUserId,
            to_organization_user_id:organizationUserId
        },"or"))
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
                value:lastTime?moment(lastTime).format("YYYY-MM-DD HH:mm:ss.SSS"):moment().format("YYYY-MM-DD HH:mm:ss.SSS")
            },
            team_id:teamId
        },"and",{
            type:"desc",
            field:"created_time"
        },0,size))
        return ret;
    }

    async search(teamIds:string[],keyword:string):Promise<ICommon_Model_IM_Team_Message[]> {
        if(!teamIds || teamIds.length==0) {
            return []
        }
        let mysql=getMysqlInstance()
        let sql=generateQuerySql(iMTeamMessageModel,null,{
            team_id:{
                exp:"in",
                value:teamIds
            },
            content:{
                exp:"regexp",
                value:`"value":"[^\\"\\:\\,]*${keyword}[^\\"\\:\\,]*"`
            },
        })
        let ret=await mysql.execute(sql)
        return ret;
    }

    async locate(teamId:string,messageId:string):Promise<ICommon_Model_IM_Team_Message[]> {
        if(!teamId) {
            throw Err.IM.teamNotFound
        } else if(!messageId) {
            throw Err.IM.messageNotFound
        }
        let mysql=getMysqlInstance()
        let ret=await mysql.execute(generateQuerySql(iMTeamMessageModel,null,{
            id:{
                exp:">=",
                value:messageId
            },
            team_id:teamId
        }))
        return ret;
    }
    async clearByOrganizationId(organizationId:string) {
        if(!organizationId) {
            return
        }
        let mysql=getMysqlInstance()
        await mysql.execute(generateDeleteSql(iMTeamMessageModel,{
            organization_id:organizationId
        }))
    }

    async clearByOrganizationUserId(organizationUserId:string,deletedOrganizationUserId:string) {
        if(!organizationUserId) {
            return
        }
        let mysql=getMysqlInstance()
        await mysql.execute(generateUpdateSql(iMTeamMessageModel,{
            from_organization_user_id:deletedOrganizationUserId,
        },{
            from_organization_user_id:organizationUserId
        }))
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
    async addUser(organizationUserId:string,otherOrganizationUserId:string,organizationId:string) {
        if(!organizationUserId) {
            throw Err.IM.userNotFound
        }
        let mysql=getMysqlInstance()
        await mysql.execute(generateBatchCreateOnUpdateSql(iMUnReadMessageModel,[{
            id:await generateSnowId(),
            count:0,
            entity_id:organizationUserId,
            entity_type:ECommon_IM_Message_EntityType.USER,
            organization_user_id:otherOrganizationUserId,
            unique_id:otherOrganizationUserId+organizationUserId,
            organization_id:organizationId
        }],{
            count:{
                exp:"+",
                value:1
            }
        }))
    }
    async addTeam(organizationUserIds:string[],teamId:string,objAt:{
        all:boolean,
        [param:string]:boolean
    },organizationId:string) {
        let mysql=getMysqlInstance()
        if(organizationUserIds.length>0) {
            let arr=await Promise.all(organizationUserIds.map(async organizationUserId=>{
                let at=ECommon_IM_Message_At.NONE
                if(objAt.all && objAt[organizationUserId]) {
                    at=ECommon_IM_Message_At.ALL | ECommon_IM_Message_At.SPECIFIC
                } else if(objAt.all) {
                    at=ECommon_IM_Message_At.ALL
                } else if(objAt[organizationUserId]) {
                    at=ECommon_IM_Message_At.SPECIFIC
                }
                return {
                    id:await generateSnowId(),
                    count:1,
                    entity_id:teamId,
                    entity_type:ECommon_IM_Message_EntityType.TEAM,
                    organization_user_id:organizationUserId,
                    unique_id:organizationUserId+teamId,
                    at,
                    organization_id:organizationId
                } as ICommon_Model_IM_UnRead_Message
            }))
            await mysql.execute(generateBatchCreateOnUpdateSql(iMUnReadMessageModel,arr,{
                count:{
                    exp:"+",
                    value:1
                }
            }))
        }
    }

    async clearByOrganizationId(organizationId:string) {
        if(!organizationId) {
            return
        }
        let mysql=getMysqlInstance()
        await mysql.execute(generateDeleteSql(iMUnReadMessageModel,{
            organization_id:organizationId
        }))
    }

    async clearByOrganizationUserId(organizationUserId:string) {
        if(!organizationUserId) {
            return
        }
        let mysql=getMysqlInstance()
        await mysql.execute(generateDeleteSql(iMUnReadMessageModel,{
            organization_user_id:organizationUserId
        }))
    }

}

export const iMUnReadMessageMapper=new IMUnReadMessageMapper

class IMFavoriteMessageMapper extends Mapper<typeof iMFavoriteMessageModel> {
    constructor() {
        super(iMFavoriteMessageModel)
    }
    async list(organizationUserId:string,size:number,lastTime?:number):Promise<ICommon_Model_IM_Favorite_Message[]> {
        if(!organizationUserId) {
            throw Err.IM.userNotFound
        }
        let mysql=getMysqlInstance()
        let ret=await mysql.execute(generateQuerySql(iMFavoriteMessageModel,null,{
            created_time:{
                exp:"<",
                value:lastTime?moment(lastTime).format("YYYY-MM-DD HH:mm:ss.SSS"):moment().format("YYYY-MM-DD HH:mm:ss.SSS")
            },
            organization_user_id:organizationUserId
        },"and",{
            type:"desc",
            field:"created_time"
        },0,size))
        return ret;
    }

    async clearByOrganizationId(organizationId:string) {
        if(!organizationId) {
            return
        }
        let mysql=getMysqlInstance()
        await mysql.execute(generateDeleteSql(iMFavoriteMessageModel,{
            organization_id:organizationId
        }))
    }

    async clearByOrganizationUserId(organizationUserId:string) {
        if(!organizationUserId) {
            return
        }
        let mysql=getMysqlInstance()
        await mysql.execute(generateDeleteSql(iMFavoriteMessageModel,{
            organization_user_id:organizationUserId
        }))
    }
}

export const iMFavoriteMessageMapper=new IMFavoriteMessageMapper