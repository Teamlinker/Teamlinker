import {ECommon_Services} from "../types";
import {ECommon_HttpApi_Method} from "./types";
import {Permission_Types} from "../permission/permission";
import {ECommon_Model_Meeting_Room_Type, ICommon_Model_Meeting_Room} from "../model/meeting_room";

const api= {
    baseUrl: "/meeting",
    service: ECommon_Services.Meeting,
    routes: {
        listRoom: {
            method: ECommon_HttpApi_Method.GET,
            path: "/room/list",
            req: <{
                keyword?:string,
                type?:ECommon_Model_Meeting_Room_Type,
                page:number,
                size:number
            }>{},
            res: <{
                data:ICommon_Model_Meeting_Room[],
                count:number,
                totalPage:number,
                page:number
            }>{},
            permission: [Permission_Types.Organization.READ]
        },
        createRoom: {
            method: ECommon_HttpApi_Method.POST,
            path: "/room",
            req: <{
                name:string,
                description?:string,
                related_id:string,
                startTime:number,
                endTime:number,
                password:string
            }>{},
            res: <ICommon_Model_Meeting_Room>{},
            permission: [Permission_Types.Organization.READ]
        },
        editRoom: {
            method: ECommon_HttpApi_Method.PUT,
            path: "/room",
            req: <{
                meetingRoomId:string,
                name?:string,
                description?:string,
                startTime?:number,
                endTime?:number,
                password?:string
            }>{},
            res: <ICommon_Model_Meeting_Room>{},
            permission: [Permission_Types.Organization.READ,Permission_Types.Common.SELF]
        },
        deleteRoom: {
            method: ECommon_HttpApi_Method.DELETE,
            path: "/room",
            req: <{
                meetingRoomId:string
            }>{},
            res: {},
            permission: [Permission_Types.Organization.READ,Permission_Types.Common.SELF]
        },
        getPersonalRoom: {
            method: ECommon_HttpApi_Method.GET,
            path: "/room/private",
            req: {},
            res: <ICommon_Model_Meeting_Room>{},
            permission: [Permission_Types.Organization.READ]
        },
        validateRoom:{
            method: ECommon_HttpApi_Method.GET,
            path: "/room/validate",
            req: <{
                meetingRoomId:string,
                password:string
            }>{},
            res: <{
                meetingRoomId:string,
                password:string
            }>{},
            permission: [Permission_Types.Organization.READ]
        },
        getCurrentRoom: {
            method: ECommon_HttpApi_Method.GET,
            path: "/room/current",
            req: {},
            res: <ICommon_Model_Meeting_Room>{},
            permission: [Permission_Types.Organization.READ]
        },
    }
}

export default api