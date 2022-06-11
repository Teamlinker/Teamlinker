import { ECommon_User_Type } from "../../../../common/model/user";

export interface IServer_Common_RPC_User_CheckSession {
    userId:string,
    type:ECommon_User_Type
}
export interface IServer_Common_RPC_User {
    checkSession?(token:string):Promise<IServer_Common_RPC_User_CheckSession>
    getUsersInfo?(userIds:string[],organizationId:string):Promise<{
        id:string,
        username:string,
        photo?:string,
        nickname?:string
    }[]>
    initAdmin?():Promise<string[]>
    initUser?():Promise<string[]>
    initOrganization?(adminIds:string[],userIds:string[]):Promise<string>
    initTeam?(userId:string,groupRoleUserId:string,organizationId:string)
}

export type IUserSession=IServer_Common_RPC_User_CheckSession