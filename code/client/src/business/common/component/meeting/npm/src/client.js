import * as mediaSoup from "mediasoup-client";
import { AutoExecuteArray } from "./AutoExecuteArray";
export class MeetingClient {
    device;
    producerAudio;
    producerVideo;
    producerAudioScreen;
    producerVideoScreen;
    producerChat;
    producerSet = new Set();
    transportReceive;
    transportSend;
    transportDataSend;
    socket;
    roomInfo;
    defaultVideo = true;
    defaultAudio = true;
    defaultCameraId;
    defaultAudioId;
    onProducerStateChange;
    onLocalProducerInit;
    onLocalProducerStart;
    onJoinedRoom;
    onLeavedRoom;
    onSpeaker;
    onKick;
    onMessageReceive;
    onMessageSend;
    onScreenStopped;
    onDisconnect;
    constructor(socket) {
        this.onDisconnect = this._onDisconnect.bind(this);
        this.socket = socket;
        this.socket.on('newProducer', async (producerId, kind, businessId, type) => {
            if (!this.producerSet.has(producerId)) {
                this.producerSet.add(producerId);
                if (type === "data") {
                    AutoExecuteArray.push(this.subscribeData.bind(this, producerId));
                }
                else if (type === "camera" || type === "screen") {
                    AutoExecuteArray.push(this.subscribe.bind(this, producerId));
                }
            }
        });
        this.socket.on('producerClosed', (producerId, kind, businessId, type) => {
            if (this.onProducerStateChange) {
                this.onProducerStateChange("close", kind, businessId, type, null, producerId);
            }
            this.producerSet.delete(producerId);
        });
        this.socket.on("producerPause", (producerId, kind, businessId) => {
            if (this.onProducerStateChange) {
                this.onProducerStateChange("pause", kind, businessId, "camera", null, producerId);
            }
        });
        this.socket.on("producerResume", (producerId, kind, businessId) => {
            if (this.onProducerStateChange) {
                this.onProducerStateChange("resume", kind, businessId, "camera", null, producerId);
            }
        });
        this.socket.on("kick", () => {
            this.clearRoomConnection();
            if (this.onKick) {
                this.onKick();
            }
        });
        this.socket.on("disconnect", this.onDisconnect);
        this.socket.on("speaker", businessId => {
            if (this.onSpeaker) {
                this.onSpeaker(businessId);
            }
        });
        this.socket.on("messageReceive", (message, businessId) => {
            this.onMessageReceive?.(message, businessId);
        });
    }
    static async enumVideoDevice() {
        let ret = await navigator.mediaDevices.enumerateDevices();
        return ret.filter(item => item.kind === "videoinput").map(item => ({
            id: item.deviceId,
            name: item.label
        }));
    }
    static async enumAudioDevice() {
        let ret = await navigator.mediaDevices.enumerateDevices();
        return ret.filter(item => item.kind === "audioinput").map(item => ({
            id: item.deviceId,
            name: item.label
        }));
    }
    static async checkVideoStream(id) {
        let stream = await navigator.mediaDevices.getUserMedia({
            video: {
                deviceId: id
            }
        });
        return stream;
    }
    _onDisconnect(reason) {
        this.clearRoomConnection();
    }
    getRoomInfo() {
        return this.roomInfo;
    }
    async join(roomId, extraData, isVideo = true, isAudio = true, cameraId, audioId, backImg, blur) {
        if (this.roomInfo) {
            return {
                success: false,
                msg: "you have joined a meeting"
            };
        }
        this.defaultVideo = isVideo;
        this.defaultAudio = isAudio;
        this.defaultCameraId = cameraId;
        this.defaultAudioId = audioId;
        let ret = await this.socket.emitWithAck("joinRoom", roomId, extraData);
        if (ret) {
            this.roomInfo = ret;
        }
        else {
            return {
                success: false
            };
        }
        if (!this.device) {
            const data = await this.socket.emitWithAck('getRouterRtpCapabilities');
            await this.loadDevice(data);
        }
        let retPublic = await this.publish();
        if (retPublic !== true) {
            return {
                success: false,
                msg: retPublic
            };
        }
        else {
            return {
                success: true
            };
        }
    }
    async leave() {
        if (!this.roomInfo) {
            return false;
        }
        await this.socket.emitWithAck("leaveRoom");
        this.clearRoomConnection();
        return true;
    }
    async pause(kind) {
        let ret = await this.socket.emitWithAck("pauseSelf", kind);
        return ret;
    }
    async resume(kind) {
        let ret = await this.socket.emitWithAck("resumeSelf", kind);
        return ret;
    }
    async mute(kind, businessId) {
        let ret = await this.socket.emitWithAck("pauseOther", kind, businessId);
        return ret;
    }
    async unmute(kind, businessId) {
        let ret = await this.socket.emitWithAck("resumeOther", kind, businessId);
        return ret;
    }
    async kick(businessId) {
        let ret = await this.socket.emitWithAck("kick", businessId);
        return ret;
    }
    async end() {
        let ret = await this.socket.emitWithAck("end");
        return ret;
    }
    async states() {
        let ret = await this.socket.emitWithAck("states");
        return ret;
    }
    async sendMessage(message) {
        let ret = await this.socket.emitWithAck("messageSend", message);
        //this.producerChat.send(message)
        if (ret) {
            this.onMessageSend?.(message);
        }
    }
    async startShare() {
        let ret = await this.socket.emitWithAck("getScreenProducers");
        if (ret) {
            return false;
        }
        const mediaConstraints = {
            audio: {
                echoCancellation: true,
                noiseSuppression: true
            },
            video: {
                cursor: "always"
            },
        };
        try {
            let stream = await navigator.mediaDevices.getDisplayMedia(mediaConstraints);
            if (stream) {
                let trackAudio = stream.getAudioTracks()[0];
                if (trackAudio) {
                    let params = {
                        track: trackAudio,
                        appData: {
                            screen: true
                        }
                    };
                    params.codecOptions = {
                        opusStereo: true,
                        opusDtx: true
                    };
                    this.producerAudioScreen = await this.transportSend.produce(params);
                }
                let trackVideo = stream.getVideoTracks()[0];
                if (trackVideo) {
                    trackVideo.onended = ev => {
                        this.stopShare();
                    };
                    let params = {
                        track: trackVideo,
                        appData: {
                            screen: true
                        }
                    };
                    this.producerVideoScreen = await this.transportSend.produce(params);
                }
                return true;
            }
        }
        catch (err) {
            console.log(err);
            return false;
        }
    }
    stopShare() {
        this.socket.emit("stopScreen");
        if (this.producerVideoScreen) {
            this.producerVideoScreen.removeAllListeners();
            this.producerVideoScreen.close();
            this.producerVideoScreen = null;
        }
        if (this.producerAudioScreen) {
            this.producerAudioScreen.removeAllListeners();
            this.producerAudioScreen.close();
            this.producerAudioScreen = null;
        }
        this.onScreenStopped?.();
    }
    clearRoomConnection() {
        if (this.roomInfo) {
            if (this.onLeavedRoom) {
                this.onLeavedRoom(Object.assign({}, this.roomInfo));
            }
            this.roomInfo = null;
        }
        this.device = null;
        this.producerSet = new Set;
        this.stopShare();
        if (this.producerAudio) {
            this.producerAudio.removeAllListeners();
            this.producerAudio.close();
            this.producerAudio = null;
        }
        if (this.producerVideo) {
            this.producerVideo.removeAllListeners();
            this.producerVideo.close();
            this.producerVideo = null;
        }
        if (this.transportReceive) {
            this.transportReceive.removeAllListeners();
            this.transportReceive.close();
            this.transportReceive = null;
        }
        if (this.transportSend) {
            this.transportSend.removeAllListeners();
            this.transportSend.close();
            this.transportSend = null;
        }
        if (this.producerChat) {
            this.producerChat.removeAllListeners();
            this.producerChat.close();
            this.producerChat = null;
        }
        if (this.transportDataSend) {
            this.transportDataSend.removeAllListeners();
            this.transportDataSend.close();
            this.transportDataSend = null;
        }
        this.socket.removeAllListeners("newProducer");
        this.socket.removeAllListeners("producerClosed");
        this.socket.removeAllListeners("producerPause");
        this.socket.removeAllListeners("producerResume");
        this.socket.removeAllListeners("kick");
        this.socket.removeAllListeners("speaker");
        this.socket.off("disconnect", this.onDisconnect);
        this.socket = null;
    }
    async loadDevice(routerRtpCapabilities) {
        try {
            this.device = new mediaSoup.Device();
        }
        catch (error) {
            if (error.name === 'UnsupportedError') {
                console.error('browser not supported');
            }
        }
        await this.device.load({ routerRtpCapabilities });
    }
    async subscribe(remoteProducerId) {
        if (!this.transportReceive) {
            const data = await this.socket.emitWithAck('createConsumerTransport');
            if (!data) {
                this.producerSet.delete(remoteProducerId);
                return;
            }
            this.transportReceive = this.device.createRecvTransport({ ...data, iceServers: [] });
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
                        console.log("Connecting to consumer for audio, transport id: " + this.transportReceive.id);
                        break;
                    case 'connected':
                        console.log("Connected to consumer for audio, transport id: " + this.transportReceive.id);
                        break;
                    case 'failed':
                    case "closed":
                    case "disconnected": {
                        this.leave();
                        break;
                    }
                    default: break;
                }
            });
        }
        this.consume(this.transportReceive, remoteProducerId).then(async (value) => {
            await this.socket.emitWithAck("resume", value.consumer.id);
            if (this.onProducerStateChange) {
                this.onProducerStateChange("new", value.consumer.kind, value.businessId, value.type, value.stream, remoteProducerId);
            }
        });
    }
    async consume(transport, remoteProducerId) {
        const { rtpCapabilities } = this.device;
        const transportId = transport.id;
        const data = await this.socket.emitWithAck('consume', { rtpCapabilities, remoteProducerId, transportId });
        const { producerId, id, kind, rtpParameters, type } = data;
        const consumer = await transport.consume({
            id,
            producerId,
            kind,
            rtpParameters,
        });
        const stream = new MediaStream();
        stream.addTrack(consumer.track);
        return { stream, consumer, businessId: data.businessId, type };
    }
    async subscribeData(remoteProducerId) {
        const data = await this.socket.emitWithAck('createDataConsumerTransport');
        if (!data) {
            this.producerSet.delete(remoteProducerId);
            return;
        }
        const transportDataReceive = this.device.createRecvTransport({ ...data, iceServers: [] });
        transportDataReceive.on('connect', async ({ dtlsParameters, }, callback, errback) => {
            this.socket.emitWithAck('connectDataConsumerTransport', {
                dtlsParameters,
                sctpParameters: data.sctpParameters
            })
                .then(callback)
                .catch(errback);
        });
        transportDataReceive.on('connectionstatechange', async (state) => {
            switch (state) {
                case 'connecting':
                    console.log("Connecting to consumer for audio, transport id: " + transportDataReceive.id);
                    break;
                case 'connected':
                    console.log("Connected to consumer for audio, transport id: " + transportDataReceive.id);
                    break;
                case 'failed':
                case "closed":
                case "disconnected": {
                    this.leave();
                    break;
                }
                default: break;
            }
        });
        this.consumeData(transportDataReceive, remoteProducerId).then(async (value) => {
            if (this.onProducerStateChange) {
                this.onProducerStateChange("new", null, value.businessId, "data", null, remoteProducerId);
            }
            value.consumer.on("message", data => {
                this.onMessageReceive?.(data, value.businessId);
            });
        });
    }
    async consumeData(transport, remoteProducerId) {
        const transportId = transport.id;
        const data = await this.socket.emitWithAck('consumeData', { remoteProducerId, transportId });
        const { id, } = data;
        console.log(`producerId:${remoteProducerId} consumerId:${id}`);
        const consumer = await transport.consumeData({
            id,
            dataProducerId: remoteProducerId,
            sctpStreamParameters: {
                streamId: 0,
                ordered: true
            }
        });
        consumer.on("close", () => {
            consumer.removeAllListeners();
        });
        return { consumer, businessId: data.businessId };
    }
    async publish() {
        return new Promise(async (resolve, reject) => {
            const data = await this.socket.emitWithAck('createProducerTransport');
            if (!data) {
                resolve("createProducerTransport failed");
            }
            this.transportSend = this.device.createSendTransport({ ...data, iceServers: [] });
            this.transportSend.on('connect', async ({ dtlsParameters }, callback, errback) => {
                this.socket.emitWithAck('connectProducerTransport', { dtlsParameters })
                    .then(callback)
                    .catch(errback);
            });
            this.transportSend.on('produce', async ({ kind, rtpParameters, appData }, callback, errback) => {
                try {
                    const { id, producersExist } = await this.socket.emitWithAck('produce', {
                        kind,
                        rtpParameters,
                        appData
                    });
                    if (this.onLocalProducerStart) {
                        this.onLocalProducerStart(kind);
                    }
                    if (producersExist) {
                        this.getProducers();
                    }
                    callback({ id });
                }
                catch (err) {
                    errback(err);
                }
            });
            this.transportSend.on('connectionstatechange', (state) => {
                switch (state) {
                    case 'connecting':
                        console.log("Connecting to publish");
                        break;
                    case 'connected':
                        console.log("Connected");
                        if (this.onJoinedRoom) {
                            this.onJoinedRoom(this.roomInfo);
                        }
                        break;
                    case 'failed':
                        this.transportSend.close();
                        console.log("Failed connection");
                        break;
                    default: break;
                }
            });
            let ret = await navigator.mediaDevices.enumerateDevices();
            let isVideo = false;
            for (let obj of ret) {
                if (obj.kind === "videoinput") {
                    isVideo = true;
                }
            }
            const mediaConstraints = {
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    ...(this.defaultAudioId && {
                        deviceId: this.defaultAudioId
                    })
                },
                video: (isVideo && this.defaultCameraId) ? {
                    deviceId: this.defaultCameraId
                } : isVideo,
            };
            navigator.mediaDevices.getUserMedia(mediaConstraints).then(async (stream) => {
                let trackAudio = stream.getAudioTracks()[0];
                if (trackAudio) {
                    let params = {
                        track: trackAudio,
                        appData: {
                            paused: !this.defaultAudio
                        }
                    };
                    params.codecOptions = {
                        opusStereo: true,
                        opusDtx: true,
                    };
                    this.producerAudio = await this.transportSend.produce(params);
                }
                let trackVideo = stream.getVideoTracks()[0];
                if (trackVideo) {
                    let params = {
                        track: trackVideo,
                        appData: {
                            paused: !this.defaultVideo
                        }
                    };
                    this.producerVideo = await this.transportSend.produce(params);
                }
                if (this.onLocalProducerInit) {
                    const stream = new MediaStream();
                    stream.addTrack(trackAudio);
                    stream.addTrack(trackVideo);
                    this.onLocalProducerInit(stream);
                }
                resolve(true);
            }, reason => {
                resolve(reason.message);
            }).catch(reason => {
                resolve(reason.message);
            });
        });
    }
    async publishData() {
        const data = await this.socket.emitWithAck('createDataProducerTransport');
        if (!data) {
            return;
        }
        this.transportDataSend = this.device.createSendTransport({ ...data, iceServers: [] });
        this.transportDataSend.on('connect', async ({ dtlsParameters }, callback, errback) => {
            this.socket.emitWithAck('connectDataProducerTransport', { dtlsParameters })
                .then(callback)
                .catch(errback);
        });
        this.transportDataSend.on('producedata', async (_, callback, errback) => {
            try {
                const { id, producersExist } = await this.socket.emitWithAck('produceData');
                if (this.onLocalProducerStart) {
                    this.onLocalProducerStart(null);
                }
                if (producersExist) {
                    this.getProducers();
                }
                callback({ id });
            }
            catch (err) {
                errback(err);
            }
        });
        this.transportDataSend.on('connectionstatechange', (state) => {
            switch (state) {
                case 'connecting':
                    console.log("data Connecting to publish");
                    break;
                case 'connected':
                    console.log("data connected");
                    // if (this.onJoinedRoom) {
                    //     this.onJoinedRoom(this.roomInfo)
                    // }
                    break;
                case 'failed':
                    this.transportDataSend.close();
                    console.log("data Failed connection");
                    break;
                default:
                    break;
            }
        });
        this.producerChat = await this.transportDataSend.produceData();
    }
    getProducers() {
        this.socket.emit('getProducers', async (producerList) => {
            for (let obj of producerList) {
                if (!this.producerSet.has(obj.id)) {
                    this.producerSet.add(obj.id);
                    if (obj.type === "data") {
                        AutoExecuteArray.push(this.subscribeData.bind(this, obj.id));
                    }
                    else if (obj.type === "camera" || obj.type === "screen") {
                        AutoExecuteArray.push(this.subscribe.bind(this, obj.id));
                    }
                }
            }
        });
    }
}
