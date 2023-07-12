import {ECommon_Model_Content_Type} from "../../../common/model/content";
import projectIssueApi from "../../../common/routes/issue";
import {
     ICommon_Route_Req_ProjectIssue_Field,
     ICommon_Route_Req_ProjectIssue_Field_Value
} from "../../../common/routes/response";
import {Err} from "../../../common/status/error";
import {DComponent} from "../../common/decorate/component";
import {DHttpApi, DHttpController, DHttpReqParam, DHttpReqParamRequired, DHttpUser} from "../../common/http/http";
import {ProjectIssueService} from "../service/issue";
import {ProjectService} from "../service/project";
import {IUserSession} from "../../user/types/config";
import rpcContentApi from "../../content/rpc/content"
import rpcNotificationApi from "../../notification/rpc/notification"
import {ECommon_Model_Notification_Type} from "../../../common/model/notification";

@DComponent
@DHttpController(projectIssueApi)
class IssueController {
     @DHttpApi(projectIssueApi.routes.getFirstNodeFields)
     async getFirstNodeFields(@DHttpReqParamRequired("projectId") projectId :string ,
     @DHttpReqParamRequired("issueTypeId") issueTypeId :string):Promise<typeof projectIssueApi.routes.getFirstNodeFields.res> {
         let project=await ProjectService.getItemById(projectId)
         if(!project) {
              throw Err.Project.projectNotFound
         }
         let ret=await project.getFirstNodeFields(issueTypeId)
         return ret;
     }

     @DHttpApi(projectIssueApi.routes.create)
     async create(@DHttpReqParamRequired("projectId") projectId :string ,
     @DHttpReqParamRequired("issueTypeId") issueTypeId :string ,
     @DHttpReqParamRequired("name")     name :string,
     @DHttpReqParamRequired("priority")     priority :number,
     @DHttpReqParam("assignerId")     assignerId :string ,
     @DHttpReqParam("reporterId")     reporterId :string ,
     @DHttpReqParam("values")     values:ICommon_Route_Req_ProjectIssue_Field[],
     @DHttpUser user:IUserSession):Promise<typeof projectIssueApi.routes.create.res> {
         let projectIssue=new ProjectIssueService
         projectIssue.assignItem({
              project_id:projectId,
              issue_type_id:issueTypeId,
              name,
              priority,
              assigner_id:assignerId,
              reporter_id:reporterId,
              created_by:user.organizationInfo.organizationUserId
         })
         let obj=await projectIssue.create()
         projectIssue.assignItem(obj,true);
         await projectIssue.createFieldValues(values);
         if(assignerId) {
              rpcNotificationApi.createNotification(ECommon_Model_Notification_Type.ISSUE_ASSIGNER_ASSIGN,obj.id,assignerId,user.organizationInfo.organizationUserId)
         }
         if(reporterId) {
              rpcNotificationApi.createNotification(ECommon_Model_Notification_Type.ISSUE_REPORTER_ASSIGN,obj.id,reporterId,user.organizationInfo.organizationUserId)
         }
         return obj
     }

     @DHttpApi(projectIssueApi.routes.getNextNodeFields)
     async getNextNodeFields(@DHttpReqParamRequired("projectIssueId") projectIssueId :string ,
     @DHttpReqParamRequired("workflowActionId") workflowActionId :string):Promise<typeof projectIssueApi.routes.getNextNodeFields.res> {
         let projectIssue=await ProjectIssueService.getItemById(projectIssueId)
         if(!projectIssue) {
              throw Err.Project.ProjectIssue.projectIssueNotFound
         }
         let ret=await projectIssue.getNextNodeFields(workflowActionId)
         return ret;
     }
     @DHttpApi(projectIssueApi.routes.confirmNextNode)
     async confirmNextNode(@DHttpReqParamRequired("projectIssueId") projectIssueId :string ,
     @DHttpReqParamRequired("workflowActionId") workflowActionId :string,
     @DHttpReqParam("values")     values:ICommon_Route_Req_ProjectIssue_Field[],@DHttpUser user:IUserSession):Promise<typeof projectIssueApi.routes.confirmNextNode.res> {
          let projectIssue=await ProjectIssueService.getItemById(projectIssueId)
          if(!projectIssue) {
               throw Err.Project.ProjectIssue.projectIssueNotFound
          }
          await projectIssue.confirmNextNode(workflowActionId,values)
          rpcNotificationApi.createNotification(ECommon_Model_Notification_Type.ISSUE_WORKFLOW_CHANGE,projectIssueId,null,user.organizationInfo.organizationUserId)
          return
     }
     @DHttpApi(projectIssueApi.routes.editExtraField)
     async editExtraField(@DHttpReqParamRequired("projectIssueId") projectIssueId :string ,
     @DHttpReqParam("value")     value:ICommon_Route_Req_ProjectIssue_Field_Value,@DHttpUser user:IUserSession):Promise<typeof projectIssueApi.routes.editExtraField.res> {
          let projectIssue=await ProjectIssueService.getItemById(projectIssueId)
          if(!projectIssue) {
               throw Err.Project.ProjectIssue.projectIssueNotFound
          }
          let ret=await projectIssue.updateFieldValue(value)
          rpcNotificationApi.createNotification(ECommon_Model_Notification_Type.ISSUE_FIELD_CHANGE,projectIssueId,null,user.organizationInfo.organizationUserId)
          return ret;
     }
     @DHttpApi(projectIssueApi.routes.editBasicField)
     async editBasicField(@DHttpReqParamRequired("projectIssueId") projectIssueId :string ,
     @DHttpReqParam("name")     name :string,
     @DHttpReqParam("priority")     priority :number,
     @DHttpReqParam("assignerId")     assignerId :string ,
     @DHttpReqParam("reporterId")     reporterId :string,@DHttpUser user:IUserSession):Promise<typeof projectIssueApi.routes.editBasicField.res> {
          let projectIssue=await ProjectIssueService.getItemById(projectIssueId)
          if(!projectIssue) {
               throw Err.Project.ProjectIssue.projectIssueNotFound
          }
          projectIssue.assignItem({
               name,
               priority,
               assigner_id:assignerId,
               reporter_id:reporterId
          })
          let ret=await projectIssue.update()
          if(assignerId) {
               rpcNotificationApi.createNotification(ECommon_Model_Notification_Type.ISSUE_ASSIGNER_ASSIGN,projectIssueId,assignerId,user.organizationInfo.organizationUserId)
          }
          if(reporterId) {
               rpcNotificationApi.createNotification(ECommon_Model_Notification_Type.ISSUE_REPORTER_ASSIGN,projectIssueId,reporterId,user.organizationInfo.organizationUserId)
          }
          if(name || priority) {
               rpcNotificationApi.createNotification(ECommon_Model_Notification_Type.ISSUE_FIELD_CHANGE,projectIssueId,null,user.organizationInfo.organizationUserId)
          }
          return ret;
     }
     @DHttpApi(projectIssueApi.routes.editDescription)
     async editDescription(@DHttpReqParamRequired("projectIssueId") projectIssueId :string ,
     @DHttpReqParam("description")     description :string,@DHttpUser user:IUserSession):Promise<typeof projectIssueApi.routes.editDescription.res> {
          let projectIssue=await ProjectIssueService.getItemById(projectIssueId)
          if(!projectIssue) {
               throw Err.Project.ProjectIssue.projectIssueNotFound
          }
          await projectIssue.editDescription(description,user.organizationInfo.organizationUserId)
          rpcNotificationApi.createNotification(ECommon_Model_Notification_Type.ISSUE_FIELD_CHANGE,projectIssueId,null,user.organizationInfo.organizationUserId)
          return;
     }
     @DHttpApi(projectIssueApi.routes.remove)
     async remove(@DHttpReqParamRequired("projectIssueId") projectIssueId :string,@DHttpUser user:IUserSession):Promise<typeof projectIssueApi.routes.remove.res> {
          let projectIssue=await ProjectIssueService.getItemById(projectIssueId)
          if(!projectIssue) {
               throw Err.Project.ProjectIssue.projectIssueNotFound
          }
          await projectIssue.delete()
          let objProject=await ProjectService.getItemById(projectIssue.getItem().project_id)
          rpcNotificationApi.createNotification(ECommon_Model_Notification_Type.ISSUE_REMOVE,projectIssueId,null,user.organizationInfo.organizationUserId,`${objProject.getItem().keyword}-${projectIssue.getItem().unique_id}`)
          return;
     }
     @DHttpApi(projectIssueApi.routes.basicInfo)
     async basicInfo(@DHttpReqParam("projectIssueId") projectIssueId :string,
     @DHttpReqParam("uniqueKey") uniqueKey :string):Promise<typeof projectIssueApi.routes.basicInfo.res> {
          if(!projectIssueId && !uniqueKey) {
               throw Err.Project.projectKeywordNotFound
          }
          let projectIssue:ProjectIssueService
          if(projectIssueId) {
               projectIssue=await ProjectIssueService.getItemById(projectIssueId)
               if(!projectIssue) {
                    throw Err.Project.ProjectIssue.projectIssueNotFound
               }
          } else {
               projectIssue=await ProjectIssueService.getObjByUniqueKey(uniqueKey)
               if(!projectIssue) {
                    throw Err.Project.ProjectIssue.projectIssueNotFound
               }
          }
          let ret=await projectIssue.getBasicInfo()
          return ret;
     }
     @DHttpApi(projectIssueApi.routes.descriptionInfo)
     async descriptionInfo(@DHttpReqParamRequired("projectIssueId") projectIssueId :string):Promise<typeof projectIssueApi.routes.descriptionInfo.res> {
          let projectIssue=await ProjectIssueService.getItemById(projectIssueId)
          if(!projectIssue) {
               throw Err.Project.ProjectIssue.projectIssueNotFound
          }
          let ret=await projectIssue.getDescription()
          return ret
     }
     @DHttpApi(projectIssueApi.routes.fieldsInfo)
     async fieldsInfo(@DHttpReqParamRequired("projectIssueId") projectIssueId :string):Promise<typeof projectIssueApi.routes.fieldsInfo.res> {
          let projectIssue=await ProjectIssueService.getItemById(projectIssueId)
          if(!projectIssue) {
               throw Err.Project.ProjectIssue.projectIssueNotFound
          }
          let ret=await projectIssue.fieldsInfo()
          return ret
     }
     @DHttpApi(projectIssueApi.routes.actionsInfo)
     async actionsInfo(@DHttpReqParamRequired("projectIssueId") projectIssueId :string):Promise<typeof projectIssueApi.routes.actionsInfo.res> {
          let projectIssue=await ProjectIssueService.getItemById(projectIssueId)
          if(!projectIssue) {
               throw Err.Project.ProjectIssue.projectIssueNotFound
          }
          let ret=await projectIssue.actionsInfo()
          return ret
     }
     @DHttpApi(projectIssueApi.routes.commentList)
     async commentList(@DHttpReqParamRequired("projectIssueId") projectIssueId :string):Promise<typeof projectIssueApi.routes.commentList.res> {
          let commentList=await rpcContentApi.list(projectIssueId,ECommon_Model_Content_Type.PROJECT_ISSUE_COMMENT)
          return commentList
     }
     @DHttpApi(projectIssueApi.routes.commentCreate)
     async commentCreate(@DHttpReqParamRequired("projectIssueId") projectIssueId :string,@DHttpReqParamRequired("content") content :string,@DHttpUser user:IUserSession):Promise<typeof projectIssueApi.routes.commentCreate.res> {
         let ret=await rpcContentApi.add(projectIssueId,ECommon_Model_Content_Type.PROJECT_ISSUE_COMMENT,user.organizationInfo.organizationUserId,content)
          rpcNotificationApi.createNotification(ECommon_Model_Notification_Type.ISSUE_COMMENT_ADD,projectIssueId,null,user.organizationInfo.organizationUserId)
         return ret;
     }
     @DHttpApi(projectIssueApi.routes.commentEdit)
     async commentEdit(@DHttpReqParamRequired("contentId") contentId :string,@DHttpReqParamRequired("content") content :string,@DHttpUser user:IUserSession):Promise<typeof projectIssueApi.routes.commentEdit.res> {
          let ret=await rpcContentApi.edit(contentId,user.organizationInfo.organizationUserId,content)
          return ret;
     }
     @DHttpApi(projectIssueApi.routes.commentRemove)
     async commentRemove(@DHttpReqParamRequired("contentId") contentId :string):Promise<typeof projectIssueApi.routes.commentRemove.res> {
          await rpcContentApi.remove(contentId)
          return
     }
     @DHttpApi(projectIssueApi.routes.copy)
     async copy(@DHttpReqParamRequired("projectIssueId") projectIssueId :string,@DHttpUser user:IUserSession):Promise<typeof projectIssueApi.routes.copy.res> {
          let projectIssue=await ProjectIssueService.getItemById(projectIssueId)
          if(!projectIssue) {
               throw Err.Project.ProjectIssue.projectIssueNotFound
          }
          let ret=await projectIssue.copy()
          if(ret.getItem().assigner_id) {
               rpcNotificationApi.createNotification(ECommon_Model_Notification_Type.ISSUE_ASSIGNER_ASSIGN,ret.getId(),ret.getItem().assigner_id,user.organizationInfo.organizationUserId)
          }
          if(ret.getItem().reporter_id) {
               rpcNotificationApi.createNotification(ECommon_Model_Notification_Type.ISSUE_REPORTER_ASSIGN,ret.getId(),ret.getItem().reporter_id,user.organizationInfo.organizationUserId)
          }
          return ret.getItem()
     }
     @DHttpApi(projectIssueApi.routes.addChildIssue)
     async addChildIssue(@DHttpReqParamRequired("projectIssueId") projectIssueId :string,@DHttpReqParamRequired("projectIssueChildId") projectIssueChildId :string):Promise<typeof projectIssueApi.routes.addChildIssue.res> {
          let projectIssue=await ProjectIssueService.getItemById(projectIssueId)
          if(!projectIssue) {
               throw Err.Project.ProjectIssue.projectIssueNotFound
          }
          await projectIssue.addChildIssue(projectIssueChildId)
          return;
     }
     @DHttpApi(projectIssueApi.routes.removeChildIssue)
     async removeChildIssue(@DHttpReqParamRequired("projectIssueId") projectIssueId :string,@DHttpReqParamRequired("projectIssueChildId") projectIssueChildId :string):Promise<typeof projectIssueApi.routes.removeChildIssue.res> {
          let projectIssue=await ProjectIssueService.getItemById(projectIssueId)
          if(!projectIssue) {
               throw Err.Project.ProjectIssue.projectIssueNotFound
          }
          await projectIssue.removeChildIssue(projectIssueChildId)
          return;
     }
     @DHttpApi(projectIssueApi.routes.addParentIssue)
     async addParentIssue(@DHttpReqParamRequired("projectIssueId") projectIssueId :string,@DHttpReqParamRequired("projectIssueParentId") projectIssueParentId :string):Promise<typeof projectIssueApi.routes.addParentIssue.res> {
          let projectIssue=await ProjectIssueService.getItemById(projectIssueId)
          if(!projectIssue) {
               throw Err.Project.ProjectIssue.projectIssueNotFound
          }
          await projectIssue.addParentIssue(projectIssueParentId)
          return;
     }
     @DHttpApi(projectIssueApi.routes.removeParentIssue)
     async removeParentIssue(@DHttpReqParamRequired("projectIssueId") projectIssueId :string,@DHttpReqParamRequired("projectIssueParentId") projectIssueParentId :string):Promise<typeof projectIssueApi.routes.removeParentIssue.res> {
          let projectIssue=await ProjectIssueService.getItemById(projectIssueId)
          if(!projectIssue) {
               throw Err.Project.ProjectIssue.projectIssueNotFound
          }
          await projectIssue.removeParentIssue(projectIssueParentId)
          return;
     }
     @DHttpApi(projectIssueApi.routes.addRelatedIssue)
     async addRelatedIssue(@DHttpReqParamRequired("projectIssueId") projectIssueId :string,@DHttpReqParamRequired("projectIssueRelatedId") projectIssueRelatedId :string):Promise<typeof projectIssueApi.routes.addRelatedIssue.res> {
          let projectIssue=await ProjectIssueService.getItemById(projectIssueId)
          if(!projectIssue) {
               throw Err.Project.ProjectIssue.projectIssueNotFound
          }
          await projectIssue.addRelatedIssue(projectIssueRelatedId)
          return;
     }
     @DHttpApi(projectIssueApi.routes.removeRelatedIssue)
     async removeRelatedIssue(@DHttpReqParamRequired("projectIssueId") projectIssueId :string,@DHttpReqParamRequired("projectIssueRelatedId") projectIssueRelatedId :string):Promise<typeof projectIssueApi.routes.removeRelatedIssue.res> {
          let projectIssue=await ProjectIssueService.getItemById(projectIssueId)
          if(!projectIssue) {
               throw Err.Project.ProjectIssue.projectIssueNotFound
          }
          await projectIssue.removeRelatedIssue(projectIssueRelatedId)
          return;
     }
     @DHttpApi(projectIssueApi.routes.otherInfoList)
     async otherInfoList(@DHttpReqParamRequired("projectIssueId") projectIssueId :string):Promise<typeof projectIssueApi.routes.otherInfoList.res> {
          let projectIssue=await ProjectIssueService.getItemById(projectIssueId)
          if(!projectIssue) {
               throw Err.Project.ProjectIssue.projectIssueNotFound
          }
          let ret=await projectIssue.otherInfoList()
          return ret;
     }
     @DHttpApi(projectIssueApi.routes.bindLabel)
     async bindTag(@DHttpReqParamRequired("projectIssueId") projectIssueId :string,@DHttpReqParamRequired("labelIds") labelIds :string[]):Promise<typeof projectIssueApi.routes.bindLabel.res> {
          let projectIssue=await ProjectIssueService.getItemById(projectIssueId)
          if(!projectIssue) {
               throw Err.Project.ProjectIssue.projectIssueNotFound
          }
          let ret=await projectIssue.bindLabels(labelIds)
          return ret;
     }
     @DHttpApi(projectIssueApi.routes.bindModule)
     async bindModule(@DHttpReqParamRequired("projectIssueId") projectIssueId :string,@DHttpReqParam("moduleId") moduleId :string):Promise<typeof projectIssueApi.routes.bindModule.res> {
          let projectIssue=await ProjectIssueService.getItemById(projectIssueId)
          if(!projectIssue) {
               throw Err.Project.ProjectIssue.projectIssueNotFound
          }
          let ret=await projectIssue.bindModule(moduleId)
          return ret;
     }

     @DHttpApi(projectIssueApi.routes.filter)
     async filter(@DHttpReqParam("projectId") projectId :string,
     @DHttpReqParam("createdBy") createdBy :string,
     @DHttpReqParam("issueTypeId") issueTypeId :string,
     @DHttpReqParam("name") name :string,
     @DHttpReqParam("priority") priority :number,
     @DHttpReqParam("assignerId") assignerId :string,
     @DHttpReqParam("reporterId") reporterId :string,
     @DHttpReqParam("status") status :number,
     @DHttpReqParam("moduleId") moduleId :string,
     @DHttpReqParam("labelId") labelId :string,
     @DHttpReqParamRequired("page") page :number,
     @DHttpReqParamRequired("size") size :number,@DHttpUser user:IUserSession):Promise<typeof projectIssueApi.routes.filter.res> {
          let ret=await ProjectIssueService.filter(user.organizationInfo.organizationId,projectId ,page ,size ,createdBy ,issueTypeId,name,priority,assignerId,reporterId,status,moduleId,labelId)
          return ret;
     }

     @DHttpApi(projectIssueApi.routes.releaseList)
     async releaseList(@DHttpReqParamRequired("projectIssueId") projectIssueId :string):Promise<typeof projectIssueApi.routes.releaseList.res> {
          let projectIssue=await ProjectIssueService.getItemById(projectIssueId)
          if(!projectIssue) {
               throw Err.Project.ProjectIssue.projectIssueNotFound
          }
          let ret=await projectIssue.releaseList()
          return ret;
     }

     @DHttpApi(projectIssueApi.routes.bindReleases)
     async bindReleases(@DHttpReqParamRequired("projectIssueId") projectIssueId :string,@DHttpReqParamRequired("projectReleaseIds") projectReleaseIds :string[]):Promise<typeof projectIssueApi.routes.bindReleases.res> {
          let projectIssue=await ProjectIssueService.getItemById(projectIssueId)
          if(!projectIssue) {
               throw Err.Project.ProjectIssue.projectIssueNotFound
          }
          let ret=await projectIssue.bindReleases(projectReleaseIds)
          return ret;
     }

}