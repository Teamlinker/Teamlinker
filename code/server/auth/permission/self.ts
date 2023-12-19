import {REDIS_AUTH} from '../../common/cache/keys/auth';
import {DComponent} from "../../common/decorate/component";
import {PermissionBase} from "./base";
import {Permission_Types} from "../../../common/permission/permission";

@DComponent
export class PermissionSelf extends PermissionBase {
    async translateToField({commentId,projectIssueId,projectReleaseId,meetingRoomId,calendarEventId}: { [param: string]: any; userId?: string; isAdmin?: boolean; }): Promise<string>
    {
        let createdByPureId:string
        if(commentId) {
            let obj=new REDIS_AUTH.Permission.Project.createdByPureFromProjectIssueComment(commentId);
            createdByPureId=await obj.getValue();
            return createdByPureId;
        } else if(projectIssueId) {
            let obj=new REDIS_AUTH.Permission.Project.createdByPureFromProjectIssue(projectIssueId);
            createdByPureId=await obj.getValue();
            return createdByPureId;
        } else if(projectReleaseId) {
            let obj=new REDIS_AUTH.Permission.Project.createdByPureFromProjectRelease(projectReleaseId);
            createdByPureId=await obj.getValue();
            return createdByPureId;
        } else if(meetingRoomId) {
            let obj=new REDIS_AUTH.Permission.Meeting.createdByPureFromMeetingRoom(meetingRoomId);
            createdByPureId=await obj.getValue();
            return createdByPureId;
        } else if(calendarEventId) {
            let obj=new REDIS_AUTH.Permission.Calendar.createdByPureFromCalendarEvent(calendarEventId);
            createdByPureId=await obj.getValue();
            return createdByPureId;
        }
    }
    fieldName: string="created_by_pure"
    async generatorValue({created_by_pure,userId}: { [param: string]: any; organizationUserId?: string; isAdmin?: boolean; }): Promise<number> {
        if(created_by_pure==userId) {
            return Permission_Types.Common.SELF.value
        }
    }

    override async checkOrganizationId(businessId: string, currentOrganizationId: string): Promise<boolean> {
        return true
    }
}
