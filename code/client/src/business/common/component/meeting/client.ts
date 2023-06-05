import * as mediaSoup from "mediasoup-client";
import {Device} from "mediasoup-client";
import {Transport} from "mediasoup-client/lib/Transport";
import {Socket} from "socket.io-client";
import {Meeting_ClientToServerEvents, Meeting_ServerToClientEvents} from "./type";
import {AutoExecuteArray} from "./AutoExecuteArray";
import {MediaKind, RtpCapabilities} from "mediasoup-client/lib/RtpParameters";

export class MeetingClient {
    private device:Device
    private producerAudio:mediaSoup.types.Producer<mediaSoup.types.AppData>
    private producerVideo:mediaSoup.types.Producer<mediaSoup.types.AppData>
    private producerSet=new Set<string>()
    private transportReceive:Transport
    private transportSend:Transport
    private socket:Socket<Meeting_ServerToClientEvents,Meeting_ClientToServerEvents>
    private roomInfo:{
        roomId:string,
        roomName:string
    }
    onProducerStateChange:(state:"new"|"close"|"pause"|"resume", kind: mediaSoup.types.MediaKind, businessId:string,stream?: MediaStream,producerId?:string)=>void
    onLocalProducerInit:(stream:MediaStream)=>void
    onLocalProducerStart:(kind:MediaKind)=>void
    onJoinedRoom:(roomInfo:typeof this.roomInfo)=>void
    onLeavedRoom:(roomInfo:typeof this.roomInfo)=>void
    onSpeaker:(businessId:string)=>void
    onKick:()=>void
    private onDisconnect:any
    constructor(socket:any) {
        this.onDisconnect=this._onDisconnect.bind(this)
        this.socket=socket
        this.socket.on('newProducer', async ( producerId) => {
            if(!this.producerSet.has(producerId)) {
                this.producerSet.add(producerId)
                AutoExecuteArray.push(this.subscribe.bind(this,producerId))
            }
        });

        this.socket.on('producerClosed', (producerId, kind, businessId)=>{
            if(this.onProducerStateChange) {
                this.onProducerStateChange("close",kind,businessId,null,producerId)
            }
            this.producerSet.delete(producerId)
        });

        this.socket.on("producerPause",(producerId, kind, businessId) => {
            if(this.onProducerStateChange) {
                this.onProducerStateChange("pause",kind,businessId,null,producerId)
            }
        })

        this.socket.on("producerResume",(producerId, kind, businessId) => {
            if(this.onProducerStateChange) {
                this.onProducerStateChange("resume",kind,businessId,null,producerId)
            }
        })

        this.socket.on("kick",() => {
            this.clearRoomConnection()
            if(this.onKick) {
                this.onKick()
            }
        })

        this.socket.on("disconnect",this.onDisconnect)

        this.socket.on("speaker",businessId => {
            if(this.onSpeaker) {
                this.onSpeaker(businessId)
            }
        })
    }
    private _onDisconnect(reason) {
        this.clearRoomConnection()
    }
    getRoomInfo() {
        return this.roomInfo
    }
    async join(roomId:string,extraData:any):Promise<{
        success:boolean,
        msg?:string
    }> {
        if(this.roomInfo) {
            return {
                success:false,
                msg:"you have joined a meeting"
            }
        }
        let ret=await this.socket.emitWithAck("joinRoom",roomId,extraData)
        if(ret) {
            this.roomInfo=ret;
        }
        if(!this.device) {
            const data = await this.socket.emitWithAck('getRouterRtpCapabilities');
            await this.loadDevice(data);
        }
        await this.publish()
        return {
            success:ret?true:false
        }
    }
    async leave():Promise<boolean> {
        if(!this.roomInfo) {
            return false
        }
        await this.socket.emitWithAck("leaveRoom")
        this.clearRoomConnection()
        return true
    }
    async pause(kind:MediaKind) {
        let ret=await this.socket.emitWithAck("pauseSelf",kind)
        return ret;
    }

    async resume(kind:MediaKind) {
        let ret=await this.socket.emitWithAck("resumeSelf",kind)
        return ret;
    }
    async mute(kind:MediaKind,businessId:string) {
        let ret=await this.socket.emitWithAck("pauseOther",kind,businessId)
        return ret;
    }
    async unmute(kind:MediaKind,businessId:string) {
        let ret=await this.socket.emitWithAck("resumeOther",kind,businessId)
        return ret;
    }
    async kick(businessId:string) {
        let ret=await this.socket.emitWithAck("kick",businessId)
        return ret;
    }
    async end() {
        let ret=await this.socket.emitWithAck("end")
        return ret;
    }
    async states() {
        let ret=await this.socket.emitWithAck("states")
        return ret;
    }
    private clearRoomConnection() {
        if(this.roomInfo) {
            if(this.onLeavedRoom) {
                this.onLeavedRoom(Object.assign({},this.roomInfo))
            }
            this.roomInfo=null;
        }
        this.device=null;
        this.producerSet=new Set
        if(this.producerAudio) {
            this.producerAudio.removeAllListeners();
            this.producerAudio.close()
            this.producerAudio=null;
        }
        if(this.producerVideo) {
            this.producerVideo.removeAllListeners()
            this.producerVideo.close()
            this.producerVideo=null;
        }
        if(this.transportReceive) {
            this.transportReceive.removeAllListeners()
            this.transportReceive.close()
            this.transportReceive=null
        }
        if(this.transportSend) {
            this.transportSend.removeAllListeners()
            this.transportSend.close()
            this.transportSend=null
        }
        this.socket.removeAllListeners("newProducer")
        this.socket.removeAllListeners("producerClosed")
        this.socket.removeAllListeners("producerPause")
        this.socket.removeAllListeners("producerResume")
        this.socket.removeAllListeners("kick")
        this.socket.removeAllListeners("speaker")
        this.socket.off("disconnect",this.onDisconnect)
        this.socket=null;
    }
    private async loadDevice(routerRtpCapabilities:RtpCapabilities) {
        try {
            this.device = new mediaSoup.Device();
        } catch (error) {
            if (error.name === 'UnsupportedError') {
                console.error('browser not supported');
            }
        }
        await this.device.load({ routerRtpCapabilities });
    }

    private async subscribe(remoteProducerId:string) {
        if(!this.transportReceive) {
            const data = await this.socket.emitWithAck('createConsumerTransport');
            if (!data) {
                this.producerSet.delete(remoteProducerId)
                return;
            }
            this.transportReceive = this.device.createRecvTransport({...data, iceServers : []});
            this.transportReceive.on('connect', async ({ dtlsParameters }, callback, errback) => {
                this.socket.emitWithAck('connectConsumerTransport', {
                    dtlsParameters
                })
                    .then(callback)
                    .catch(errback);
            });
            this.transportReceive.on('connectionstatechange', async (state) => {
                switch (state) {
                    case 'connecting':
                        console.log("Connecting to consumer for audio, transport id: " + this.transportReceive.id)
                        break;
                    case 'connected':
                        console.log("Connected to consumer for audio, transport id: " + this.transportReceive.id)
                        break;
                    case 'failed':
                    case "closed":
                    case "disconnected": {
                        this.leave()
                        break
                    }
                    default: break;
                }
            });
        }
        this.consume(this.transportReceive, remoteProducerId).then(async value=>{
            await this.socket.emitWithAck("resume",value.consumer.id)
            if(this.onProducerStateChange) {
                this.onProducerStateChange("new",value.consumer.kind,value.businessId,value.stream,remoteProducerId)
            }
        })
    }

    private async consume(transport: mediaSoup.types.Transport<mediaSoup.types.AppData>, remoteProducerId:string) {
        const { rtpCapabilities } = this.device;
        const transportId  = transport.id;
        const data = await this.socket.emitWithAck('consume', { rtpCapabilities, remoteProducerId, transportId});
        const {
            producerId,
            id,
            kind,
            rtpParameters,
        } = data;
        const consumer = await transport.consume({
            id,
            producerId,
            kind,
            rtpParameters,
        });
        const stream = new MediaStream();
        stream.addTrack(consumer.track);
        return {stream,consumer,businessId:data.businessId};
    }

    private async publish() {
        const data = await this.socket.emitWithAck('createProducerTransport');
        if (!data) {
            return;
        }
        this.transportSend = this.device.createSendTransport({...data, iceServers : []});
        this.transportSend.on('connect', async ({ dtlsParameters }, callback, errback) => {
            this.socket.emitWithAck('connectProducerTransport', { dtlsParameters })
                .then(callback)
                .catch(errback);
        });
        this.transportSend.on('produce', async ({ kind, rtpParameters }, callback, errback) => {
            try {
                const { id, producersExist } = await this.socket.emitWithAck('produce', {
                    kind,
                    rtpParameters,
                });
                if(this.onLocalProducerStart) {
                    this.onLocalProducerStart(kind)
                }
                if (producersExist){
                    this.getProducers()
                }
                callback({ id });
            } catch (err) {
                errback(err);
            }
        });
        this.transportSend.on('connectionstatechange', (state) => {
            switch (state) {
                case 'connecting':
                    console.log("Connecting to publish")
                    break;
                case 'connected':
                    console.log("Connected")
                    if(this.onJoinedRoom) {
                        this.onJoinedRoom(this.roomInfo)
                    }
                    break;
                case 'failed':
                    this.transportSend.close();
                    console.log("Failed connection")
                    break;
                default: break;
            }
        });
        const mediaConstraints:MediaStreamConstraints = {
            audio: {
                echoCancellation:true,
                noiseSuppression:true
            },
            video: true,
        }
        navigator.mediaDevices.getUserMedia(mediaConstraints).then( async (stream) => {
            if(this.onLocalProducerInit) {
                this.onLocalProducerInit(stream)
            }
            let track = stream.getAudioTracks()[0];
            if(track) {
                let params:any = { track };
                params.codecOptions = {
                    opusStereo: 1,
                    opusDtx: 1
                }
                this.producerAudio =await this.transportSend.produce(params);
            }
            track=stream.getVideoTracks()[0]
            if(track) {
                let params={track}
                this.producerVideo=await this.transportSend.produce(params)
            }
        },reason => {
            console.log(reason)
        }).catch(reason => {
            console.log(reason)
        })
    }

    private getProducers(){
        this.socket.emit('getProducers', async producerIds => {
            for(let id of producerIds) {
                if(!this.producerSet.has(id)) {
                    this.producerSet.add(id)
                    AutoExecuteArray.push(this.subscribe.bind(this,id))
                }
            }
        })
    }
}