import {apiOrganization} from "../request/request";
import {EClient_EVENTBUS_TYPE, eventBus} from "../event/event";
import {ECommon_IM_Message_EntityType} from "../../../../../common/model/im_unread_message";
import {ECommon_User_Online_Status} from "../../../../../common/types";

class UserTeamInfoPick {
    private map = new Map<string, {
        id: string,
        name: string,
        photo: string,
        type:ECommon_IM_Message_EntityType,
        status?:ECommon_User_Online_Status
    }>()
    private pendingSet = new Set<string>()
    constructor () {
        eventBus.on(EClient_EVENTBUS_TYPE.UPDATE_ORGANIZATION_USER_STATUS, (organizationUserId, status) => {
            if(this.map.has(organizationUserId)) {
                this.map.get(organizationUserId).status=status
            }
        })
    }
    getInfos(ids: {
        id:string,
        type:ECommon_IM_Message_EntityType
    }[]): {
        [id: string]: {
            id: string,
            name: string,
            photo: string,
            type:ECommon_IM_Message_EntityType,
            status?:ECommon_User_Online_Status
        }
    } {
        let arr: ReturnType<UserTeamInfoPick["getInfos"]> = {}
        let arrTemp=[]
        for (let item of ids) {
            if (this.map.has(item.id)) {
                arr[item.id] = this.map.get(item.id)
            } else {
                if(!this.pendingSet.has(item.id)) {
                    this.pendingSet.add(item.id)
                    arrTemp.push({
                        id:item.id,
                        type:item.type
                    })
                }
            }
        }
        if (arrTemp.length > 0) {
            apiOrganization.userTeamInfos({
                ids: arrTemp
            }).then(value => {
                if (value.code == 0) {
                    let data = value.data
                    for(let id in data) {
                        let val=data[id]
                        eventBus.emit(EClient_EVENTBUS_TYPE.UPDATE_USER_INFO, val.id, val)
                        this.pendingSet.delete(val.id)
                        this.map.set(val.id, val)
                    }
                }
            })
        }
        return arr;
    }
}

export const userTeamInfoPick = new UserTeamInfoPick()