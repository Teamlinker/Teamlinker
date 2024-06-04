import * as mediaSoup from "mediasoup";
import * as os from "os";
import { Producer } from "mediasoup/node/lib/Producer";
export class MeetingServer {
    io;
    config;
    roomMap = new Map();
    workList = new Array(os.cpus().length);
    peerInfoMap = new Map();
    workerIndex = 0;
    onJoinRoom;
    onJoinedRoom;
    onLeaveRoom;
    onLeavedRoom;
    onHandleOperation;
    onMessageSend;
    onDeleteRoom;
    constructor(io, config) {
        this.io = io;
        this.config = config;
        this.io.addListener("connection", (socket) => {
            socket.on("joinRoom", async (roomId, extraData, callback) => {
                try {
                    let roomName = "", businessId = "";
                    if (this.onJoinRoom) {
                        let ret = await this.onJoinRoom(roomId, extraData, socket.data, socket.id);
                        if (ret.error) {
                            callback(null, ret.error);
                            return;
                        }
                        else if (!ret.businessId) {
                            callback(null, "businessId can't be empty");
                            return;
                        }
                        else {
                            roomName = ret.roomName;
                            businessId = ret.businessId;
                        }
                    }
                    let obj = this.getPeerFromBusinessIdAndRoomId(roomId, businessId);
                    if (obj) {
                        if (this.onLeaveRoom) {
                            await this.onLeaveRoom("kick", obj.roomId, obj.businessId, obj.socketId);
                        }
                        this.leaveRoom(obj.socketId);
                        if (this.onLeavedRoom) {
                            await this.onLeavedRoom("kick", obj.roomId, obj.businessId, obj.socketId);
                        }
                        this.io.in(obj.socketId).emit("kick");
                    }
                    await this.createRoom(roomId, roomName, socket.id, businessId);
                    callback({
                        roomId,
                        roomName
                    });
                    if (this.onJoinedRoom) {
                        this.onJoinedRoom(roomId, businessId, socket.id);
                    }
                }
                catch (err) {
                    console.error(err);
                }
            });
            socket.on("leaveRoom", async (callback) => {
                try {
                    let obj = this.peerInfoMap.get(socket.id);
                    if (!obj) {
                        callback();
                        return;
                    }
                    if (this.onLeaveRoom) {
                        await this.onLeaveRoom("self", obj.roomId, obj.businessId, socket.id);
                    }
                    this.leaveRoom(socket.id);
                    callback();
                    if (this.onLeavedRoom) {
                        this.onLeavedRoom("self", obj.roomId, obj.businessId, socket.id);
                    }
                }
                catch (err) {
                    console.error(err);
                }
            });
            socket.on("getRouterRtpCapabilities", (callback) => {
                try {
                    let objPeer = this.peerInfoMap.get(socket.id);
                    if (!objPeer) {
                        callback(null);
                        return;
                    }
                    let obj = this.roomMap.get(objPeer.roomId);
                    callback(obj.router.rtpCapabilities);
                }
                catch (err) {
                    console.error(err);
                }
            });
            socket.on("createProducerTransport", async (callback) => {
                try {
                    let objPeer = this.peerInfoMap.get(socket.id);
                    if (!objPeer) {
                        callback(null);
                        return;
                    }
                    const { transport, params } = await this.createRoomTransport(objPeer.roomId);
                    this.addTransport(transport, objPeer.roomId, socket.id, false);
                    callback(params);
                }
                catch (err) {
                    console.error(err);
                }
            });
            socket.on("createDataProducerTransport", async (callback) => {
                try {
                    let objPeer = this.peerInfoMap.get(socket.id);
                    if (!objPeer) {
                        callback(null);
                        return;
                    }
                    const { transport, params } = await this.createRoomTransport(objPeer.roomId, true);
                    this.addTransportData(transport, objPeer.roomId, socket.id, false);
                    callback(params);
                }
                catch (err) {
                    console.error(err);
                }
            });
            socket.on("createConsumerTransport", async (callback) => {
                try {
                    let objPeer = this.peerInfoMap.get(socket.id);
                    if (!objPeer) {
                        callback(null);
                        return;
                    }
                    const { transport, params } = await this.createRoomTransport(objPeer.roomId);
                    this.addTransport(transport, objPeer.roomId, socket.id, true);
                    callback(params);
                }
                catch (err) {
                    console.error(err);
                }
            });
            socket.on("createDataConsumerTransport", async (callback) => {
                try {
                    let objPeer = this.peerInfoMap.get(socket.id);
                    if (!objPeer) {
                        callback(null);
                        return;
                    }
                    const { transport, params } = await this.createRoomTransport(objPeer.roomId, true);
                    this.addTransportData(transport, objPeer.roomId, socket.id, true);
                    callback(params);
                }
                catch (err) {
                    console.error(err);
                }
            });
            socket.on('connectProducerTransport', async (data, callback) => {
                try {
                    console.log("Connecting Producer Transport");
                    let obj = await this.getTransport(socket.id, false);
                    if (!obj) {
                        callback();
                        return;
                    }
                    await obj.connect({ dtlsParameters: data.dtlsParameters });
                }
                catch (err) {
                    console.error(err);
                }
                callback();
            });
            socket.on('connectDataProducerTransport', async (data, callback) => {
                try {
                    console.log("Connecting Data Producer Transport");
                    let obj = await this.getTransportData(socket.id, false);
                    if (!obj) {
                        callback();
                        return;
                    }
                    await obj.connect({ dtlsParameters: data.dtlsParameters });
                }
                catch (err) {
                    console.error(err);
                }
                callback();
            });
            socket.on('connectConsumerTransport', async (data, callback) => {
                try {
                    console.log("Connecting Consumer Transport");
                    const consumerTransport = await this.getTransport(socket.id, true);
                    if (!consumerTransport) {
                        callback();
                        return;
                    }
                    await consumerTransport.connect({ dtlsParameters: data.dtlsParameters });
                }
                catch (err) {
                    console.error(err);
                }
                callback();
            });
            socket.on('connectDataConsumerTransport', async (data, callback) => {
                try {
                    console.log("Connecting Consumer Transport");
                    const consumerTransport = await this.getTransportData(socket.id, true);
                    if (!consumerTransport) {
                        callback();
                        return;
                    }
                    await consumerTransport.connect({ dtlsParameters: data.dtlsParameters });
                }
                catch (err) {
                    console.error(err);
                }
                callback();
            });
            socket.on('produce', async (data, callback) => {
                try {
                    const { kind, rtpParameters, appData } = data;
                    console.log("Starting the producer");
                    let producer = await this.getTransport(socket.id, false).produce({
                        kind, rtpParameters, appData,
                        ...(appData.paused !== null && {
                            paused: appData.paused
                        })
                    });
                    producer.on('transportclose', () => {
                        console.log('transport for this producer closed ');
                        producer.close();
                    });
                    let objPeer = this.peerInfoMap.get(socket.id);
                    let peerList = this.roomMap.get(objPeer.roomId).peerList;
                    callback({ id: producer.id, producersExist: peerList.size > 1 ? true : false });
                    this.addProducer(producer, socket.id);
                    if (kind === "audio") {
                        let audioLevelObserver = this.roomMap.get(objPeer.roomId).audioLevelObserver;
                        await audioLevelObserver.addProducer({
                            producerId: producer.id
                        });
                    }
                    io.to(objPeer.roomId).except(socket.id).emit('newProducer', producer.id, kind, objPeer.businessId, appData?.screen ? "screen" : "camera");
                }
                catch (err) {
                    console.error(err);
                }
            });
            socket.on('produceData', async (callback) => {
                try {
                    console.log("Starting the producer");
                    let producer = await this.getTransportData(socket.id, false).produceData({ sctpStreamParameters: {
                            streamId: 0,
                            ordered: true
                        }
                    });
                    producer.on('transportclose', () => {
                        console.log('transport for this producer closed ');
                        producer.close();
                    });
                    let objPeer = this.peerInfoMap.get(socket.id);
                    let peerList = this.roomMap.get(objPeer.roomId).peerList;
                    callback({ id: producer.id, producersExist: peerList.size > 1 ? true : false });
                    this.addProducerData(producer, socket.id);
                    io.to(objPeer.roomId).except(socket.id).emit('newProducer', producer.id, null, objPeer.businessId, "data");
                }
                catch (err) {
                    console.error(err);
                }
            });
            socket.on('consume', async (data, callback) => {
                try {
                    console.log("Consume call on the server side, data is below");
                    let obj = await this.createConsumer(data.rtpCapabilities, data.remoteProducerId, data.transportId, socket.id);
                    let objPeer = this.getPeerFromProducerId(socket.id, data.remoteProducerId);
                    callback(Object.assign({}, obj, {
                        businessId: objPeer.businessId
                    }));
                }
                catch (err) {
                    console.error(err);
                }
            });
            socket.on('consumeData', async (data, callback) => {
                try {
                    console.log("Consume call on the server side, data is below");
                    let obj = await this.createConsumerData(data.remoteProducerId, data.transportId, socket.id);
                    let objPeer = this.getPeerFromProducerDataId(socket.id, data.remoteProducerId);
                    callback(Object.assign({}, obj, {
                        businessId: objPeer.businessId
                    }));
                }
                catch (err) {
                    console.error(err);
                }
            });
            socket.on('resume', async (consumerId, callback) => {
                try {
                    let obj = this.peerInfoMap.get(socket.id);
                    for (let consumer of obj.receive.consumer) {
                        if (consumer.id === consumerId) {
                            await consumer.resume();
                            break;
                        }
                    }
                    callback();
                }
                catch (err) {
                    console.error(err);
                }
            });
            socket.on('getProducers', callback => {
                try {
                    let producerList = [];
                    let objPeer = this.peerInfoMap.get(socket.id);
                    if (!objPeer) {
                        callback([]);
                        return;
                    }
                    let objRoom = this.roomMap.get(objPeer.roomId);
                    for (let socketId of objRoom.peerList) {
                        if (socketId != socket.id) {
                            let objPeer = this.peerInfoMap.get(socketId);
                            producerList = [...producerList, ...objPeer.send.producer.map(item => ({
                                    id: item.id,
                                    type: item.appData?.screen ? "screen" : "camera"
                                }))];
                        }
                    }
                    callback(producerList);
                }
                catch (err) {
                    console.error(err);
                }
            });
            socket.on("pauseSelf", async (kind, callback) => {
                try {
                    let objPeer = this.peerInfoMap.get(socket.id);
                    for (let producer of objPeer.send.producer) {
                        if (producer.kind === kind) {
                            await producer.pause();
                        }
                    }
                    callback();
                }
                catch (err) {
                    console.error(err);
                }
            });
            socket.on("resumeSelf", async (kind, callback) => {
                try {
                    let objPeer = this.peerInfoMap.get(socket.id);
                    for (let producer of objPeer.send.producer) {
                        if (producer.kind === kind) {
                            await producer.resume();
                        }
                    }
                    callback();
                }
                catch (err) {
                    console.error(err);
                }
            });
            socket.on("pauseOther", async (kind, businessId, callback) => {
                try {
                    if (this.onHandleOperation) {
                        let objPeer = this.peerInfoMap.get(socket.id);
                        let ret = await this.onHandleOperation("pause", objPeer.roomId, objPeer.businessId, businessId, kind);
                        if (!ret) {
                            callback(false);
                            return;
                        }
                    }
                    let obj = this.getPeerFromBusinessId(socket.id, businessId);
                    if (obj) {
                        for (let producer of obj.send.producer) {
                            if (producer.kind === kind) {
                                await producer.pause();
                            }
                        }
                        callback(true);
                    }
                    else {
                        callback(false);
                    }
                }
                catch (err) {
                    console.error(err);
                }
            });
            socket.on("resumeOther", async (kind, businessId, callback) => {
                try {
                    if (this.onHandleOperation) {
                        let objPeer = this.peerInfoMap.get(socket.id);
                        let ret = await this.onHandleOperation("resume", objPeer.roomId, objPeer.businessId, businessId, kind);
                        if (!ret) {
                            callback(false);
                            return;
                        }
                    }
                    let obj = this.getPeerFromBusinessId(socket.id, businessId);
                    if (obj) {
                        for (let producer of obj.send.producer) {
                            if (producer.kind === kind) {
                                await producer.resume();
                            }
                        }
                        callback(true);
                    }
                    else {
                        callback(false);
                    }
                }
                catch (err) {
                    console.error(err);
                }
            });
            socket.on("kick", async (businessId, callback) => {
                try {
                    if (this.onHandleOperation) {
                        let objPeer = this.peerInfoMap.get(socket.id);
                        let ret = await this.onHandleOperation("kick", objPeer.roomId, objPeer.businessId, businessId, null);
                        if (!ret) {
                            callback(false);
                            return;
                        }
                    }
                    let obj = this.getPeerFromBusinessId(socket.id, businessId);
                    if (obj) {
                        if (this.onLeaveRoom) {
                            await this.onLeaveRoom("kick", obj.roomId, obj.businessId, obj.socketId);
                        }
                        this.leaveRoom(obj.socketId);
                        callback(true);
                        if (this.onLeavedRoom) {
                            this.onLeavedRoom("kick", obj.roomId, obj.businessId, obj.socketId);
                        }
                        this.io.in(obj.socketId).emit("kick");
                    }
                    else {
                        callback(false);
                    }
                }
                catch (err) {
                    console.error(err);
                }
            });
            socket.on("end", async (callback) => {
                try {
                    if (this.onHandleOperation) {
                        let objPeer = this.peerInfoMap.get(socket.id);
                        let ret = await this.onHandleOperation("end", objPeer.roomId, objPeer.businessId, null, null);
                        if (!ret) {
                            callback(false);
                            return;
                        }
                    }
                    let objPeer = this.peerInfoMap.get(socket.id);
                    if (objPeer) {
                        let objRoom = this.roomMap.get(objPeer.roomId);
                        for (let id of objRoom.peerList) {
                            let obj = this.peerInfoMap.get(id);
                            if (obj) {
                                if (this.onLeaveRoom) {
                                    await this.onLeaveRoom("end", obj.roomId, obj.businessId, obj.socketId);
                                }
                                this.leaveRoom(obj.socketId);
                                if (this.onLeavedRoom) {
                                    this.onLeavedRoom("end", obj.roomId, obj.businessId, obj.socketId);
                                }
                                this.io.in(obj.socketId).emit("kick");
                            }
                        }
                    }
                    callback(true);
                }
                catch (err) {
                    console.error(err);
                }
            });
            socket.on("states", callback => {
                try {
                    let objPeer = this.peerInfoMap.get(socket.id);
                    if (objPeer) {
                        let objRoom = this.roomMap.get(objPeer.roomId);
                        if (objRoom) {
                            let arr = [];
                            for (let socketId of objRoom.peerList) {
                                let obj = this.peerInfoMap.get(socketId);
                                if (obj) {
                                    let kinds = {};
                                    obj.send.producer.forEach(item => {
                                        if (item instanceof Producer && !item.appData.screen)
                                            kinds[item.kind] = !item.paused;
                                    });
                                    arr = [...arr, {
                                            businessId: obj.businessId,
                                            kinds: kinds
                                        }];
                                }
                            }
                            callback(arr);
                        }
                        else {
                            callback([]);
                        }
                    }
                    else {
                        callback([]);
                    }
                }
                catch (err) {
                    console.error(err);
                }
            });
            socket.on("messageSend", async (message, callback) => {
                try {
                    let obj = this.peerInfoMap.get(socket.id);
                    await this.onMessageSend?.(obj.roomId, obj.businessId, message);
                    callback(true);
                    this.io.in(obj.roomId).emit("messageReceive", message, obj.businessId);
                }
                catch (err) {
                    console.log(err);
                    callback(false);
                }
            });
            socket.on("getScreenProducers", callback => {
                try {
                    let obj = this.peerInfoMap.get(socket.id);
                    let ret = this.getScreenProducers(obj.roomId);
                    callback(ret ? {
                        video: ret.video?.id,
                        audio: ret.audio?.id
                    } : null);
                }
                catch (err) {
                    console.error(err);
                }
            });
            socket.on("stopScreen", async () => {
                let obj = this.peerInfoMap.get(socket.id);
                for (let i = 0; i < obj?.send.producer.length; i++) {
                    let producer = obj.send.producer[i];
                    if (producer.appData?.screen) {
                        producer.close();
                        obj.send.producer.splice(i, 1);
                        i--;
                    }
                }
            });
            socket.addListener("disconnect", async (reason) => {
                let obj = this.peerInfoMap.get(socket.id);
                if (obj && this.onLeaveRoom) {
                    await this.onLeaveRoom("self", obj.roomId, obj.businessId, socket.id);
                }
                this.leaveRoom(socket.id);
                if (obj && this.onLeavedRoom) {
                    this.onLeavedRoom("self", obj.roomId, obj.businessId, socket.id);
                }
            });
        });
    }
    async start() {
        for (let i = 0; i < this.workList.length; i++) {
            let worker = await mediaSoup.createWorker(this.config.worker);
            worker.on("died", args => {
                console.log(args);
            });
            this.workList[i] = worker;
        }
    }
    getPeerFromProducerId(socketId, producerId, isAll = false) {
        let objPeer = this.peerInfoMap.get(socketId);
        let objRoom = this.roomMap.get(objPeer.roomId);
        for (let id of objRoom.peerList) {
            if (isAll || id !== socketId) {
                let obj = this.peerInfoMap.get(id);
                for (let produce of obj.send.producer) {
                    if (produce.id === producerId) {
                        return obj;
                    }
                }
            }
        }
    }
    getPeerFromProducerDataId(socketId, producerId, isAll = false) {
        let objPeer = this.peerInfoMap.get(socketId);
        let objRoom = this.roomMap.get(objPeer.roomId);
        for (let id of objRoom.peerList) {
            if (isAll || id !== socketId) {
                let obj = this.peerInfoMap.get(id);
                if (obj.send.producerData.id === producerId) {
                    return obj;
                }
            }
        }
    }
    getPeerFromProducerIdAndRoomId(roomId, producerId) {
        let objRoom = this.roomMap.get(roomId);
        for (let id of objRoom.peerList) {
            let obj = this.peerInfoMap.get(id);
            for (let produce of obj.send.producer) {
                if (produce.id === producerId) {
                    return obj;
                }
            }
        }
    }
    getPeerFromBusinessId(socketId, businessId, isAll = false) {
        let objPeer = this.peerInfoMap.get(socketId);
        let objRoom = this.roomMap.get(objPeer.roomId);
        for (let id of objRoom.peerList) {
            if (isAll || id !== socketId) {
                let obj = this.peerInfoMap.get(id);
                if (obj.businessId === businessId) {
                    return obj;
                }
            }
        }
    }
    getPeerFromBusinessIdAndRoomId(roomId, businessId) {
        let objRoom = this.roomMap.get(roomId);
        if (objRoom) {
            for (let id of objRoom.peerList) {
                let obj = this.peerInfoMap.get(id);
                if (obj.businessId === businessId) {
                    return obj;
                }
            }
        }
    }
    getWorker() {
        let obj = this.workList[this.workerIndex];
        this.workerIndex++;
        if (this.workerIndex >= this.workList.length) {
            this.workerIndex = 0;
        }
        return obj;
    }
    async createRoom(roomId, roomName, socketId, businessId) {
        let objRoom = this.roomMap.get(roomId);
        if (!objRoom) {
            let worker = this.getWorker();
            let mediaSoupRouter = await worker.createRouter({
                mediaCodecs: this.config.codecs
            });
            let audioLevelObserver = await mediaSoupRouter.createAudioLevelObserver({
                threshold: -55
            });
            audioLevelObserver.on("volumes", args => {
                let produce = args[0]?.producer;
                if (produce) {
                    let objPeer = this.getPeerFromProducerIdAndRoomId(roomId, produce.id);
                    if (objPeer) {
                        let objRoom = this.roomMap.get(roomId);
                        for (let socketId of objRoom.peerList) {
                            this.io.in(socketId).emit("speaker", objPeer.businessId);
                        }
                    }
                }
            });
            this.roomMap.set(roomId, {
                roomId,
                peerList: new Set([socketId]),
                roomName,
                router: mediaSoupRouter,
                audioLevelObserver: audioLevelObserver
            });
        }
        else {
            objRoom.peerList.add(socketId);
        }
        this.peerInfoMap.set(socketId, {
            businessId,
            roomId: roomId,
            socketId: socketId,
            send: {
                transport: null,
                producer: [],
                transportData: null,
                producerData: null
            },
            receive: {
                transport: null,
                consumer: [],
                transportData: null,
                consumerData: []
            }
        });
    }
    async createRoomTransport(roomId, enableSctp = false) {
        let obj = this.roomMap.get(roomId);
        if (!obj) {
            return;
        }
        const transport = await obj.router.createWebRtcTransport({
            ...this.config.webRtcTransport,
            enableSctp
        });
        transport.on("dtlsstatechange", state => {
            if (state == "closed") {
                transport.close();
            }
        });
        return {
            transport,
            params: {
                id: transport.id,
                iceParameters: transport.iceParameters,
                iceCandidates: transport.iceCandidates,
                dtlsParameters: transport.dtlsParameters,
                sctpParameters: transport.sctpParameters,
            },
        };
    }
    addConsumer(consumer, socketId) {
        let obj = this.peerInfoMap.get(socketId);
        if (obj) {
            obj.receive.consumer.push(consumer);
        }
    }
    addConsumerData(consumer, socketId) {
        let obj = this.peerInfoMap.get(socketId);
        if (obj) {
            obj.receive.consumerData.push(consumer);
        }
    }
    addProducer(producer, socketId) {
        let obj = this.peerInfoMap.get(socketId);
        if (obj) {
            obj.send.producer.push(producer);
        }
    }
    addProducerData(producer, socketId) {
        let obj = this.peerInfoMap.get(socketId);
        if (obj) {
            if (obj.send.producerData) {
                obj.send.producerData.close();
            }
            obj.send.producerData = producer;
        }
    }
    addTransport(transport, roomId, socketId, isConsumer) {
        let obj = this.peerInfoMap.get(socketId);
        if (obj) {
            if (isConsumer) {
                obj.receive.transport = transport;
            }
            else {
                obj.send.transport = transport;
            }
        }
    }
    addTransportData(transport, roomId, socketId, isConsumer) {
        let obj = this.peerInfoMap.get(socketId);
        if (obj) {
            if (isConsumer) {
                obj.receive.transportData = transport;
            }
            else {
                obj.send.transportData = transport;
            }
        }
    }
    getProducer(socketId, type) {
        const [producerTransport] = this.peerInfoMap.get(socketId).send.producer.filter(item => {
            if (item instanceof Producer) {
                return item.kind === type;
            }
        });
        return producerTransport;
    }
    getTransport(socketId, isConsumer) {
        const producerTransport = this.peerInfoMap.get(socketId);
        return isConsumer ? producerTransport.receive.transport : producerTransport.send.transport;
    }
    getTransportData(socketId, isConsumer) {
        const producerTransport = this.peerInfoMap.get(socketId);
        return isConsumer ? producerTransport.receive.transportData : producerTransport.send.transportData;
    }
    async createConsumer(rtpCapabilities, remoteProducerId, serverConsumerTransportId, socketId) {
        const objTransport = this.peerInfoMap.get(socketId);
        const roomId = objTransport.roomId;
        const router = this.roomMap.get(roomId).router;
        console.log("Creating consumer for remote producerId = " + remoteProducerId);
        const consumerTransport = objTransport.receive.transport;
        if (!router.canConsume({
            producerId: remoteProducerId,
            rtpCapabilities,
        })) {
            console.error('can not consume');
            return;
        }
        try {
            let objPeer = this.getPeerFromProducerId(socketId, remoteProducerId);
            let producer = objPeer.send.producer.find(item => item.id === remoteProducerId);
            let consumer = await consumerTransport.consume({
                producerId: remoteProducerId,
                rtpCapabilities,
                paused: true,
                ...(producer.appData && {
                    appData: Object.assign({}, producer.appData)
                })
            });
            consumer.on('transportclose', () => {
                console.log('transport close from consumer');
            });
            consumer.on('producerclose', async () => {
                console.log('producer of consumer closed');
                this.io.in(roomId).emit('producerClosed', remoteProducerId, consumer.kind, objPeer.businessId, consumer.appData?.screen ? "screen" : "camera");
                objTransport.receive.consumer = objTransport.receive.consumer.filter(consumer => consumer.id !== consumer.id);
                consumer.close();
                if (consumer.kind === "audio") {
                    let objRoom = this.roomMap.get(objPeer.roomId);
                    try {
                        await objRoom.audioLevelObserver.removeProducer({
                            producerId: consumer.producerId
                        });
                    }
                    catch {
                        console.log(`${consumer.producerId} not found`);
                    }
                }
            });
            consumer.on("producerpause", () => {
                this.io.in(roomId).emit('producerPause', remoteProducerId, consumer.kind, objPeer.businessId);
            });
            consumer.on("producerresume", () => {
                this.io.in(roomId).emit('producerResume', remoteProducerId, consumer.kind, objPeer.businessId);
            });
            this.addConsumer(consumer, socketId);
            if (consumer.type === 'simulcast') {
                await consumer.setPreferredLayers({ spatialLayer: 2, temporalLayer: 2 });
            }
            return {
                producerId: remoteProducerId,
                id: consumer.id,
                kind: consumer.kind,
                rtpParameters: consumer.rtpParameters,
                type: consumer.appData?.screen ? "screen" : "camera",
                producerPaused: consumer.producerPaused
            };
        }
        catch (error) {
            console.error('consume failed', error);
            return;
        }
    }
    async createConsumerData(remoteProducerId, serverConsumerTransportId, socketId) {
        const objTransport = this.peerInfoMap.get(socketId);
        const roomId = objTransport.roomId;
        const router = this.roomMap.get(roomId).router;
        console.log("Creating consumer for remote producerId = " + remoteProducerId);
        const consumerTransport = objTransport.receive.transportData;
        try {
            console.log(`producerId:${remoteProducerId}`);
            let consumer = await consumerTransport.consumeData({
                dataProducerId: remoteProducerId,
                ordered: true
            });
            let objPeer = this.getPeerFromProducerDataId(socketId, remoteProducerId);
            consumer.on('transportclose', () => {
                console.log('transport close from consumer');
            });
            consumer.on('dataproducerclose', async () => {
                console.log('producer of consumer closed');
                this.io.in(roomId).emit('producerClosed', remoteProducerId, null, objPeer.businessId, "data");
                objTransport.receive.consumerData = objTransport.receive.consumerData.filter(consumer => consumer.id !== consumer.id);
                consumer.close();
            });
            this.addConsumerData(consumer, socketId);
            return {
                producerId: remoteProducerId,
                id: consumer.id,
            };
        }
        catch (error) {
            console.error('consume failed', error);
            return;
        }
    }
    leaveRoom(socketId) {
        let obj = this.peerInfoMap.get(socketId);
        if (obj) {
            if (obj.send.transport) {
                obj.send.transport.close();
            }
            if (obj.send.transportData) {
                obj.send.transportData.close();
            }
            obj.send.producer.forEach(item => item.close());
            obj.send.producerData?.close();
            if (obj.receive.transport) {
                obj.receive.transport.close();
            }
            if (obj.receive.transportData) {
                obj.receive.transportData.close();
            }
            obj.receive.consumer.forEach(item => item.close());
            obj.receive.consumerData.forEach(item => item.close());
            this.peerInfoMap.delete(socketId);
            let objRoom = this.roomMap.get(obj.roomId);
            if (objRoom) {
                objRoom.peerList.delete(socketId);
                if (objRoom.peerList.size == 0) {
                    objRoom.router.close();
                    objRoom.audioLevelObserver.close();
                    this.roomMap.delete(obj.roomId);
                    this.onDeleteRoom?.(obj.roomId);
                }
            }
        }
    }
    getScreenProducers(roomId) {
        let objRoom = this.roomMap.get(roomId);
        if (objRoom) {
            let video, audio;
            for (let id of objRoom.peerList) {
                let objPeer = this.peerInfoMap.get(id);
                if (objPeer) {
                    for (let producer of objPeer.send.producer) {
                        if (producer.appData?.screen) {
                            if (producer.kind === "video") {
                                video = producer;
                            }
                            else if (producer.kind === "audio") {
                                audio = producer;
                            }
                        }
                    }
                }
            }
            if (video || audio) {
                return {
                    video,
                    audio
                };
            }
        }
    }
}
