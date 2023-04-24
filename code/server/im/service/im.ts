import {Entity} from "../../common/entity/entity";
import {ICommon_Model_IM_User_Message, iMUserMessageModel} from "../../../common/model/im_user_message";
import {iMTeamMessageMapper, iMUnReadMessageMapper, iMUserMessageMapper} from "../mapper/im";
import {ICommon_Model_IM_Team_Message, iMTeamMessageModel} from "../../../common/model/im_team_message";
import {ICommon_Model_IM_UnRead_Message, iMUnReadMessageModel} from "../../../common/model/im_unread_message";
import rpcUserApi from "../../user/rpc/user"

export class IMUserMessageService extends Entity<typeof iMUserMessageModel,typeof iMUserMessageMapper> {
    constructor() {
        super(iMUserMessageMapper)
    }
    static async list(organizationUserIds:[string,string],size:number,lastTime?:number):Promise<ICommon_Model_IM_User_Message[]> {
        let ret=await iMUserMessageMapper.list(organizationUserIds,size,lastTime)
        return ret;
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
}

export class IMUnReadMessageService extends Entity<typeof iMUnReadMessageModel,typeof iMUnReadMessageMapper> {
    constructor() {
        super(iMUnReadMessageMapper)
    }
    static async list(organizationUserId:string):Promise<ICommon_Model_IM_UnRead_Message[]> {
        let ret=await iMUnReadMessageMapper.list(organizationUserId)
        return ret;
    }
    static async addUser(organizationUserId:string,otherOrganizationUserId:string) {
        await iMUnReadMessageMapper.addUser(organizationUserId,otherOrganizationUserId)
    }
    static async addTeam(onlineOrganizationUserIds:string[],teamId:string) {
        let teamUserList=await rpcUserApi.listTeamUser(teamId)
        let ids=teamUserList.map(item=>item.id)
        let offlineIds=ids.filter(id=>!onlineOrganizationUserIds.includes(id))
        await iMUnReadMessageMapper.addTeam(offlineIds,teamId)
    }

}