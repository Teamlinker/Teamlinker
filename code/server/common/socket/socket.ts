import * as sio from "socket.io";
import * as http from "http";
import {createAdapter} from "@socket.io/redis-adapter";
import {getRedisInstance} from "../cache/redis";
import {Emitter} from "@socket.io/redis-emitter";
import {
    ICommon_Socket_ClientToServerEvents,
    ICommon_Socket_Data,
    ICommon_Socket_InterServerEvents,
    ICommon_Socket_ServerToClientEvents
} from "../../../common/socket/types";
import {instrument} from "@socket.io/admin-ui";
import userRpcApi from "../../user/rpc/user";
import {REDIS_USER} from "../cache/keys/user";

let g_emitter:Emitter<ICommon_Socket_ServerToClientEvents>
export function getSocketEmitterInstance() {
    return g_emitter
}
export function getSocketIOInstance() {
    return SocketIO.getIO();
}

export class SocketIO {
    private static io:sio.Server<ICommon_Socket_ClientToServerEvents,ICommon_Socket_ServerToClientEvents,ICommon_Socket_InterServerEvents,ICommon_Socket_Data>
    static async start(portOrServer:number | http.Server){
        SocketIO.io=new sio.Server<ICommon_Socket_ClientToServerEvents,ICommon_Socket_ServerToClientEvents,ICommon_Socket_InterServerEvents,ICommon_Socket_Data>(portOrServer,{
            transports: ['websocket','polling'],
            cors: {
                origin: ["http://localhost:63342","https://admin.socket.io"],
                credentials: true
            }
        })
        instrument(SocketIO.io, {
            auth: false
        });
        let pubClient=getRedisInstance().getIORedis().duplicate()
        let subClient=getRedisInstance().getIORedis().duplicate()
        SocketIO.io.adapter(createAdapter(pubClient,subClient))
        g_emitter=new Emitter<ICommon_Socket_ServerToClientEvents>(getRedisInstance().getIORedis())
    }
    static getIO() {
        return SocketIO.io
    }
    static initSocket(io:sio.Namespace<ICommon_Socket_ClientToServerEvents,ICommon_Socket_ServerToClientEvents,ICommon_Socket_InterServerEvents,ICommon_Socket_Data>,callback?:(socket:sio.Socket<ICommon_Socket_ClientToServerEvents,ICommon_Socket_ServerToClientEvents,ICommon_Socket_InterServerEvents,ICommon_Socket_Data>)=>void) {
        io.use(async (socket,next)=>{
            let objHandshake=socket.handshake.auth as {
                token:string,
                userId:string
            }
            if(!objHandshake || !objHandshake.token) {
                next(new Error("miss token"))
                return
            }
            let objCheck=await userRpcApi.checkSession(objHandshake.token)
            if(!objCheck) {
                next(new Error("token error"))
                return
            } else if(objCheck.userId!=objHandshake.userId) {
                next(new Error("userId not match"))
                return
            }
            let objOrganization=await userRpcApi.checkOrganizationInfo(objCheck.userId)
            if(!objOrganization) {
                next(new Error("not in organization"))
            } else {
                socket.data.organizationUserId=objOrganization.organizationUserId
                socket.data.userId=objHandshake.userId
                socket.data.organizationId=objOrganization.organizationId
                next()
            }
        })
        io.on("connection",async (socket)=>{
            socket.join(socket.data.organizationUserId)
            socket.join(socket.data.organizationId)
            if(callback) {
                callback(socket)
            }
        })
    }
}
