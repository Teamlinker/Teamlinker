import {BaseModel} from "./base"

export enum ECommon_Model_Notification_Type {
    ORGANIZATION_INVITATION,
    ORGANIZATION_USER_REMOVE,
    ORGANIZATION_USER_ROLE_CHANGE,
    ORGANIZATION_USER_QUIT,
    TEAM_USER_ADD,
    TEAM_USER_REMOVE,
    TEAM_USER_ROLE_CHANGE,
    TEAM_USER_QUIT,
    TEAM_DISMISS,
    ISSUE_ASSIGNER_ASSIGN,
    ISSUE_REPORTER_ASSIGN,
    ISSUE_FIELD_CHANGE,
    ISSUE_WORKFLOW_CHANGE,
    ISSUE_COMMENT_ADD,
    ISSUE_COMMENT_AT,
    ISSUE_REMOVE,
    WIKI_ITEM_AT,
    CALENDAR_EVENT_INVITATION,
    ISSUE_APPROVAL_RESOLVE,
    ISSUE_APPROVAL_REJECT,
    ISSUE_ASSIGN_RELEASE,
    ISSUE_ASSIGN_SPRINT
}

export enum ECommon_Model_Notification_Status {
    NONE,
    PENDING,
    RESOLVED,
    REJECTED
}

export interface ICommon_Model_Notification {
    id:string,
    type:ECommon_Model_Notification_Type,
    created_time:Date,
    status:ECommon_Model_Notification_Status,
    ref_id:string,
    user_id:string,
    operation_organization_user_id:string,
    is_read:number,
    modified_time:Date,
    organization_id:string,
    extra:string
}
export const Table_Notification="notification"

class NotificationModel extends BaseModel {
    table=Table_Notification
    model=<ICommon_Model_Notification>{}
}

export let notificationModel=new NotificationModel