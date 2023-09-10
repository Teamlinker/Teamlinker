import {getSocketEmitterInstance, getSocketIOInstance, SocketIO} from "../../common/socket/socket";
import {ECommon_Socket_Type} from "../../../common/socket/types";
import rpcUserApi from "../../user/rpc/user";

export async function handleNotificationConnection() {
    let io=getSocketIOInstance().of("/"+ECommon_Socket_Type.NOTIFICATION)
    let emit=getSocketEmitterInstance().of("/"+ECommon_Socket_Type.NOTIFICATION);
    SocketIO.initSocket(io,async socket => {
        socket.on("notification_heartbeat",async (token,callback)=>{
            try {
                await rpcUserApi.keepAlive(token)
                callback(true)
            } catch(err) {
                console.log(err)
                callback(false)
            }
        })
    })
}