export namespace EServer_Common_Event_Types {
    export type Types= User|Project
    export enum User {
        DELETE="delete user"  //userId:string
    }
    export enum Project {
        DELETE="delete project"  //userId:string
    }
}