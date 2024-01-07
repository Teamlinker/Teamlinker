import {ECommon_Meeting_Room_Permission} from "../../../../../../common/model/meeting_room";

export type OrganizationUserItem = {
    organizationUserId:string,
    name:string,
    permission:ECommon_Meeting_Room_Permission,
    videoStream:MediaStream,
    audioStream:MediaStream,
    video:boolean,
    audio:boolean
}