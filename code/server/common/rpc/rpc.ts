import { IServer_Common_Http_Proxy } from './../types/http';
import { IServer_Common_Nacos_Instance } from './../types/nacos';
import { ECommon_Services } from '../../../common/types';
import { EServer_Common_Event_Types } from '../event/types';
import * as sio from "socket.io"
import * as ioClient from "socket.io-client"
import { REDIS_GATEWAY } from '../cache/keys/gateway';
import * as http from 'http';
import { getHttpRoutes, handleHttpCall } from '../http/http';
import {getEventsFunc} from "../event/event"
import { getNacosInstance } from '../nacos/nacos';
interface ISocketStruct {
    name:string,
    args:any[]
}
interface ISocketRPCResponseStruct {
    code:number,
    msg?:string,
    data?:any
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
            socket.on("rpc-call",async (arg:ISocketStruct,callback)=>{
                let funcName=arg.name
                if(g_RevieveFunc[funcName] && g_RevieveInstance[funcName])
                {
                    let objRes=<ISocketRPCResponseStruct>{}
                    try {
                        let ret=await g_RevieveFunc[funcName].apply(g_RevieveInstance[funcName],arg.args)
                        objRes.code=0
                        objRes.data=ret
                        callback(objRes)
                    } catch (err) {
                        objRes.code=err.code
                        objRes.msg=err.msg;
                        callback(objRes)
                    }
                }
            })
            socket.on("http-call",async (arg:IServer_Common_Http_Proxy,callback)=>{
                let key=arg.method+ " " +arg.path
                let objRoute=getHttpRoutes()
                for(let keyRoute in objRoute) {
                    if(key==keyRoute){
                        try {
                            let ret=await handleHttpCall(objRoute[keyRoute],arg)
                            callback(ret)
                            return
                        } catch (err) {
                            let obj:IServer_Common_Http_Proxy=<IServer_Common_Http_Proxy>{}
                            obj.status=500
                            obj.data={
                                code:err.code,
                                msg:err.msg??err.message
                            }
                            callback(obj)
                            return
                        }
                    }
                }
                let obj:IServer_Common_Http_Proxy=<IServer_Common_Http_Proxy>{}
                obj.status=404
                callback(obj)
            })
            socket.on("event-call",async (arg:ISocketStruct,callback)=>{
                let name=arg.name
                let obj=arg.args;
                let objFunc=getEventsFunc()
                for(let key in objFunc) {
                    if(key==name) {
                        for(let func of objFunc[key]) {
                            func(obj)
                        }
                    }
                }
            })
        })
    }
    static async validInstance(name:string):Promise<IServer_Common_Nacos_Instance>
    {
        let objRedis=REDIS_GATEWAY.instances(name)
        let ret=await objRedis.get()
        return ret?ret[0]:null
    }
}

export async function proxyRequest(objProxy:IServer_Common_Http_Proxy,targetServer:ECommon_Services):Promise<IServer_Common_Http_Proxy> {
    return new Promise(async function(resolve,reject){
        if(!g_Socket[targetServer] || !g_Socket[targetServer].connected)
        {
            if(g_Socket[targetServer] && !g_Socket[targetServer].connected) {
                g_Socket[targetServer].close()
            }
            let instance=await Rpc.validInstance(targetServer)
            if(!instance)
            {
                resolve(null)
                return
            }
            let socket=ioClient.io(`ws://${instance.ip}:${instance.port}`)
            g_Socket[targetServer]=socket
            socket.on("connect",()=>{
                socket.emit("http-call",objProxy,(res:IServer_Common_Http_Proxy)=>{
                    if(res.status<200 || res.status>=300) {
                        reject(res)
                    } else {
                        resolve(res)
                    }
                })
            })
        }
        else
        {
            g_Socket[targetServer].emit("http-call",objProxy,(res:IServer_Common_Http_Proxy)=>{
                if(res.status<200 || res.status>=300) {
                    reject(res)
                } else {
                    resolve(res)
                }
            })
        }
    })
}

export function DRPCSend(rpcName:ECommon_Services){
    return function (target: Object, propertyName: string, descriptor: TypedPropertyDescriptor<Function>) {
        descriptor.value = function () {
            let args=Array.from(arguments)
            return new Promise(async function(resolve,reject){
                if(!g_Socket[rpcName] || !g_Socket[rpcName].connected)
                {
                    if(g_Socket[rpcName] && !g_Socket[rpcName].connected) {
                        g_Socket[rpcName].close()
                    }
                    let instance=await Rpc.validInstance(rpcName)
                    if(!instance)
                    {
                        resolve(null)
                        return
                    }
                    let socket=ioClient.io(`ws://${instance.ip}:${instance.port}`)
                    g_Socket[rpcName]=socket
                    socket.on("connect",()=>{
                        socket.emit("rpc-call",<ISocketStruct>{
                            name:propertyName,
                            args:args
                        },(res:ISocketRPCResponseStruct)=>{
                            if(res.code==0)
                            {
                                resolve(res.data)
                            } else {
                                reject({
                                    code:res.code,
                                    msg:res.msg
                                })
                            }
                            
                        })
                    })
                }
                else
                {
                    g_Socket[rpcName].emit("rpc-call",<ISocketStruct>{
                        name:propertyName,
                        args:args
                    },(res:ISocketRPCResponseStruct)=>{
                        if(res.code==0)
                        {
                            resolve(res.data)
                        } else {
                            reject({
                                code:res.code,
                                msg:res.msg
                            })
                        }
                        
                    })
                }
            })
        }
    }
}

export function DRPCRecieve(target: Object, propertyName: string, descriptor: TypedPropertyDescriptor<Function>) {
    if(!g_RevieveFunc[propertyName])
    {
        g_RevieveFunc[propertyName]=descriptor.value;
    }
    if(!g_RevieveInstance[propertyName])
    {
        g_RevieveInstance[propertyName]=target
    }
}

async function validInstances(): Promise<string[]> {
    let objRedis = REDIS_GATEWAY.allInstances()
    let ret = await objRedis.scan()
    return ret.map(item => {
        return item[0].name ?? ""
    }).filter(item => {
        if (item) {
            return true
        }
    })
}

export async function emitServiceEvent(event: EServer_Common_Event_Types.Types, obj: any,exceptMe:boolean=false) {
    let arrServiceName = await validInstances()
    arrServiceName=arrServiceName.filter(item=>{
        return getNacosInstance().serviceName!=item
    })
    if(!exceptMe) {
        let objFunc = getEventsFunc()
        for (let key in objFunc) {
            if (key == event) {
                for (let func of objFunc[key]) {
                    func(obj)
                }
            }
        }
    }
    for (let serviceName of arrServiceName) {
        if (!g_Socket[serviceName] || !g_Socket[serviceName].connected) {
            if (g_Socket[serviceName] && !g_Socket[serviceName].connected) {
                g_Socket[serviceName].close()
            }
            let instance = await Rpc.validInstance(serviceName)
            if (!instance) {
                return
            }
            let socket = ioClient.io(`ws://${instance.ip}:${instance.port}`)
            g_Socket[serviceName] = socket
            socket.on("connect", () => {
                socket.emit("event-call", <ISocketStruct>{
                    name: event,
                    args: obj
                })
            })
        }
        else {
            g_Socket[serviceName].emit("event-call", <ISocketStruct>{
                name: event,
                args: obj
            })
        }
    }
}