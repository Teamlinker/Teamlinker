import {IServer_Common_Config_Base} from "../../common/types/config";
import {ECommon_User_Type} from "../../../common/model/user";
import {ECommon_Platform_Type} from "../../../common/types";

export interface IServer_User_Config extends IServer_Common_Config_Base {

}

export interface IServer_Common_RPC_User_CheckSession_Organization {
    organizationId:string,
    organizationUserId?:string,
    fake?:boolean
}

export interface IServer_Common_RPC_User_CheckSession {
    userId:string,
    type:ECommon_User_Type,
    platform:ECommon_Platform_Type,
    organizationInfo?:IServer_Common_RPC_User_CheckSession_Organization
}

export type IUserSession=IServer_Common_RPC_User_CheckSession