export namespace EServer_Common_Event_Types {
    export type Types= User|Project|Team|File
    export enum User {
        DELETE="delete user"  //userId:string
    }
    export enum Project {
        DELETE="delete project"  //projectId:string
    }
    export enum Team {
        DELETE="delete team" //teamId:string
    }
    export enum File {
        REF="ref file",
        UNREF="unref file" //fileId:string
    }
}