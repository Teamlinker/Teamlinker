import {io, Socket} from "socket.io-client"
import {
    ECommon_Socket_Type,
    ICommon_Socket_ClientToServerEvents,
    ICommon_Socket_ServerToClientEvents
} from "../../../../../common/socket/types";
import {SessionStorage} from "../storage/session";

export class SocketIOClient {
    private static map:Map<ECommon_Socket_Type,InstanceType<typeof SocketIOClient> >=new Map
    private readonly name:ECommon_Socket_Type
    private readonly socket:Socket<ICommon_Socket_ServerToClientEvents,ICommon_Socket_ClientToServerEvents>
    static getSocket(name:ECommon_Socket_Type) {
        return this.map.get(name)
    }
    static clear(exceptList?:ECommon_Socket_Type[]) {
        for(let obj of this.map.values()) {
            if(!exceptList?.includes(obj.name)) {
                obj.close()
                this.map.delete(obj.name)
            }
        }
    }
    constructor(name:ECommon_Socket_Type) {
        this.name=name
        this.socket=io("/"+name,{
            auth:{
                userId:SessionStorage.get("userId"),
                token:SessionStorage.get("userToken")
            },
            withCredentials:true
        })
        this.socket.on("disconnect", reason => {
            SocketIOClient.map.delete(this.name)
        })
    }
    getSocket() {
        return this.socket
    }
    close() {
        this.socket.disconnect()
        SocketIOClient.map.delete(this.name)
    }
    static create(name:ECommon_Socket_Type) {
        if(!SocketIOClient.map.has(name)) {
            let obj=new SocketIOClient(name)
            SocketIOClient.map.set(name,obj)
        }
        return SocketIOClient.map.get(name)
    }
    static get(name:ECommon_Socket_Type) {
        return SocketIOClient.map.get(name)
    }
}