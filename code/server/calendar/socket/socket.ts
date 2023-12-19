import {getSocketIOInstance, SocketIO} from "../../common/socket/socket";
import {ECommon_Socket_Type} from "../../../common/socket/types";

export function handleCalendarConnection() {
    let io=getSocketIOInstance().of("/"+ECommon_Socket_Type.CALENDAR)
    SocketIO.initSocket(io)
}