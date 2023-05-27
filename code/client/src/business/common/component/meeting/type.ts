import type {MediaKind, RtpCapabilities, RtpParameters} from "mediasoup-client/lib/RtpParameters";
import {DtlsParameters, IceCandidate, IceParameters} from "mediasoup-client/lib/Transport";

import {SctpParameters} from "mediasoup-client/lib/SctpParameters";

export interface Meeting_ServerToClientEvents {
    newProducer:(producerId:string,kind:MediaKind,businessId:string)=>void
    producerClosed:(producerId:string,kind:MediaKind,businessId:string)=>void
    producerPause:(producerId:string,kind:MediaKind,businessId:string)=>void
    producerResume:(producerId:string,kind:MediaKind,businessId:string)=>void
    kick:()=>void
    speaker:(businessId:string)=>void
}

export interface Meeting_ClientToServerEvents {
    joinRoom:(roomId:string,extraData:any,callback:(info:{
        roomId:string,
        roomName:string
    },msg?:string)=>void)=>void
    leaveRoom:(callback:()=>void)=>void
    getRouterRtpCapabilities:(callback:(capabilities:RtpCapabilities)=>void)=>void
    createProducerTransport:(callback:(param:{
        id: string,
        iceParameters: IceParameters,
        iceCandidates: IceCandidate[],
        dtlsParameters: DtlsParameters,
        sctpParameters: SctpParameters,
    })=>void)=>void
    createConsumerTransport:(callback:(param:{
        id: string,
        iceParameters: IceParameters,
        iceCandidates: IceCandidate[],
        dtlsParameters: DtlsParameters,
        sctpParameters: SctpParameters,
    })=>void)=>void
    connectProducerTransport:(data:{
        dtlsParameters:DtlsParameters
    },callback:()=>void)=>void
    connectConsumerTransport:(data:{
        dtlsParameters:DtlsParameters
    },callback:()=>void)=>void
    produce:(data:{
        kind:MediaKind,
        rtpParameters:RtpParameters
    },callback:(producerInfo:{
        id:string,
        producersExist:boolean
    })=>void)=>void
    consume:(data:{
        rtpCapabilities:RtpCapabilities,
        remoteProducerId:string,
        transportId:string
    },callback:(data:{
        businessId:string,
        producerId: string,
        id: string,
        kind: MediaKind,
        rtpParameters: RtpParameters,
        type: 'simple' | 'simulcast' | 'svc' | 'pipe',
        producerPaused: boolean
    })=>void)=>void
    getProducers:(callback:(producerList:string[])=>void)=>void
    resume:(consumerId:string,callback:()=>void)=>void
    pauseSelf:(kind:MediaKind,callback:()=>void)=>void
    resumeSelf:(kind:MediaKind,callback:()=>void)=>void
    pauseOther:(kind:MediaKind,businessId:string,callback:(success:boolean)=>void)=>void
    resumeOther:(kind:MediaKind,businessId:string,callback:(success:boolean)=>void)=>void
    kick:(businessId:string,callback:(success:boolean)=>void)=>void
    end:(callback:(success:boolean)=>void)=>void
    states:(callback:(list:{
        businessId:string,
        kinds:{
            [kind:string]:boolean
        }
    }[])=>void)=>void
}

export interface Meeting_InterServerEvents {

}

export interface Meeting_Data {

}
