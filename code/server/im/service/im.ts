import {Entity} from "../../common/entity/entity";
import {ICommon_Model_IM_User_Message, iMUserMessageModel} from "../../../common/model/im_user_message";
import {iMFavoriteMessageMapper, iMTeamMessageMapper, iMUnReadMessageMapper, iMUserMessageMapper} from "../mapper/im";
import {ICommon_Model_IM_Team_Message, iMTeamMessageModel} from "../../../common/model/im_team_message";
import {ICommon_Model_IM_UnRead_Message, iMUnReadMessageModel} from "../../../common/model/im_unread_message";
import rpcUserApi from "../../user/rpc/user"
import {ICommon_Model_IM_Favorite_Message, iMFavoriteMessageModel} from "../../../common/model/im_favorite_message";
import {Err} from "../../../common/status/error";

export class IMUserMessageService extends Entity<typeof iMUserMessageModel,typeof iMUserMessageMapper> {
    constructor() {
        super(iMUserMessageMapper)
    }
    static async list(organizationUserIds:[string,string],size:number,lastTime?:number):Promise<ICommon_Model_IM_User_Message[]> {
        let ret=await iMUserMessageMapper.list(organizationUserIds,size,lastTime)
        return ret;
    }
    static async search(organizationUserId:string,keyword:string) {
        let ret=await iMUserMessageMapper.search(organizationUserId,keyword)
        return ret;
    }
    static async locate(organizationUserIds:[string,string],messageId:string) {
        let obj=await IMUserMessageService.getItemById(messageId)
        if(!obj) {
            throw Err.IM.messageNotFound
        }
        let ret=await iMUserMessageMapper.locate(organizationUserIds,messageId)
        return ret;
    }

    static async clearByOrganizationId(organizationId:string) {
        await iMUserMessageMapper.clearByOrganizationId(organizationId)
    }
    static async clearByOrganizationUserId(organizationUserId:string) {
        await iMUserMessageMapper.clearByOrganizationUserId(organizationUserId)
    }
}

export class IMTeamMessageService extends Entity<typeof iMTeamMessageModel,typeof iMTeamMessageMapper> {
    constructor() {
        super(iMTeamMessageMapper)
    }
    static async list(teamId:string,size:number,lastTime?:number):Promise<ICommon_Model_IM_Team_Message[]> {
        let ret=await iMTeamMessageMapper.list(teamId,size,lastTime)
        return ret;
    }
    static async search(teamIds:string[],keyword:string):Promise<ICommon_Model_IM_Team_Message[]> {
        let ret=await iMTeamMessageMapper.search(teamIds,keyword)
        return ret;
    }
    static async locate(teamId:string,messageId:string):Promise<ICommon_Model_IM_Team_Message[]> {
        let obj=await IMTeamMessageService.getItemById(messageId)
        if(!obj) {
            throw Err.IM.messageNotFound
        }
        let ret=await iMTeamMessageMapper.locate(teamId,messageId)
        return ret;
    }

    static async clearByOrganizationId(organizationId:string) {
        await iMTeamMessageMapper.clearByOrganizationId(organizationId)
    }

    static async clearByOrganizationUserId(organizationUserId:string,deletedOrganizationUserId:string) {
        await iMTeamMessageMapper.clearByOrganizationUserId(organizationUserId,deletedOrganizationUserId)
    }
}

export class IMUnReadMessageService extends Entity<typeof iMUnReadMessageModel,typeof iMUnReadMessageMapper> {
    constructor() {
        super(iMUnReadMessageMapper)
    }
    static async list(organizationUserId:string):Promise<ICommon_Model_IM_UnRead_Message[]> {
        let ret=await iMUnReadMessageMapper.list(organizationUserId)
        return ret;
    }
    static async addUser(organizationUserId:string,otherOrganizationUserId:string,organizationId:string) {
        await iMUnReadMessageMapper.addUser(organizationUserId,otherOrganizationUserId,organizationId)
    }
    static async addTeam(onlineOrganizationUserIds:string[],teamId:string,objAt:{
        all:boolean,
        [param:string]:boolean
    },organizationId:string) {
        let teamUserList=await rpcUserApi.listTeamUser(teamId)
        let ids=teamUserList.map(item=>item.id)
        let offlineIds=ids.filter(id=>!onlineOrganizationUserIds.includes(id))
        await iMUnReadMessageMapper.addTeam(offlineIds,teamId,objAt,organizationId)
    }

    static async clearByOrganizationId(organizationId:string) {
        await iMUnReadMessageMapper.clearByOrganizationId(organizationId)
    }

    static async clearByOrganizationUserId(organizationUserId:string) {
        await iMUnReadMessageMapper.clearByOrganizationUserId(organizationUserId)
    }
}

export class IMFavoriteMessageService extends Entity<typeof iMFavoriteMessageModel,typeof iMFavoriteMessageMapper> {
    constructor() {
        super(iMFavoriteMessageMapper)
    }
    static async list(organizationUserId:string,size:number,lastTime?:number):Promise<ICommon_Model_IM_Favorite_Message[]> {
        let ret=await iMFavoriteMessageMapper.list(organizationUserId,size,lastTime)
        return ret;
    }

    static async clearByOrganizationId(organizationId:string) {
        await iMFavoriteMessageMapper.clearByOrganizationId(organizationId)
    }

    static async clearByOrganizationUserId(organizationUserId:string) {
        await iMFavoriteMessageMapper.clearByOrganizationUserId(organizationUserId)
    }
}
