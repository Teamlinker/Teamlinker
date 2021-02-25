import { IServer_Common_Nacos_Instance } from './../types/nacos';
import { EServer_Common_Config_Services } from './../types/config';
import { Redis } from '../cache/redis';
import * as sio from "socket.io"
import * as ioClient from "socket.io-client"
import { REDIS_GATEWAY } from '../cache/keys/gateway';
import * as http from 'http';
interface ISocketStruct {
    name:string,
    args:any[]
}
var g_RevieveFunc={
    
}

var g_RevieveInstance={
    
}
var g_Socket=<{
    [name:string]:ioClient.Socket
}>{
    
}
export class Rpc{
    private static io:InstanceType<typeof sio.Server>
    static start(port:number | http.Server){
        Rpc.io=new sio.Server(port,{
            transports: ['websocket', 'polling']
        })
        Rpc.io.on("connection",(socket)=>{
            socket.on("data",async (arg:ISocketStruct,callback)=>{
                let funcName=arg.name
                if(g_RevieveFunc[funcName] && g_RevieveInstance[funcName])
                {
                    let ret=await g_RevieveFunc[funcName].apply(g_RevieveInstance[funcName],arg.args)
                    callback(ret)
                }
            })
        })
    }
    static async validInstance(name:string):Promise<IServer_Common_Nacos_Instance>
    {
        let objRedis=REDIS_GATEWAY.instance(name)
        let ret=await objRedis.get()
        return ret[0]
    }
}

export function RPCSend(rpcName:EServer_Common_Config_Services){
    return function (target: Object, propertyName: string, descriptor: TypedPropertyDescriptor<Function>) {
        descriptor.value = function () {
            let args=Array.from(arguments)
            return new Promise(async function(resolve){
                if(!g_Socket[rpcName] || !g_Socket[rpcName].connected)
                {
                    let instance=await Rpc.validInstance(rpcName)
                    let socket=ioClient.io(`ws://${instance.ip}:${instance.port}`)
                    g_Socket[rpcName]=socket
                    socket.on("connect",()=>{
                        socket.emit("data",<ISocketStruct>{
                            name:propertyName,
                            args:args
                        },(res)=>{
                            resolve(res)
                        })
                    })
                }
                else
                {
                    g_Socket[rpcName].emit("data",<ISocketStruct>{
                        name:propertyName,
                        args:args
                    },(res)=>{
                        resolve(res)
                    })
                }
            })
        }
    }
}

export function RPCRecieve(target: Object, propertyName: string, descriptor: TypedPropertyDescriptor<Function>) {
    if(!g_RevieveFunc[propertyName])
    {
        g_RevieveFunc[propertyName]=descriptor.value;
    }
    if(!g_RevieveInstance[propertyName])
    {
        g_RevieveInstance[propertyName]=target
    }
}