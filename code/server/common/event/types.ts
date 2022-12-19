export namespace EServer_Common_Event_Types {
    export type Types= User|Project|Team|File|IssueType|Auth
    export enum User {
        DELETE="userDelete"  //userId:string
    }
    export enum Project {
        DELETE="projectDelete"  //projectId:string
    }
    export enum Team {
        DELETE="teamDelete" //teamId:string
    }
    export enum File {
        REF="fileRef",
        UNREF="fileUnref" //fileId:string
    }
    export enum IssueType {
        DELETE //issueTypeId:string
    }
    export enum Auth {
        ORGANIZATION_USER_ADD="authOrganizationUserAdd",  //organizationId:string,user:string
        ORGANIZATION_USER_EDIT="authOrganizationUserEdit",  //organizationId:string,user:string
        ORGANIZATION_USER_DELETE="authOrganizationUserDelete",  //organizationId:string,user:string
        PROJECT_MEMBER_ADD="authProjectMemberAdd",   //projectId:string,memberId:string,
        PROJECT_MEMBER_EDIT="authProjectMemberEdit",  //projectId:string,memberId:string,
        PROJECT_MEMBER_DELETE="authProjectMemberDelete",//projectId:string,memberId:string,
        TEAM_USER_ADD="authTeamUserAdd",//teamId:string,userId:string,
        TEAM_USER_EDIT="authTeamUserEdit",//teamId:string,userId:string,
        TEAM_USER_DELETE="authTeamUserDelete"//teamId:string,userId:string,
    }
}