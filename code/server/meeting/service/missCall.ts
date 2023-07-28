import {Entity} from "../../common/entity/entity";
import {ICommon_Model_Meeting_Miss_Call, meetingMissCallModel} from "../../../common/model/meeting_miss_call";
import {meetingMissCallMapper} from "../mapper/missCall";
import rpcUserApi from "../../user/rpc/user"
import {ICommon_Model_Organization_User} from "../../../common/model/organization_user";

export class MeetingMissCallService extends Entity<typeof meetingMissCallModel,typeof meetingMissCallMapper> {
    constructor() {
        super(meetingMissCallMapper)
    }
    static async list(organizationUserId:string):Promise<(ICommon_Model_Meeting_Miss_Call & {
        organizationUser:ICommon_Model_Organization_User
    })[]> {
        let ret=await meetingMissCallMapper.list(organizationUserId)
        let objPromise={}
        for(let obj of ret) {
            if(!objPromise[obj.from_organization_user_id]) {
                objPromise[obj.from_organization_user_id]=rpcUserApi.organizationUser(obj.from_organization_user_id).then(res=>{
                    objPromise[obj.from_organization_user_id]=res
                })
            }
        }
        await Promise.all(Object.values(objPromise))
        return ret.map(item=>{
            return {
                ...item,
                organizationUser:objPromise[item.from_organization_user_id]
            }
        })
    }
    static async readAll(organizationUserId:string) {
        await meetingMissCallMapper.readAll(organizationUserId)
    }
    static async unReadCount(organizationUserId:string) {
        let ret=await meetingMissCallMapper.unReadCount(organizationUserId)
        return ret;
    }
}