import {DComponent} from "../../common/decorate/component";
import {DEventListener} from "../../common/event/event";
import {getSocketEmitterInstance, getSocketIOInstance} from "../../common/socket/socket";
import {ECommon_Socket_Type} from "../../../common/socket/types";
import {ECommon_User_Online_Status} from "../../../common/types";

@DComponent
class IMEventListener {
    @DEventListener("teamUserAdd")
    async teamUserAdd(teamId: string, organizationUserId: string) {
        try {
            let io=getSocketIOInstance().of("/"+ECommon_Socket_Type.IM)
            let arr=await io.adapter.fetchSockets({
                rooms:new Set([organizationUserId])
            })
            if(arr && arr.length>0) {
                arr[0].join(teamId)
            }
        } catch (e) {
            console.log(e)
        }
    }

    @DEventListener("teamUserDelete")
    async teamUserDelete(teamId: string, organizationUserId: string) {
        try {
            let io=getSocketIOInstance().of("/"+ECommon_Socket_Type.IM)
            let arr=await io.adapter.fetchSockets({
                rooms:new Set([organizationUserId])
            })
            if(arr && arr.length>0) {
                arr[0].leave(teamId)
            }
        } catch (e) {
            console.log(e)
        }
    }

    @DEventListener("organizationUserStatusChange")
    async organizationUserStatusChange(organizationId:string,organizationUserId:string,status:ECommon_User_Online_Status) {
        let emit=getSocketEmitterInstance().of("/"+ECommon_Socket_Type.IM);
        emit.to(organizationId).emit("im_organization_user_status_change",organizationUserId,status)
    }
}