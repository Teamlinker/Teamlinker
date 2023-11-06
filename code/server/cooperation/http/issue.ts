import {ECommon_Model_Content_Type} from "../../../common/model/content";
import projectIssueApi from "../../../common/routes/issue";
import {
    ICommon_Route_Req_ProjectIssue_Field,
    ICommon_Route_Req_ProjectIssue_Field_Value
} from "../../../common/routes/response";
import {Err} from "../../../common/status/error";
import {DComponent} from "../../common/decorate/component";
import {DHttpApi, DHttpController, DHttpReqParam, DHttpReqParamRequired, DHttpUser} from "../../common/http/http";
import {ProjectIssueHistoryService, ProjectIssueService} from "../service/issue";
import {ProjectService} from "../service/project";
import {IUserSession} from "../../user/types/config";
import rpcContentApi from "../../content/rpc/content"
import rpcNotificationApi from "../../notification/rpc/notification"
import {ECommon_Model_Notification_Type} from "../../../common/model/notification";
import rpcCooperationApi from "../rpc/cooperation"
import rpcUserApi from "../../user/rpc/user"
import {ECommon_Model_Project_Issue_History_Type} from "../../../common/model/project_issue_history";
import {IssueTypeService} from "../service/issueType";

@DComponent
@DHttpController(projectIssueApi)
class IssueController {
    @DHttpApi(projectIssueApi.routes.getFirstNodeFields)
    async getFirstNodeFields(@DHttpReqParamRequired("projectId") projectId: string,
                             @DHttpReqParamRequired("issueTypeId") issueTypeId: string): Promise<typeof projectIssueApi.routes.getFirstNodeFields.res> {
        let project = await ProjectService.getItemById(projectId)
        if (!project) {
            throw Err.Project.projectNotFound
        }
        let ret = await project.getFirstNodeFields(issueTypeId)
        return ret;
    }

    @DHttpApi(projectIssueApi.routes.create)
    async create(@DHttpReqParamRequired("projectId") projectId: string,
                 @DHttpReqParamRequired("issueTypeId") issueTypeId: string,
                 @DHttpReqParamRequired("name") name: string,
                 @DHttpReqParamRequired("priority") priority: number,
                 @DHttpReqParam("assignerId") assignerId: string,
                 @DHttpReqParam("reporterId") reporterId: string,
                 @DHttpReqParam("manDay") manDay: number,
                 @DHttpReqParam("values") values: ICommon_Route_Req_ProjectIssue_Field[],
                 @DHttpUser user: IUserSession): Promise<typeof projectIssueApi.routes.create.res> {
        let projectIssue = new ProjectIssueService
        projectIssue.assignItem({
            project_id: projectId,
            issue_type_id: issueTypeId,
            name,
            priority,
            assigner_id: assignerId,
            reporter_id: reporterId,
            man_day: manDay,
            created_by: user.organizationInfo.organizationUserId
        })
        let obj = await projectIssue.create()
        await projectIssue.createFieldValues(values);
        if (assignerId) {
            rpcNotificationApi.createNotification(ECommon_Model_Notification_Type.ISSUE_ASSIGNER_ASSIGN, obj.id, assignerId, user.organizationInfo.organizationUserId)
        }
        if (reporterId) {
            rpcNotificationApi.createNotification(ECommon_Model_Notification_Type.ISSUE_REPORTER_ASSIGN, obj.id, reporterId, user.organizationInfo.organizationUserId)
        }
        return obj
    }

    @DHttpApi(projectIssueApi.routes.getNextNodeFields)
    async getNextNodeFields(@DHttpReqParamRequired("projectIssueId") projectIssueId: string,
                            @DHttpReqParamRequired("workflowActionId") workflowActionId: string): Promise<typeof projectIssueApi.routes.getNextNodeFields.res> {
        let projectIssue = await ProjectIssueService.getItemById(projectIssueId)
        if (!projectIssue) {
            throw Err.Project.ProjectIssue.projectIssueNotFound
        }
        let ret = await projectIssue.getNextNodeFields(workflowActionId)
        return ret;
    }

    @DHttpApi(projectIssueApi.routes.confirmNextNode)
    async confirmNextNode(@DHttpReqParamRequired("projectIssueId") projectIssueId: string,
                          @DHttpReqParamRequired("workflowActionId") workflowActionId: string,
                          @DHttpReqParam("values") values: ICommon_Route_Req_ProjectIssue_Field[], @DHttpUser user: IUserSession): Promise<typeof projectIssueApi.routes.confirmNextNode.res> {
        let projectIssue = await ProjectIssueService.getItemById(projectIssueId)
        if (!projectIssue) {
            throw Err.Project.ProjectIssue.projectIssueNotFound
        }
        await projectIssue.confirmNextNode(workflowActionId, values, user.organizationInfo.organizationUserId)
        rpcNotificationApi.createNotification(ECommon_Model_Notification_Type.ISSUE_WORKFLOW_CHANGE, projectIssueId, null, user.organizationInfo.organizationUserId)
        return
    }

    @DHttpApi(projectIssueApi.routes.editExtraField)
    async editExtraField(@DHttpReqParamRequired("projectIssueId") projectIssueId: string,
                         @DHttpReqParam("value") value: ICommon_Route_Req_ProjectIssue_Field_Value, @DHttpUser user: IUserSession): Promise<typeof projectIssueApi.routes.editExtraField.res> {
        let projectIssue = await ProjectIssueService.getItemById(projectIssueId)
        if (!projectIssue) {
            throw Err.Project.ProjectIssue.projectIssueNotFound
        }
        let ret = await projectIssue.updateFieldValue(value, user.organizationInfo.organizationUserId)
        rpcNotificationApi.createNotification(ECommon_Model_Notification_Type.ISSUE_FIELD_CHANGE, projectIssueId, null, user.organizationInfo.organizationUserId)
        return ret;
    }

    @DHttpApi(projectIssueApi.routes.editBasicField)
    async editBasicField(@DHttpReqParamRequired("projectIssueId") projectIssueId: string,
                         @DHttpReqParam("name") name: string,
                         @DHttpReqParam("priority") priority: number,
                         @DHttpReqParam("assignerId") assignerId: string,
                         @DHttpReqParam("reporterId") reporterId: string,
                         @DHttpReqParam("manDay") manDay: number,
                         @DHttpUser user: IUserSession): Promise<typeof projectIssueApi.routes.editBasicField.res> {
        let projectIssue = await ProjectIssueService.getItemById(projectIssueId)
        if (!projectIssue) {
            throw Err.Project.ProjectIssue.projectIssueNotFound
        }
        projectIssue.assignItem({
            name,
            priority,
            assigner_id: assignerId,
            reporter_id: reporterId,
            man_day:manDay
        })
        let ret = await projectIssue.update()
        if (assignerId) {
            rpcNotificationApi.createNotification(ECommon_Model_Notification_Type.ISSUE_ASSIGNER_ASSIGN, projectIssueId, assignerId, user.organizationInfo.organizationUserId)
        }
        if (reporterId) {
            rpcNotificationApi.createNotification(ECommon_Model_Notification_Type.ISSUE_REPORTER_ASSIGN, projectIssueId, reporterId, user.organizationInfo.organizationUserId)
        }
        if (name || priority) {
            rpcNotificationApi.createNotification(ECommon_Model_Notification_Type.ISSUE_FIELD_CHANGE, projectIssueId, null, user.organizationInfo.organizationUserId)
        }
        let key: string, value: string
        if (name) {
            key = "Name"
            value = name
        } else if (priority !== undefined) {
            key = "Priority"
            value = String(priority)
        } else if (assignerId) {
            key = "Assigner"
            value = assignerId
        } else if (reporterId) {
            key = "Reporter"
            value = reporterId
        }
        let objHistory = new ProjectIssueHistoryService()
        objHistory.assignItem({
            project_issue_id: ret.id,
            name: key,
            type: ECommon_Model_Project_Issue_History_Type.UPDATE_FIELD,
            organization_user_id: user.organizationInfo.organizationUserId,
            project_id: ret.project_id,
            value: value
        })
        objHistory.create()
        return ret;
    }

    @DHttpApi(projectIssueApi.routes.editDescription)
    async editDescription(@DHttpReqParamRequired("projectIssueId") projectIssueId: string,
                          @DHttpReqParam("description") description: string, @DHttpUser user: IUserSession): Promise<typeof projectIssueApi.routes.editDescription.res> {
        let projectIssue = await ProjectIssueService.getItemById(projectIssueId)
        if (!projectIssue) {
            throw Err.Project.ProjectIssue.projectIssueNotFound
        }
        await projectIssue.editDescription(description, user.organizationInfo.organizationUserId)
        rpcNotificationApi.createNotification(ECommon_Model_Notification_Type.ISSUE_FIELD_CHANGE, projectIssueId, null, user.organizationInfo.organizationUserId)
        return;
    }

    @DHttpApi(projectIssueApi.routes.remove)
    async remove(@DHttpReqParamRequired("projectIssueId") projectIssueId: string, @DHttpUser user: IUserSession): Promise<typeof projectIssueApi.routes.remove.res> {
        let projectIssue = await ProjectIssueService.getItemById(projectIssueId)
        if (!projectIssue) {
            throw Err.Project.ProjectIssue.projectIssueNotFound
        }
        await projectIssue.delete()
        let objProject = await ProjectService.getItemById(projectIssue.getItem().project_id)
        rpcNotificationApi.createNotification(ECommon_Model_Notification_Type.ISSUE_REMOVE, projectIssueId, null, user.organizationInfo.organizationUserId, `${objProject.getItem().keyword}-${projectIssue.getItem().unique_id}`)
        return;
    }

    @DHttpApi(projectIssueApi.routes.basicInfo)
    async basicInfo(@DHttpReqParam("projectIssueId") projectIssueId: string,
                    @DHttpReqParam("uniqueKey") uniqueKey: string): Promise<typeof projectIssueApi.routes.basicInfo.res> {
        if (!projectIssueId && !uniqueKey) {
            throw Err.Project.projectKeywordNotFound
        }
        let projectIssue: ProjectIssueService
        if (projectIssueId) {
            projectIssue = await ProjectIssueService.getItemById(projectIssueId)
            if (!projectIssue) {
                throw Err.Project.ProjectIssue.projectIssueNotFound
            }
        } else {
            projectIssue = await ProjectIssueService.getObjByUniqueKey(uniqueKey)
            if (!projectIssue) {
                throw Err.Project.ProjectIssue.projectIssueNotFound
            }
        }
        let ret = await projectIssue.getBasicInfo()
        return ret;
    }

    @DHttpApi(projectIssueApi.routes.descriptionInfo)
    async descriptionInfo(@DHttpReqParamRequired("projectIssueId") projectIssueId: string): Promise<typeof projectIssueApi.routes.descriptionInfo.res> {
        let projectIssue = await ProjectIssueService.getItemById(projectIssueId)
        if (!projectIssue) {
            throw Err.Project.ProjectIssue.projectIssueNotFound
        }
        let ret = await projectIssue.getDescription()
        return ret
    }

    @DHttpApi(projectIssueApi.routes.fieldsInfo)
    async fieldsInfo(@DHttpReqParamRequired("projectIssueId") projectIssueId: string): Promise<typeof projectIssueApi.routes.fieldsInfo.res> {
        let projectIssue = await ProjectIssueService.getItemById(projectIssueId)
        if (!projectIssue) {
            throw Err.Project.ProjectIssue.projectIssueNotFound
        }
        let ret = await projectIssue.fieldsInfo()
        return ret
    }

    @DHttpApi(projectIssueApi.routes.actionsInfo)
    async actionsInfo(@DHttpReqParamRequired("projectIssueId") projectIssueId: string, @DHttpUser user: IUserSession): Promise<typeof projectIssueApi.routes.actionsInfo.res> {
        let projectIssue = await ProjectIssueService.getItemById(projectIssueId)
        if (!projectIssue) {
            throw Err.Project.ProjectIssue.projectIssueNotFound
        }
        let ret = await projectIssue.actionsInfo(user.organizationInfo.organizationUserId)
        return ret
    }

    @DHttpApi(projectIssueApi.routes.commentList)
    async commentList(@DHttpReqParamRequired("projectIssueId") projectIssueId: string): Promise<typeof projectIssueApi.routes.commentList.res> {
        let commentList = await rpcContentApi.list(projectIssueId, ECommon_Model_Content_Type.PROJECT_ISSUE_COMMENT, false)
        return commentList
    }

    @DHttpApi(projectIssueApi.routes.commentCreate)
    async commentCreate(@DHttpReqParamRequired("projectIssueId") projectIssueId: string, @DHttpReqParamRequired("content") content: string, @DHttpUser user: IUserSession): Promise<typeof projectIssueApi.routes.commentCreate.res> {
        let ret = await rpcContentApi.add(projectIssueId, ECommon_Model_Content_Type.PROJECT_ISSUE_COMMENT, user.organizationInfo.organizationUserId, content)
        rpcNotificationApi.createNotification(ECommon_Model_Notification_Type.ISSUE_COMMENT_ADD, projectIssueId, null, user.organizationInfo.organizationUserId)
        return ret;
    }

    @DHttpApi(projectIssueApi.routes.commentEdit)
    async commentEdit(@DHttpReqParamRequired("contentId") contentId: string, @DHttpReqParamRequired("content") content: string, @DHttpUser user: IUserSession): Promise<typeof projectIssueApi.routes.commentEdit.res> {
        let ret = await rpcContentApi.edit(contentId, user.organizationInfo.organizationUserId, content)
        return ret;
    }

    @DHttpApi(projectIssueApi.routes.commentRemove)
    async commentRemove(@DHttpReqParamRequired("contentId") contentId: string): Promise<typeof projectIssueApi.routes.commentRemove.res> {
        await rpcContentApi.remove(contentId)
        return
    }

    @DHttpApi(projectIssueApi.routes.copy)
    async copy(@DHttpReqParamRequired("projectIssueId") projectIssueId: string, @DHttpReqParam("name") name: string, @DHttpUser user: IUserSession): Promise<typeof projectIssueApi.routes.copy.res> {
        let projectIssue = await ProjectIssueService.getItemById(projectIssueId)
        if (!projectIssue) {
            throw Err.Project.ProjectIssue.projectIssueNotFound
        }
        let ret = await projectIssue.copy()
        if (name) {
            ret.assignItem({
                name
            })
            await ret.update()
        }
        if (ret.getItem().assigner_id) {
            rpcNotificationApi.createNotification(ECommon_Model_Notification_Type.ISSUE_ASSIGNER_ASSIGN, ret.getId(), ret.getItem().assigner_id, user.organizationInfo.organizationUserId)
        }
        if (ret.getItem().reporter_id) {
            rpcNotificationApi.createNotification(ECommon_Model_Notification_Type.ISSUE_REPORTER_ASSIGN, ret.getId(), ret.getItem().reporter_id, user.organizationInfo.organizationUserId)
        }
        return ret.getItem()
    }

    @DHttpApi(projectIssueApi.routes.addChildIssue)
    async addChildIssue(@DHttpReqParamRequired("projectIssueId") projectIssueId: string, @DHttpReqParamRequired("projectIssueChildId") projectIssueChildId: string): Promise<typeof projectIssueApi.routes.addChildIssue.res> {
        let projectIssue = await ProjectIssueService.getItemById(projectIssueId)
        if (!projectIssue) {
            throw Err.Project.ProjectIssue.projectIssueNotFound
        }
        await projectIssue.addChildIssue(projectIssueChildId)
        return;
    }

    @DHttpApi(projectIssueApi.routes.removeChildIssue)
    async removeChildIssue(@DHttpReqParamRequired("projectIssueId") projectIssueId: string, @DHttpReqParamRequired("projectIssueChildId") projectIssueChildId: string): Promise<typeof projectIssueApi.routes.removeChildIssue.res> {
        let projectIssue = await ProjectIssueService.getItemById(projectIssueId)
        if (!projectIssue) {
            throw Err.Project.ProjectIssue.projectIssueNotFound
        }
        await projectIssue.removeChildIssue(projectIssueChildId)
        return;
    }

    @DHttpApi(projectIssueApi.routes.addParentIssue)
    async addParentIssue(@DHttpReqParamRequired("projectIssueId") projectIssueId: string, @DHttpReqParamRequired("projectIssueParentId") projectIssueParentId: string): Promise<typeof projectIssueApi.routes.addParentIssue.res> {
        let projectIssue = await ProjectIssueService.getItemById(projectIssueId)
        if (!projectIssue) {
            throw Err.Project.ProjectIssue.projectIssueNotFound
        }
        await projectIssue.addParentIssue(projectIssueParentId)
        return;
    }

    @DHttpApi(projectIssueApi.routes.removeParentIssue)
    async removeParentIssue(@DHttpReqParamRequired("projectIssueId") projectIssueId: string, @DHttpReqParamRequired("projectIssueParentId") projectIssueParentId: string): Promise<typeof projectIssueApi.routes.removeParentIssue.res> {
        let projectIssue = await ProjectIssueService.getItemById(projectIssueId)
        if (!projectIssue) {
            throw Err.Project.ProjectIssue.projectIssueNotFound
        }
        await projectIssue.removeParentIssue(projectIssueParentId)
        return;
    }

    @DHttpApi(projectIssueApi.routes.addRelatedIssue)
    async addRelatedIssue(@DHttpReqParamRequired("projectIssueId") projectIssueId: string, @DHttpReqParamRequired("projectIssueRelatedId") projectIssueRelatedId: string): Promise<typeof projectIssueApi.routes.addRelatedIssue.res> {
        let projectIssue = await ProjectIssueService.getItemById(projectIssueId)
        if (!projectIssue) {
            throw Err.Project.ProjectIssue.projectIssueNotFound
        }
        await projectIssue.addRelatedIssue(projectIssueRelatedId)
        return;
    }

    @DHttpApi(projectIssueApi.routes.removeRelatedIssue)
    async removeRelatedIssue(@DHttpReqParamRequired("projectIssueId") projectIssueId: string, @DHttpReqParamRequired("projectIssueRelatedId") projectIssueRelatedId: string): Promise<typeof projectIssueApi.routes.removeRelatedIssue.res> {
        let projectIssue = await ProjectIssueService.getItemById(projectIssueId)
        if (!projectIssue) {
            throw Err.Project.ProjectIssue.projectIssueNotFound
        }
        await projectIssue.removeRelatedIssue(projectIssueRelatedId)
        return;
    }

    @DHttpApi(projectIssueApi.routes.otherInfoList)
    async otherInfoList(@DHttpReqParamRequired("projectIssueId") projectIssueId: string): Promise<typeof projectIssueApi.routes.otherInfoList.res> {
        let projectIssue = await ProjectIssueService.getItemById(projectIssueId)
        if (!projectIssue) {
            throw Err.Project.ProjectIssue.projectIssueNotFound
        }
        let ret = await projectIssue.otherInfoList()
        return ret;
    }

    @DHttpApi(projectIssueApi.routes.bindLabel)
    async bindTag(@DHttpReqParamRequired("projectIssueId") projectIssueId: string, @DHttpReqParamRequired("labelIds") labelIds: string[], @DHttpUser user: IUserSession): Promise<typeof projectIssueApi.routes.bindLabel.res> {
        let projectIssue = await ProjectIssueService.getItemById(projectIssueId)
        if (!projectIssue) {
            throw Err.Project.ProjectIssue.projectIssueNotFound
        }
        let ret = await projectIssue.bindLabels(labelIds, user.organizationInfo.organizationUserId)
        return ret;
    }

    @DHttpApi(projectIssueApi.routes.bindModule)
    async bindModule(@DHttpReqParamRequired("projectIssueId") projectIssueId: string, @DHttpReqParam("moduleId") moduleId: string, @DHttpUser user: IUserSession): Promise<typeof projectIssueApi.routes.bindModule.res> {
        let projectIssue = await ProjectIssueService.getItemById(projectIssueId)
        if (!projectIssue) {
            throw Err.Project.ProjectIssue.projectIssueNotFound
        }
        let ret = await projectIssue.bindModule(moduleId, user.organizationInfo.organizationUserId)
        return ret;
    }

    @DHttpApi(projectIssueApi.routes.filter)
    async filter(@DHttpReqParam("projectId") projectId: string,
                 @DHttpReqParam("projectIssueIds") projectIssueIds: string[],
                 @DHttpReqParam("createdBy") createdBy: string,
                 @DHttpReqParam("issueTypeId") issueTypeId: string,
                 @DHttpReqParam("name") name: string,
                 @DHttpReqParam("priority") priority: number,
                 @DHttpReqParam("assignerId") assignerId: string,
                 @DHttpReqParam("reporterId") reporterId: string,
                 @DHttpReqParam("status") status: number,
                 @DHttpReqParam("moduleId") moduleId: string,
                 @DHttpReqParam("labelId") labelId: string,
                 @DHttpReqParamRequired("page") page: number,
                 @DHttpReqParamRequired("size") size: number, @DHttpUser user: IUserSession): Promise<typeof projectIssueApi.routes.filter.res> {
        let ret = await ProjectIssueService.filter(user.organizationInfo.organizationId, projectId, page, size, createdBy, issueTypeId, name, priority, assignerId, reporterId, status, moduleId, labelId, projectIssueIds)
        return ret;
    }

    @DHttpApi(projectIssueApi.routes.releaseList)
    async releaseList(@DHttpReqParamRequired("projectIssueId") projectIssueId: string): Promise<typeof projectIssueApi.routes.releaseList.res> {
        let projectIssue = await ProjectIssueService.getItemById(projectIssueId)
        if (!projectIssue) {
            throw Err.Project.ProjectIssue.projectIssueNotFound
        }
        let ret = await projectIssue.releaseList()
        return ret;
    }

    @DHttpApi(projectIssueApi.routes.bindReleases)
    async bindReleases(@DHttpReqParamRequired("projectIssueId") projectIssueId: string, @DHttpReqParamRequired("projectReleaseIds") projectReleaseIds: string[], @DHttpUser user: IUserSession): Promise<typeof projectIssueApi.routes.bindReleases.res> {
        let projectIssue = await ProjectIssueService.getItemById(projectIssueId)
        if (!projectIssue) {
            throw Err.Project.ProjectIssue.projectIssueNotFound
        }
        let ret = await projectIssue.bindReleases(projectReleaseIds, user.organizationInfo.organizationUserId)
        return ret;
    }

    @DHttpApi(projectIssueApi.routes.issueRelatedUsers)
    async issueRelatedUsers(@DHttpReqParamRequired("projectIssueId") projectIssueId: string, @DHttpUser user: IUserSession): Promise<typeof projectIssueApi.routes.issueRelatedUsers.res> {
        let userIds = await rpcCooperationApi.getIssueRelatedOrganizationUserIds(projectIssueId)
        let arr = await rpcUserApi.getOrganizationUsersInfo(userIds)
        return arr.map(item => {
            return {
                id: item.organizationUserId,
                photo: item.photo,
                name: item.nickname
            }
        });
    }

    @DHttpApi(projectIssueApi.routes.createChildIssue)
    async createChildIssue(@DHttpReqParamRequired("projectIssueId") projectIssueId: string, @DHttpReqParamRequired("name") name: string, @DHttpUser user: IUserSession): Promise<typeof projectIssueApi.routes.createChildIssue.res> {
        let projectIssue = await ProjectIssueService.getItemById(projectIssueId)
        if (!projectIssue) {
            throw Err.Project.ProjectIssue.projectIssueNotFound
        }
        let ret = await projectIssue.copy()
        ret.assignItem({
            name
        })
        await Promise.all([
            ret.update(),
            projectIssue.addChildIssue(ret.getId())
        ])
        if (ret.getItem().assigner_id) {
            rpcNotificationApi.createNotification(ECommon_Model_Notification_Type.ISSUE_ASSIGNER_ASSIGN, ret.getId(), ret.getItem().assigner_id, user.organizationInfo.organizationUserId)
        }
        if (ret.getItem().reporter_id) {
            rpcNotificationApi.createNotification(ECommon_Model_Notification_Type.ISSUE_REPORTER_ASSIGN, ret.getId(), ret.getItem().reporter_id, user.organizationInfo.organizationUserId)
        }
        return ret.getItem()
    }

    @DHttpApi(projectIssueApi.routes.listHistory)
    async listHistory(@DHttpReqParamRequired("projectIssueId") projectIssueId: string, @DHttpUser user: IUserSession): Promise<typeof projectIssueApi.routes.listHistory.res> {
        let projectIssue = await ProjectIssueService.getItemById(projectIssueId)
        if (!projectIssue) {
            throw Err.Project.ProjectIssue.projectIssueNotFound
        }
        let ret = await ProjectIssueHistoryService.list(projectIssueId)
        return ret;
    }

    @DHttpApi(projectIssueApi.routes.checkApproval)
    async checkApproval(@DHttpReqParamRequired("projectIssueId") projectIssueId: string, @DHttpUser user: IUserSession): Promise<typeof projectIssueApi.routes.checkApproval.res> {
        let projectIssue = await ProjectIssueService.getItemById(projectIssueId)
        if (!projectIssue) {
            throw Err.Project.ProjectIssue.projectIssueNotFound
        }
        let ret = await projectIssue.checkApproval(user.organizationInfo.organizationUserId)
        return {
            access: ret
        }
    }

    @DHttpApi(projectIssueApi.routes.revokeApproval)
    async revokeApproval(@DHttpReqParamRequired("projectIssueId") projectIssueId: string, @DHttpUser user: IUserSession): Promise<typeof projectIssueApi.routes.revokeApproval.res> {
        let projectIssue = await ProjectIssueService.getItemById(projectIssueId)
        if (!projectIssue) {
            throw Err.Project.ProjectIssue.projectIssueNotFound
        }
        await projectIssue.revokeApproval()
        return
    }

    @DHttpApi(projectIssueApi.routes.resolveApproval)
    async resolveApproval(@DHttpReqParamRequired("projectIssueId") projectIssueId: string, @DHttpUser user: IUserSession): Promise<typeof projectIssueApi.routes.resolveApproval.res> {
        let projectIssue = await ProjectIssueService.getItemById(projectIssueId)
        if (!projectIssue) {
            throw Err.Project.ProjectIssue.projectIssueNotFound
        }
        await projectIssue.resolveApproval(user.organizationInfo.organizationUserId)
        rpcNotificationApi.createNotification(ECommon_Model_Notification_Type.ISSUE_APPROVAL_RESOLVE, projectIssue.getId(), projectIssue.getItem().assigner_id, user.organizationInfo.organizationUserId)
        return
    }

    @DHttpApi(projectIssueApi.routes.rejectApproval)
    async rejectApproval(@DHttpReqParamRequired("projectIssueId") projectIssueId: string, @DHttpReqParamRequired("reason") reason: string, @DHttpUser user: IUserSession): Promise<typeof projectIssueApi.routes.rejectApproval.res> {
        let projectIssue = await ProjectIssueService.getItemById(projectIssueId)
        if (!projectIssue) {
            throw Err.Project.ProjectIssue.projectIssueNotFound
        }
        await projectIssue.rejectApproval(user.organizationInfo.organizationUserId, reason)
        rpcNotificationApi.createNotification(ECommon_Model_Notification_Type.ISSUE_APPROVAL_REJECT, projectIssue.getId(), projectIssue.getItem().assigner_id, user.organizationInfo.organizationUserId)
        return
    }

    @DHttpApi(projectIssueApi.routes.commitApproval)
    async commitApproval(@DHttpReqParamRequired("projectIssueId") projectIssueId: string, @DHttpUser user: IUserSession): Promise<typeof projectIssueApi.routes.commitApproval.res> {
        let projectIssue = await ProjectIssueService.getItemById(projectIssueId)
        if (!projectIssue) {
            throw Err.Project.ProjectIssue.projectIssueNotFound
        }
        await projectIssue.commitApproval()
        return
    }

    @DHttpApi(projectIssueApi.routes.convert)
    async convert(@DHttpReqParamRequired("projectIssueId") projectIssueId: string, @DHttpReqParamRequired("issueTypeId") issueTypeId: string, @DHttpReqParamRequired("values") values: ICommon_Route_Req_ProjectIssue_Field[], @DHttpUser user: IUserSession): Promise<typeof projectIssueApi.routes.convert.res> {
        let objIssue = await ProjectIssueService.getItemById(projectIssueId)
        if (!objIssue) {
            throw Err.Project.ProjectIssue.projectIssueNotFound
        }
        await objIssue.convert(issueTypeId, values, user.organizationInfo.organizationUserId)
        return
    }

    @DHttpApi(projectIssueApi.routes.listConvertField)
    async listConvertField(@DHttpReqParamRequired("projectId") projectId: string, @DHttpReqParamRequired("issueTypeId") issueTypeId: string, @DHttpUser user: IUserSession): Promise<typeof projectIssueApi.routes.listConvertField.res> {
        let project = await ProjectService.getItemById(projectId)
        if (!project) {
            throw Err.Project.projectNotFound
        }
        let objIssueType = await IssueTypeService.getItemById(issueTypeId)
        if (!objIssueType) {
            throw Err.Project.Issue.issueTypeNotFound
        }
        let ret = await project.getFirstNodeFields(objIssueType.getId())
        return ret;
    }

    @DHttpApi(projectIssueApi.routes.count)
    async count(@DHttpReqParamRequired("projectId") projectId: string, @DHttpUser user: IUserSession): Promise<typeof projectIssueApi.routes.count.res> {
        let project = await ProjectService.getItemById(projectId)
        if (!project) {
            throw Err.Project.projectNotFound
        }
        let ret = await project.issueCount()
        return {
            count: ret
        };
    }

    @DHttpApi(projectIssueApi.routes.globalSearchIssue)
    async globalSearchIssue(@DHttpReqParamRequired("keyword") keyword: string, @DHttpReqParamRequired("size") size: number, @DHttpUser user: IUserSession): Promise<typeof projectIssueApi.routes.globalSearchIssue.res> {
        let ret = await ProjectIssueService.globalSearch(keyword, size, user.organizationInfo.organizationUserId)
        return ret;
    }

    @DHttpApi(projectIssueApi.routes.recentIssueList)
    async recentIssueList(@DHttpReqParamRequired("size") size: number, @DHttpUser user: IUserSession): Promise<typeof projectIssueApi.routes.recentIssueList.res> {
        let ret = await ProjectIssueService.recentIssueList(user.organizationInfo.organizationUserId, size)
        return ret;
    }

}