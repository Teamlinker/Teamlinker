import got from "got";
import * as http from 'http';
import * as sio from "socket.io";
import * as ioClient from "socket.io-client";
import { v4 as uuid } from 'uuid';
import { ECommon_Services } from '../../../common/types';
import Application from '../app/app';
import { REDIS_GATEWAY } from '../cache/keys/gateway';
import { getConfigInstance } from '../config/config';
import { getEventsFunc } from "../event/event";
import { EServer_Common_Event_Types } from '../event/types';
import { getHttpRoutes, handleHttpCall } from '../http/http';
import { EServer_Common_Http_Body_Type, IServer_Common_Http_Proxy } from './../types/http';
import { IServer_Common_Nacos_Instance } from './../types/nacos';
import { ECommon_Internal_Http } from "./http";

interface ISocketStruct {
    name:string,
    args:any[]
}
interface ISocketRPCResponseStruct {
    code:number,
    msg?:string,
    data?:any
}
enum ESocketRPCBroadCastType {
    RELOAD_DATABASE="reload_database"
}
interface ISocketRPCBroadCastStruct {
    type:ESocketRPCBroadCastType,
    data?:any
}
var g_RevieveFunc={
    
}

var g_RevieveInstance={
    
}
var g_Socket=<{
    [name:string]:(ioClient.Socket|sio.Socket)[]
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
    static broadcast(data:ISocketRPCBroadCastStruct) {
        sendRPCMessage(ECommon_Services.GateWay,(socket)=>{
            socket.emit("boardcast",data)
        })
    }
    static start(portOrServer:number | http.Server){
        Rpc.io=new sio.Server(portOrServer,{
            transports: ['websocket', 'polling']
        })
        Rpc.io.on("connection",(socket:sio.Socket)=>{
            let fromService=socket.handshake.query.service as string
            if(!fromService) {
                return;
            }
            if(g_Socket[fromService]) {
                g_Socket[fromService]=g_Socket[fromService].concat(socket)
            } else {
                g_Socket[fromService]=[socket]
            }
            handleSocketError(fromService,socket);
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
        let objRedis=await REDIS_GATEWAY.instances(name)
        let ret=await objRedis.get()
        return ret?ret[Math.floor(Math.random()*ret.length)]:null
    }
}

export async function proxyRequest(objProxy:IServer_Common_Http_Proxy,targetServer:ECommon_Services):Promise<IServer_Common_Http_Proxy> {
    return new Promise(async function(resolve,reject){
        if (targetServer == ECommon_Services.GateWay) {
            let key = objProxy.method + " " + objProxy.path
            let objRoute = getHttpRoutes()
            for (let keyRoute in objRoute) {
                if (key == keyRoute) {
                    try {
                        let ret = await handleHttpCall(objRoute[keyRoute], objProxy)
                        if(ret.status<200 || ret.status>=300) {
                            reject(ret)
                        } else {
                            resolve(ret)
                        }
                        return
                    } catch (err) {
                        let obj: IServer_Common_Http_Proxy = <IServer_Common_Http_Proxy>{}
                        obj.status = 500
                        obj.data = {
                            code: err.code,
                            msg: err.msg ?? err.message
                        }
                        reject(obj)
                        return
                    }
                }
            }
            let obj: IServer_Common_Http_Proxy = <IServer_Common_Http_Proxy>{}
            obj.status = 404
            reject(obj)
        } else {
            await sendRPCMessage(targetServer,(socket)=>{
                postHttpCall(socket,objProxy,resolve,reject)
            })
        }
        
    })
}

export async function emitRPCBoradCast(data:ISocketRPCBroadCastStruct) {
    if(Application.serviceName==ECommon_Services.GateWay) {
        await handleRPCBoradCast(data)
    } else {
        await Rpc.broadcast(data);
    }
}

export async function handleRPCBoradCast(data:ISocketRPCBroadCastStruct) {
    if(data.type==ESocketRPCBroadCastType.RELOAD_DATABASE) {
        let arr=await allInstances()
        for(let obj of arr) {
            got(`http://${obj.ip}:${obj.port}/${ECommon_Internal_Http.RELOAD_DATABASE}`)
        }
    }
}

export function DRPCSend(rpcName:ECommon_Services){
    return function (target: Object, propertyName: string, descriptor: TypedPropertyDescriptor<Function>) {
        descriptor.value = function () {
            let args=Array.from(arguments)
            return new Promise(async function(resolve,reject){
                await sendRPCMessage(rpcName,(socket)=>{
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
    let objRedis =await REDIS_GATEWAY.allServices()
    let ret = await objRedis.scan()
    return ret.map(item=>{
        return item.substring(item.lastIndexOf(":")+1)
    })
}

async function allInstances(): Promise<IServer_Common_Nacos_Instance[]> {
    let objRedis =await REDIS_GATEWAY.allInstances()
    let ret = await objRedis.get()
    let instanceList:IServer_Common_Nacos_Instance[]=[]
    for(let obj of ret) {
        for(let obj1 of obj) {
            instanceList.push(obj1);
        }
    }
    return instanceList;
}

export async function emitServiceEvent(event: EServer_Common_Event_Types.Types, obj: any,exceptMe:boolean=false) {
    let arrServiceName = await validInstances()
    arrServiceName=arrServiceName.filter(item=>{
        return getConfigInstance().serviceName!=item
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
        await sendRPCMessage(serviceName,(socket)=>{
            socket.emit("event-call", <ISocketStruct>{
                name: event,
                args: obj
            })
        })
    }
}

async function sendRPCMessage(serviceName:string,emitFunc:(socket:ioClient.Socket)=>void) {
    let socket: ioClient.Socket;
    if (g_Socket[serviceName] && g_Socket[serviceName].length > 0) {
        let arrInvalidSocket: (typeof socket)[] = []
        for (let obj of g_Socket[serviceName]) {
            if (!obj.connected) {
                arrInvalidSocket.push(obj as ioClient.Socket)
            } else {
                socket = obj as ioClient.Socket
            }
        }
        arrInvalidSocket.forEach(obj => {
            obj.close()
            for (let i = 0; i < g_Socket[serviceName].length; i++) {
                if (g_Socket[serviceName][i] == socket) {
                    g_Socket[serviceName].splice(i,1)
                    break
                }
            }
        })
    }
    if (!socket) {
        let instance = await Rpc.validInstance(serviceName)
        if (!instance) {
            return
        }
        let socket = ioClient.io(`ws://${instance.ip}:${instance.port}`,{
            query:{
                service:serviceName
            }
        })
        g_Socket[serviceName] = [socket]
        socket.on("connect", () => {
            if (emitFunc) {
                emitFunc(socket)
            }
        })
        if(Application.serviceName==ECommon_Services.GateWay) {
            socket.on("broadcast", async (data: ISocketRPCBroadCastStruct, callback) => {
                handleRPCBoradCast(data)
            })
        }
        handleSocketError(serviceName,socket);
    }
    else {
        if (emitFunc) {
            emitFunc(socket)
        }
    }
}

async function handleSocketError(serviceName:string,socket:ioClient.Socket|sio.Socket) {
    socket.on("disconnect", () => {
        if (g_Socket[serviceName]) {
            for (let i = 0; i < g_Socket[serviceName].length; i++) {
                if (g_Socket[serviceName][i] == socket) {
                    g_Socket[serviceName].splice(i,1)
                    break
                }
            }
        }
        socket.removeAllListeners();
    })
    socket.on("connect_error", () => {
        if (g_Socket[serviceName]) {
            for (let i = 0; i < g_Socket[serviceName].length; i++) {
                if (g_Socket[serviceName][i] == socket) {
                    g_Socket[serviceName].splice(i,1)
                    break
                }
            }
        }
        socket.removeAllListeners();
    })
    socket.on("error", () => {
        socket.disconnect()
        if (g_Socket[serviceName]) {
            for (let i = 0; i < g_Socket[serviceName].length; i++) {
                if (g_Socket[serviceName][i] == socket) {
                    g_Socket[serviceName].splice(i,1)
                    break
                }
            }
        }
        socket.removeAllListeners();
    })
}