export namespace EServer_Common_Event_Types {
    export type Types= User|Project|Group
    export enum User {
        DELETE="delete user"  //userId:string
    }
    export enum Project {
        DELETE="delete project"  //projectId:string
    }
    export enum Group {
        DELETE="delete group" //groupId:string
    }
}