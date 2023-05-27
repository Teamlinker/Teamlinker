import * as SocketIO from "socket.io";
import {
    Meeting_ClientToServerEvents,
    Meeting_Data,
    Meeting_InterServerEvents,
    Meeting_ServerToClientEvents,
    MeetingConfig,
    PeerInfoItem
} from "./type";
import * as mediaSoup from "mediasoup";
import {Worker} from "mediasoup/node/lib/Worker";
import * as  os from "os"
import {Consumer} from "mediasoup/node/lib/Consumer";
import {Producer} from "mediasoup/node/lib/Producer";
import {WebRtcTransport} from "mediasoup/node/lib/WebRtcTransport";
import {MediaKind, RtpCapabilities} from "mediasoup/node/lib/RtpParameters";
import {AudioLevelObserver} from "mediasoup/node/lib/AudioLevelObserver";

export class MeetingServer {
    private io:SocketIO.Server<Meeting_ClientToServerEvents,Meeting_ServerToClientEvents,Meeting_InterServerEvents,Meeting_Data>
    private config:MeetingConfig
    private roomMap=new Map<string,{
        roomId:string,
        roomName:string,
        router:mediaSoup.types.Router,
        peerList:Set<string>,
        audioLevelObserver:AudioLevelObserver
    }>()
    private workList:Worker[]=new Array(os.cpus().length)
    private peerInfoMap=new Map<string,PeerInfoItem>()
    private workerIndex=0
    onJoinRoom:(roomId:string,extraData:any,socketData:any,socketId:string)=>Promise<{
        roomName:string,
        businessId:string,
        error?:string
    }>
    onJoinedRoom:(roomId:string,businessId:string,socketId:string)=>void
    onLeaveRoom:(type:"self"|"kick"|"end",roomId:string,businessId:string,socketId:string)=>Promise<void>
    onLeavedRoom:(type:"self"|"kick"|"end",roomId:string,businessId:string,socketId:string)=>void
    onHandleOperation:(type:"pause"|"resume"|"kick"|"end",roomId:string,fromBusinessId:string,toBusinessId?:string,kind?:MediaKind)=>Promise<boolean>
    constructor(io:any,config:MeetingConfig) {
        this.io=io
        this.config=config
        this.io.addListener("connection",(socket:SocketIO.Socket<Meeting_ClientToServerEvents,Meeting_ServerToClientEvents,Meeting_InterServerEvents,Meeting_Data>)=>{
            socket.on("joinRoom",async (roomId, extraData,callback) => {
                let roomName="",businessId="";
                if(this.onJoinRoom) {
                    let ret=await this.onJoinRoom(roomId,extraData,socket.data,socket.id)
                    if(ret.error) {
                        callback(null,ret.error)
                        return
                    } else if(!ret.businessId) {
                        callback(null,"businessId can't be empty")
                        return
                    }else {
                        roomName=ret.roomName
                        businessId=ret.businessId
                    }
                }
                await this.createRoom(roomId,roomName,socket.id,businessId)
                callback({
                    roomId,
                    roomName
                })
                if(this.onJoinedRoom) {
                    this.onJoinedRoom(roomId,businessId,socket.id)
                }
            })
            socket.on("leaveRoom",async (callback) => {
                let obj=this.peerInfoMap.get(socket.id)
                if(!obj) {
                    callback()
                    return
                }
                if(this.onLeaveRoom) {
                    await this.onLeaveRoom("self",obj.roomId,obj.businessId,socket.id)
                }
                this.leaveRoom(socket.id)
                callback()
                if(this.onLeavedRoom) {
                    this.onLeavedRoom("self",obj.roomId,obj.businessId,socket.id)
                }
            })
            socket.on("getRouterRtpCapabilities",(callback)=>{
                let objPeer=this.peerInfoMap.get(socket.id)
                if(!objPeer) {
                    callback(null)
                    return
                }
                let obj=this.roomMap.get(objPeer.roomId)
                callback(obj.router.rtpCapabilities)
            })
            socket.on("createProducerTransport",async (callback)=>{
                let objPeer=this.peerInfoMap.get(socket.id)
                if(!objPeer) {
                    callback(null)
                    return
                }
                const {transport,params}=await this.createRoomTransport(objPeer.roomId)
                this.addTransport(transport,objPeer.roomId,socket.id,false)
                callback(params)
            })
            socket.on("createConsumerTransport",async (callback)=>{
                let objPeer=this.peerInfoMap.get(socket.id)
                if(!objPeer) {
                    callback(null)
                    return
                }
                const {transport,params}=await this.createRoomTransport(objPeer.roomId)
                this.addTransport(transport,objPeer.roomId,socket.id,true)
                callback(params)
            })

            socket.on('connectProducerTransport', async (data, callback) => {
                try {
                    console.log("Connecting Producer Transport")
                    let obj=await this.getTransport(socket.id,false)
                    if(!obj) {
                        callback()
                        return
                    }
                    await obj.connect({dtlsParameters: data.dtlsParameters});
                } catch (err) {
                    console.error(err)
                }
                callback();
            });

            socket.on('connectConsumerTransport', async (data, callback) => {
                try {
                    console.log("Connecting Consumer Transport")
                    const consumerTransport = await this.getTransport(socket.id,true)
                    if(!consumerTransport) {
                        callback()
                        return
                    }
                    await consumerTransport.connect({ dtlsParameters: data.dtlsParameters });
                } catch (err) {
                    console.error(err)
                }
                callback();
            });

            socket.on('produce', async (data, callback) => {
                const {kind, rtpParameters} = data;
                console.log("Starting the producer")
                let producer = await this.getTransport(socket.id,false).produce({ kind, rtpParameters });
                producer.on('transportclose', () => {
                    console.log('transport for this producer closed ')
                    producer.close()
                })
                let objPeer=this.peerInfoMap.get(socket.id)
                let peerList=this.roomMap.get(objPeer.roomId).peerList
                callback({ id: producer.id, producersExist: peerList.size>1 ? true : false });
                this.addProducer(producer,  socket.id)
                if(kind==="audio") {
                    let audioLevelObserver=this.roomMap.get(objPeer.roomId).audioLevelObserver
                    await audioLevelObserver.addProducer({
                        producerId:producer.id
                    })
                }
                io.to(objPeer.roomId).except(socket.id).emit('newProducer',  producer.id )
            });

            socket.on('consume', async (data, callback) => {
                console.log("Consume call on the server side, data is below")
                let obj=await this.createConsumer(data.rtpCapabilities, data.remoteProducerId, data.transportId, socket.id)
                let objPeer=this.getPeerFromProducerId(socket.id,data.remoteProducerId)
                callback(Object.assign({},obj,{
                    businessId:objPeer.businessId
                }));
            });

            socket.on('resume', async ( consumerId,callback) => {
                let obj=this.peerInfoMap.get(socket.id)
                for(let consumer of obj.receive.consumer) {
                    if(consumer.id===consumerId) {
                        await consumer.resume()
                        break
                    }
                }
                callback();
            });

            socket.on('getProducers', callback => {
                let producerList:string[] = []
                let objPeer=this.peerInfoMap.get(socket.id)
                if(!objPeer) {
                    callback([])
                    return
                }
                let objRoom=this.roomMap.get(objPeer.roomId)
                for(let socketId of objRoom.peerList) {
                    if(socketId!=socket.id) {
                        let objPeer=this.peerInfoMap.get(socketId)
                        producerList = [...producerList,...objPeer.send.producer.map(item=>item.id)]
                    }
                }
                callback(producerList)

            });
            socket.on("pauseSelf",async (kind, callback) => {
                let objPeer=this.peerInfoMap.get(socket.id)
                for(let producer of objPeer.send.producer) {
                    if(producer.kind===kind) {
                        await producer.pause()
                    }
                }
                callback()
            })
            socket.on("resumeSelf",async (kind, callback) => {
                let objPeer=this.peerInfoMap.get(socket.id)
                for(let producer of objPeer.send.producer) {
                    if(producer.kind===kind) {
                        await producer.resume()
                    }
                }
                callback()
            })
            socket.on("pauseOther",async (kind, businessId, callback) => {
                if(this.onHandleOperation) {
                    let objPeer=this.peerInfoMap.get(socket.id)
                    let ret=await this.onHandleOperation("pause",objPeer.roomId,objPeer.businessId,businessId,kind);
                    if(!ret) {
                        callback(false)
                        return
                    }
                }
                let obj=this.getPeerFromBusinessId(socket.id,businessId)
                if(obj) {
                    for(let producer of obj.send.producer) {
                        if(producer.kind===kind) {
                            await producer.pause()
                        }
                    }
                    callback(true)
                } else {
                    callback(false)
                }
            })
            socket.on("resumeOther",async (kind, businessId, callback) => {
                if(this.onHandleOperation) {
                    let objPeer=this.peerInfoMap.get(socket.id)
                    let ret=await this.onHandleOperation("resume",objPeer.roomId,objPeer.businessId,businessId,kind);
                    if(!ret) {
                        callback(false)
                        return
                    }
                }
                let obj=this.getPeerFromBusinessId(socket.id,businessId)
                if(obj) {
                    for(let producer of obj.send.producer) {
                        if(producer.kind===kind) {
                            await producer.resume()
                        }
                    }
                    callback(true)
                } else {
                    callback(false)
                }
            })
            socket.on("kick",async (businessId, callback) => {
                if(this.onHandleOperation) {
                    let objPeer=this.peerInfoMap.get(socket.id)
                    let ret=await this.onHandleOperation("kick",objPeer.roomId,objPeer.businessId,businessId,null);
                    if(!ret) {
                        callback(false)
                        return
                    }
                }
                let obj=this.getPeerFromBusinessId(socket.id,businessId)
                if(obj) {
                    if(this.onLeaveRoom) {
                        await this.onLeaveRoom("kick",obj.roomId,obj.businessId,obj.socketId)
                    }
                    this.leaveRoom(obj.socketId)
                    callback(true)
                    if(this.onLeavedRoom) {
                        this.onLeavedRoom("kick",obj.roomId,obj.businessId,obj.socketId)
                    }
                    this.io.in(obj.socketId).emit("kick")
                } else {
                    callback(false)
                }
            })
            socket.on("end",async callback => {
                if(this.onHandleOperation) {
                    let objPeer=this.peerInfoMap.get(socket.id)
                    let ret=await this.onHandleOperation("end",objPeer.roomId,objPeer.businessId,null,null);
                    if(!ret) {
                        callback(false)
                        return
                    }
                }
                let objPeer=this.peerInfoMap.get(socket.id)
                if(objPeer) {
                    let objRoom=this.roomMap.get(objPeer.roomId)
                    for(let id of objRoom.peerList) {
                        let obj=this.peerInfoMap.get(id)
                        if(obj) {
                            if(this.onLeaveRoom) {
                                await this.onLeaveRoom("end",obj.roomId,obj.businessId,obj.socketId)
                            }
                            this.leaveRoom(obj.socketId)
                            if(this.onLeavedRoom) {
                                this.onLeavedRoom("end",obj.roomId,obj.businessId,obj.socketId)
                            }
                            this.io.in(obj.socketId).emit("kick")
                        }
                    }
                }
                callback(true)
            })
            socket.on("states",callback => {
                let objPeer=this.peerInfoMap.get(socket.id)
                if(objPeer) {
                    let objRoom=this.roomMap.get(objPeer.roomId)
                    if(objRoom) {
                        let arr:Parameters<typeof callback>[0]=[]
                        for(let socketId of objRoom.peerList) {
                            let obj=this.peerInfoMap.get(socketId)
                            if(obj) {
                                let kinds={}
                                obj.send.producer.forEach(item=>{
                                    kinds[item.kind]=!item.paused
                                })
                                arr=[...arr,{
                                    businessId:obj.businessId,
                                    kinds:kinds
                                }]
                            }
                        }
                        callback(arr)
                    } else {
                        callback([])
                    }
                } else {
                    callback([])
                }
            })
            socket.addListener("disconnect",async (reason)=>{
                let obj=this.peerInfoMap.get(socket.id)
                if(obj && this.onLeaveRoom) {
                    await this.onLeaveRoom("self",obj.roomId,obj.businessId,socket.id)
                }
                this.leaveRoom(socket.id)
                if(obj && this.onLeavedRoom) {
                    this.onLeavedRoom("self",obj.roomId,obj.businessId,socket.id)
                }
            })
        })
    }

    async start() {
        for(let i=0;i<this.workList.length;i++) {
            let worker=await mediaSoup.createWorker(this.config.worker)
            worker.on("died",args => {
                console.log(args)
            })
            this.workList[i]=worker
        }
    }

    private getPeerFromProducerId(socketId:string,producerId:string,isAll:boolean=false) {
        let objPeer=this.peerInfoMap.get(socketId)
        let objRoom=this.roomMap.get(objPeer.roomId)
        for(let id of objRoom.peerList) {
            if(isAll || id!==socketId) {
                let obj=this.peerInfoMap.get(id)
                for(let produce of obj.send.producer) {
                    if(produce.id===producerId) {
                        return obj
                    }
                }
            }
        }
    }

    private getPeerFromProducerIdAndRoomId(roomId:string,producerId:string) {
        let objRoom=this.roomMap.get(roomId)
        for(let id of objRoom.peerList) {
            let obj=this.peerInfoMap.get(id)
            for(let produce of obj.send.producer) {
                if(produce.id===producerId) {
                    return obj
                }
            }
        }
    }

    private getPeerFromBusinessId(socketId:string,businessId:string,isAll:boolean=false) {
        let objPeer=this.peerInfoMap.get(socketId)
        let objRoom=this.roomMap.get(objPeer.roomId)
        for(let id of objRoom.peerList) {
            if(isAll || id!==socketId) {
                let obj=this.peerInfoMap.get(id)
                if(obj.businessId===businessId) {
                    return obj;
                }
            }
        }
    }

    private getWorker() {
        let obj=this.workList[this.workerIndex]
        this.workerIndex++;
        if(this.workerIndex>=this.workList.length) {
            this.workerIndex=0
        }
        return obj;
    }

    private async createRoom(roomId:string,roomName:string,socketId:string,businessId:string) {
        let objRoom=this.roomMap.get(roomId)
        if(!objRoom) {
            let worker=this.getWorker()
            let mediaSoupRouter=await worker.createRouter({
                mediaCodecs:this.config.codecs
            })
            let audioLevelObserver=await mediaSoupRouter.createAudioLevelObserver({
                threshold:-55
            })
            audioLevelObserver.on("volumes",args => {
                let produce=args[0]?.producer
                if(produce) {
                    let objPeer=this.getPeerFromProducerIdAndRoomId(roomId,produce.id)
                    if(objPeer) {
                        let objRoom=this.roomMap.get(roomId)
                        for(let socketId of objRoom.peerList) {
                            this.io.in(socketId).emit("speaker",objPeer.businessId)
                        }
                    }
                }
            })
            this.roomMap.set(roomId,{
                roomId,
                peerList:new Set([socketId]),
                roomName,
                router:mediaSoupRouter,
                audioLevelObserver:audioLevelObserver
            })
        } else {
            objRoom.peerList.add(socketId)
        }
        this.peerInfoMap.set(socketId,{
            businessId,
            roomId:roomId,
            socketId:socketId,
            send:{
                transport:null,
                producer:[]
            },
            receive:{
                transport:null,
                consumer:[]
            }
        })
    }

    private async createRoomTransport(roomId:string) {
        let obj=this.roomMap.get(roomId)
        if(!obj) {
            return;
        }
        const transport=await obj.router.createWebRtcTransport(this.config.webRtcTransport)
        transport.on("dtlsstatechange",state => {
            if(state=="closed") {
                transport.close()
            }
        })
        return {
            transport,
            params: {
                id: transport.id,
                iceParameters: transport.iceParameters,
                iceCandidates: transport.iceCandidates,
                dtlsParameters: transport.dtlsParameters,
                sctpParameters: transport.sctpParameters,
            },
        }
    }

    private addConsumer(consumer:Consumer, socketId:string){
        let obj=this.peerInfoMap.get(socketId)
        if(obj) {
            obj.receive.consumer.push(consumer)
        }
    }

    private addProducer(producer:Producer,socketId:string){
        let obj=this.peerInfoMap.get(socketId)
        if(obj) {
            obj.send.producer.push(producer)
        }
    }

    private addTransport(transport:WebRtcTransport, roomId:string, socketId:string,isConsumer:boolean){
        let obj=this.peerInfoMap.get(socketId)
        if(obj) {
            if(isConsumer) {
                obj.receive.transport=transport
            } else {
                obj.send.transport=transport
            }
        }
    }

    private getProducer(socketId:string, type:MediaKind){
        const [producerTransport] = this.peerInfoMap.get(socketId).send.producer.filter(item=>item.kind===type)
        return producerTransport
    }

    private getTransport(socketId:string,isConsumer:boolean){
        const producerTransport = this.peerInfoMap.get(socketId)
        return isConsumer?producerTransport.receive.transport:producerTransport.send.transport
    }

    private async createConsumer( rtpCapabilities:RtpCapabilities,  remoteProducerId:string, serverConsumerTransportId:string, socketId:string) {
        const objTransport = this.peerInfoMap.get(socketId)
        const roomId = objTransport.roomId
        const router=this.roomMap.get(roomId).router
        console.log("Creating consumer for remote producerId = " + remoteProducerId)

        const consumerTransport=objTransport.receive.transport

        if (!router.canConsume(
            {
                producerId: remoteProducerId,
                rtpCapabilities,
            })
        ) {
            console.error('can not consume');
            return;
        }
        try {
            let consumer = await consumerTransport.consume({
                producerId: remoteProducerId,
                rtpCapabilities,
                paused:true
            });
            let objPeer=this.getPeerFromProducerId(socketId,remoteProducerId)
            consumer.on('transportclose', () => {
                console.log('transport close from consumer')
            })

            consumer.on('producerclose', async () => {
                console.log('producer of consumer closed')
                this.io.in(roomId).emit('producerClosed',remoteProducerId,consumer.kind,objPeer.businessId)
                objTransport.receive.consumer = objTransport.receive.consumer.filter(transportData => transportData.id !== consumerTransport.id)
                consumer.close()
                if(consumer.kind==="audio") {
                    let objRoom=this.roomMap.get(objPeer.roomId)
                    try {
                        await objRoom.audioLevelObserver.removeProducer({
                            producerId:consumer.producerId
                        })
                    } catch {
                        console.log(`${consumer.producerId} not found`)
                    }
                }
            })
            consumer.on("producerpause",() => {
                this.io.in(roomId).emit('producerPause',remoteProducerId,consumer.kind,objPeer.businessId)
            })
            consumer.on("producerresume",() => {
                this.io.in(roomId).emit('producerResume',remoteProducerId,consumer.kind,objPeer.businessId)
            })
            this.addConsumer(consumer,  socketId)
            if (consumer.type === 'simulcast') {
                await consumer.setPreferredLayers({ spatialLayer: 2, temporalLayer: 2 });
            }

            return {
                producerId: remoteProducerId,
                id: consumer.id,
                kind: consumer.kind,
                rtpParameters: consumer.rtpParameters,
                type: consumer.type,
                producerPaused: consumer.producerPaused
            };
        } catch (error) {
            console.error('consume failed', error);
            return;
        }

    }

    private leaveRoom(socketId:string) {
        let obj=this.peerInfoMap.get(socketId)
        if(obj) {
            if(obj.send.transport) {
                obj.send.transport.close()
            }
            obj.send.producer.forEach(item=>item.close())
            if(obj.receive.transport) {
                obj.receive.transport.close()
            }
            obj.receive.consumer.forEach(item=>item.close())
            this.peerInfoMap.delete(socketId)
            let objRoom=this.roomMap.get(obj.roomId)
            if(objRoom) {
                objRoom.peerList.delete(socketId)
                if(objRoom.peerList.size==0){
                    objRoom.router.close()
                    objRoom.audioLevelObserver.close()
                    this.roomMap.delete(obj.roomId)
                }
            }
        }
    }
}