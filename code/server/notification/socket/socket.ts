import {getSocketEmitterInstance, getSocketIOInstance, SocketIO} from "../../common/socket/socket";
import {ECommon_Socket_Type} from "../../../common/socket/types";

export async function handleNotificationConnection() {
    let io=getSocketIOInstance().of("/"+ECommon_Socket_Type.NOTIFICATION)
    let emit=getSocketEmitterInstance().of("/"+ECommon_Socket_Type.NOTIFICATION);
    SocketIO.initSocket(io,async socket => {

    })
}