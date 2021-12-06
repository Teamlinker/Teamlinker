import * as http from 'http';
import * as sio from "socket.io";
import * as ioClient from "socket.io-client";
import { v4 as uuid } from 'uuid';
import { ECommon_Services } from '../../../common/types';
import { REDIS_GATEWAY } from '../cache/keys/gateway';
import { getEventsFunc } from "../event/event";
import { EServer_Common_Event_Types } from '../event/types';
import { getHttpRoutes, handleHttpCall } from '../http/http';
import { getNacosInstance } from '../nacos/nacos';
import { EServer_Common_Http_Body_Type, IServer_Common_Http_Proxy } from './../types/http';
import { IServer_Common_Nacos_Instance } from './../types/nacos';
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

async function postHttpCall(socket:ioClient.Socket,objProxy:IServer_Common_Http_Proxy,resolve,reject){
    if(objProxy.bodyType==EServer_Common_Http_Body_Type.FORMDATA) {
        let field:string,data:Buffer
        for(let key in objProxy.data) {
            let val=objProxy.data[key]
            if(typeof(val)=="object" && typeof(val.data)=="object" && val.data instanceof Buffer) {
                field=key;
                data=val.data
                continue
            }
        }
        delete objProxy.data[field]["data"];
        let id=uuid()
        await emitAsync(socket,"http-call-large-start",id)
        await emitAsync(socket,"http-call-large-header",{
            id:id,
            data:objProxy,
        })
        let len=800*1024;
        for(let i=0;i<data.length;i+=len){
            let temp=data.slice(i,i+((i+len<data.length)?len:(data.length-i)))
            await emitAsync(socket,"http-call-large-data",{
                id:id,
                data:temp,
                field:field
            })
        }
        socket.emit("http-call-large-end",id,(res:IServer_Common_Http_Proxy)=>{
            if(res.status<200 || res.status>=300) {
                reject(res)
            } else {
                resolve(res)
            }
        })
    } else {
        socket.emit("http-call",objProxy,(res:IServer_Common_Http_Proxy)=>{
            if(res.status<200 || res.status>=300) {
                reject(res)
            } else {
                resolve(res)
            }
        })
    }
}

function emitAsync(socket:ioClient.Socket,message:string,data:any) {
    return new Promise(function(resolve,reject){
        socket.emit(message,data,(data)=>{
            resolve(data)
        })
    })
}
export class Rpc{
    private static io:InstanceType<typeof sio.Server>
    private static largeMap:Map<string,IServer_Common_Http_Proxy>=new Map()
    private static largeMapTimeout:Map<string,NodeJS.Timeout>=new Map()
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
            socket.on("http-call-large-start",async (id:string,callback)=>{
                if(id) {
                    this.largeMap.set(id,null)
                    let timer=setTimeout(()=>{
                        if(this.largeMap.has(id)){
                            this.largeMap.delete(id)
                        }
                    },60*1000)
                    this.largeMapTimeout.set(id,timer)
                }
                callback()
            })
            socket.on("http-call-large-header",async (obj:{
                id:string,
                data:IServer_Common_Http_Proxy,
            },callback)=>{
                if(obj && obj.id && this.largeMap.has(obj.id)) {
                    this.largeMap.set(obj.id,obj.data)
                }
                callback()
            })
            socket.on("http-call-large-data",async (obj:{
                id:string,
                data:Buffer,
                field:string
            },callback)=>{
                if(obj && obj.id && this.largeMap.has(obj.id)) {
                    let objHttp=this.largeMap.get(obj.id)
                    if(!objHttp.data[obj.field]["data"]){
                        objHttp.data[obj.field]["data"]=obj.data
                    } else {
                        objHttp.data[obj.field]["data"]=Buffer.concat([objHttp.data[obj.field]["data"],obj.data],objHttp.data[obj.field]["data"].length+obj.data.length)
                    }
                }
                callback()
            })
            socket.on("http-call-large-end", async (id: string, callback) => {
                if (id && this.largeMap.has(id)) {
                    let arg = this.largeMap.get(id)
                    this.largeMap.delete(id)
                    this.largeMapTimeout.delete(id)
                    let key = arg.method + " " + arg.path
                    let objRoute = getHttpRoutes()
                    for (let keyRoute in objRoute) {
                        if (key == keyRoute) {
                            try {
                                let ret = await handleHttpCall(objRoute[keyRoute], arg)
                                callback(ret)
                                return
                            } catch (err) {
                                let obj: IServer_Common_Http_Proxy = <IServer_Common_Http_Proxy>{}
                                obj.status = 500
                                obj.data = {
                                    code: err.code,
                                    msg: err.msg ?? err.message
                                }
                                callback(obj)
                                return
                            }
                        }
                    }
                    let obj: IServer_Common_Http_Proxy = <IServer_Common_Http_Proxy>{}
                    obj.status = 404
                    callback(obj)
                } else {
                    callback()
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
            socket.on("connect",async ()=>{
                postHttpCall(socket,objProxy,resolve,reject)
            })
        }
        else
        {
            postHttpCall(g_Socket[targetServer],objProxy,resolve,reject)
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
    return ret.map(item=>{
        return item.substr(item.lastIndexOf(":")+1)
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