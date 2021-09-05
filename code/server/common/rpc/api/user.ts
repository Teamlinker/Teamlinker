import { EServer_Common_User_Type } from "../../types/user";

export interface IServer_Common_RPC_User_CheckSession {
    userId:string,
    type:EServer_Common_User_Type
}
export default interface IServer_Common_RPC_User {
    checkSession?(token:string):Promise<IServer_Common_RPC_User_CheckSession>
}