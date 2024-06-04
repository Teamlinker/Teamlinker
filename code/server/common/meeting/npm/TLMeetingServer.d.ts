import { MediaKind } from 'mediasoup/node/lib/RtpParameters';
import { RtpCodecCapability } from 'mediasoup/node/lib/RtpParameters';
import { WorkerLogLevel } from 'mediasoup/node/lib/Worker';
import { WorkerLogTag } from 'mediasoup/node/lib/Worker';

declare type MeetingConfig = {
    worker: {
        logLevel: WorkerLogLevel;
        logTags: WorkerLogTag[];
        rtcMinPort: number;
        rtcMaxPort: number;
    };
    codecs: RtpCodecCapability[];
    webRtcTransport: {
        listenIps: {
            ip: string;
            announcedIp: string;
        }[];
        enableUdp: boolean;
        enableTcp: boolean;
        preferUdp: boolean;
        enableSctp: boolean;
        initialAvailableOutgoingBitrate: number;
        maxSctpMessageSize: number;
    };
};

export declare class MeetingServer {
    private io;
    private config;
    private roomMap;
    private workList;
    private peerInfoMap;
    private workerIndex;
    onJoinRoom: (roomId: string, extraData: any, socketData: any, socketId: string) => Promise<{
        roomName: string;
        businessId: string;
        error?: string;
    }>;
    onJoinedRoom: (roomId: string, businessId: string, socketId: string) => void;
    onLeaveRoom: (type: "self" | "kick" | "end", roomId: string, businessId: string, socketId: string) => Promise<void>;
    onLeavedRoom: (type: "self" | "kick" | "end", roomId: string, businessId: string, socketId: string) => Promise<void>;
    onHandleOperation: (type: "pause" | "resume" | "kick" | "end", roomId: string, fromBusinessId: string, toBusinessId?: string, kind?: MediaKind) => Promise<boolean>;
    onMessageSend: (roomId: string, fromBusinessId: string, message: string | Buffer) => Promise<void>;
    onDeleteRoom: (roomId: string) => void;
    constructor(io: any, config: MeetingConfig);
    start(): Promise<void>;
    private getPeerFromProducerId;
    private getPeerFromProducerDataId;
    private getPeerFromProducerIdAndRoomId;
    private getPeerFromBusinessId;
    private getPeerFromBusinessIdAndRoomId;
    private getWorker;
    private createRoom;
    private createRoomTransport;
    private addConsumer;
    private addConsumerData;
    private addProducer;
    private addProducerData;
    private addTransport;
    private addTransportData;
    private getProducer;
    private getTransport;
    private getTransportData;
    private createConsumer;
    private createConsumerData;
    private leaveRoom;
    private getScreenProducers;
}

export { }
