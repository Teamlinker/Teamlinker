export namespace EServer_Common_Event_Types {
    export type Types= User|Project|Team
    export enum User {
        DELETE="delete user"  //userId:string
    }
    export enum Project {
        DELETE="delete project"  //projectId:string
    }
    export enum Team {
        DELETE="delete group" //teamId:string
    }
}