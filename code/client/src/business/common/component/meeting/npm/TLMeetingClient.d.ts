import { MediaKind } from 'mediasoup-client/lib/RtpParameters';
import * as mediaSoup from 'mediasoup-client';

export declare class MeetingClient {
    private device;
    private producerAudio;
    private producerVideo;
    private producerAudioScreen;
    private producerVideoScreen;
    private producerChat;
    private producerSet;
    private transportReceive;
    private transportSend;
    private transportDataSend;
    private socket;
    private roomInfo;
    private defaultVideo;
    private defaultAudio;
    private defaultCameraId;
    private defaultAudioId;
    onProducerStateChange: (state: "new" | "close" | "pause" | "resume", kind: mediaSoup.types.MediaKind, businessId: string, type: "data" | "camera" | "screen", stream?: MediaStream, producerId?: string) => void;
    onLocalProducerInit: (stream: MediaStream) => void;
    onLocalProducerStart: (kind: MediaKind) => void;
    onJoinedRoom: (roomInfo: RoomInfo) => void;
    onLeavedRoom: (roomInfo: RoomInfo) => void;
    onSpeaker: (businessId: string) => void;
    onKick: () => void;
    onMessageReceive: (data: any, businessId: string) => void;
    onMessageSend: (data: any) => void;
    onScreenStopped: () => void;
    private onDisconnect;
    constructor(socket: any);
    static enumVideoDevice(): Promise<{
        id: string;
        name: string;
    }[]>;
    static enumAudioDevice(): Promise<{
        id: string;
        name: string;
    }[]>;
    static checkVideoStream(id: string): Promise<MediaStream>;
    private _onDisconnect;
    getRoomInfo(): RoomInfo;
    join(roomId: string, extraData: any, isVideo?: boolean, isAudio?: boolean, cameraId?: string, audioId?: string, backImg?: string, blur?: boolean): Promise<{
        success: boolean;
        msg?: string;
    }>;
    leave(): Promise<boolean>;
    pause(kind: MediaKind): Promise<unknown>;
    resume(kind: MediaKind): Promise<unknown>;
    mute(kind: MediaKind, businessId: string): Promise<boolean>;
    unmute(kind: MediaKind, businessId: string): Promise<boolean>;
    kick(businessId: string): Promise<boolean>;
    end(): Promise<boolean>;
    states(): Promise<{
        businessId: string;
        kinds: {
            [kind: string]: boolean;
        };
    }[]>;
    sendMessage(message: string | Buffer): Promise<void>;
    startShare(): Promise<boolean>;
    stopShare(): void;
    private clearRoomConnection;
    private loadDevice;
    private subscribe;
    private consume;
    private subscribeData;
    private consumeData;
    private publish;
    private publishData;
    private getProducers;
}

declare type RoomInfo = {
    roomId: string;
    roomName: string;
};

export { }
