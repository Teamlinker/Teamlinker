import { ECommon_Model_Comment_Type } from "../../../common/model/comment";
import projectIssueApi from "../../../common/routes/issue";
import { ICommon_Route_Req_ProjectIssue_Field } from "../../../common/routes/response";
import { Err } from "../../../common/status/error";
import { DComponent } from "../../common/decorate/component";
import { DHttpApi, DHttpController, DHttpReqParam, DHttpReqParamRequired, DHttpUser } from "../../common/http/http";
import ProjectIssueService from "../service/issue";
import ProjectService from "../service/project";
import { IUserSession } from './../../common/rpc/api/user';
import { CommentService } from './../service/comment';
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
              created_by:user.userId
         })
         let obj=await projectIssue.create()
         projectIssue.assignItem(obj,true);
         await projectIssue.createFieldValues(values)
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
     @DHttpReqParam("values")     values:ICommon_Route_Req_ProjectIssue_Field[]):Promise<typeof projectIssueApi.routes.confirmNextNode.res> {
          let projectIssue=await ProjectIssueService.getItemById(projectIssueId)
          if(!projectIssue) {
               throw Err.Project.ProjectIssue.projectIssueNotFound
          }
          await projectIssue.confirmNextNode(workflowActionId,values)
          return
     }
     @DHttpApi(projectIssueApi.routes.editExtraField)
     async editExtraField(@DHttpReqParamRequired("projectIssueId") projectIssueId :string ,
     @DHttpReqParam("value")     value:ICommon_Route_Req_ProjectIssue_Field):Promise<typeof projectIssueApi.routes.editExtraField.res> {
          let projectIssue=await ProjectIssueService.getItemById(projectIssueId)
          if(!projectIssue) {
               throw Err.Project.ProjectIssue.projectIssueNotFound
          }
          await projectIssue.updateFieldValue(value)
          return;
     }
     @DHttpApi(projectIssueApi.routes.editBasicField)
     async editBasicField(@DHttpReqParamRequired("projectIssueId") projectIssueId :string ,
     @DHttpReqParam("name")     name :string,
     @DHttpReqParam("priority")     priority :number,
     @DHttpReqParam("assignerId")     assignerId :string ,
     @DHttpReqParam("reporterId")     reporterId :string):Promise<typeof projectIssueApi.routes.editBasicField.res> {
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
          return ret;
     }
     @DHttpApi(projectIssueApi.routes.editDescription)
     async editDescription(@DHttpReqParamRequired("projectIssueId") projectIssueId :string ,
     @DHttpReqParamRequired("description")     description :string):Promise<typeof projectIssueApi.routes.editDescription.res> {
          let projectIssue=await ProjectIssueService.getItemById(projectIssueId)
          if(!projectIssue) {
               throw Err.Project.ProjectIssue.projectIssueNotFound
          }
          await projectIssue.editDescription(description)
          return;
     }
     @DHttpApi(projectIssueApi.routes.remove)
     async remove(@DHttpReqParamRequired("projectIssueId") projectIssueId :string ):Promise<typeof projectIssueApi.routes.remove.res> {
          let projectIssue=await ProjectIssueService.getItemById(projectIssueId)
          if(!projectIssue) {
               throw Err.Project.ProjectIssue.projectIssueNotFound
          }
          await projectIssue.delete()
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
          let commentList=await CommentService.list(projectIssueId)
          return commentList
     }
     @DHttpApi(projectIssueApi.routes.commentCreate)
     async commentCreate(@DHttpReqParamRequired("projectIssueId") projectIssueId :string,@DHttpReqParamRequired("content") content :string,@DHttpUser user:IUserSession):Promise<typeof projectIssueApi.routes.commentCreate.res> {
         let comment=new CommentService
         comment.assignItem({
              type:ECommon_Model_Comment_Type.PROJECT,
              type_id:projectIssueId,
              content:content,
              created_by:user.userId
         })
         let ret=await comment.create()
         return ret;
     }
     @DHttpApi(projectIssueApi.routes.commentEdit)
     async commentEdit(@DHttpReqParamRequired("commentId") commentId :string,@DHttpReqParamRequired("content") content :string):Promise<typeof projectIssueApi.routes.commentEdit.res> {
          let comment=await CommentService.getItemById(commentId)
          if(!comment) {
               throw Err.Comment.commentNotFound
          }
          comment.assignItem({
               content
          })
          let ret=await comment.update()
          return ret;
     }
     @DHttpApi(projectIssueApi.routes.commentRemove)
     async commentRemove(@DHttpReqParamRequired("commentId") commentId :string):Promise<typeof projectIssueApi.routes.commentRemove.res> {
          let comment=await CommentService.getItemById(commentId)
          if(!comment) {
               throw Err.Comment.commentNotFound
          }
          await comment.delete()
          return
     }
     @DHttpApi(projectIssueApi.routes.copy)
     async copy(@DHttpReqParamRequired("projectIssueId") projectIssueId :string):Promise<typeof projectIssueApi.routes.copy.res> {
          let projectIssue=await ProjectIssueService.getItemById(projectIssueId)
          if(!projectIssue) {
               throw Err.Project.ProjectIssue.projectIssueNotFound
          }
          let ret=await projectIssue.copy()
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
     @DHttpApi(projectIssueApi.routes.bindTag)
     async bindTag(@DHttpReqParamRequired("projectIssueId") projectIssueId :string,@DHttpReqParamRequired("tagId") tagId :string):Promise<typeof projectIssueApi.routes.bindTag.res> {
          let projectIssue=await ProjectIssueService.getItemById(projectIssueId)
          if(!projectIssue) {
               throw Err.Project.ProjectIssue.projectIssueNotFound
          }
          await projectIssue.bindTag(tagId)
          return
     }
     @DHttpApi(projectIssueApi.routes.unbindTag)
     async unbindTag(@DHttpReqParamRequired("projectIssueId") projectIssueId :string,@DHttpReqParamRequired("tagId") tagId :string):Promise<typeof projectIssueApi.routes.unbindTag.res> {
          let projectIssue=await ProjectIssueService.getItemById(projectIssueId)
          if(!projectIssue) {
               throw Err.Project.ProjectIssue.projectIssueNotFound
          }
          await projectIssue.unbindTag(tagId)
          return
     }
     @DHttpApi(projectIssueApi.routes.bindModule)
     async bindModule(@DHttpReqParamRequired("projectIssueId") projectIssueId :string,@DHttpReqParamRequired("moduleId") moduleId :string):Promise<typeof projectIssueApi.routes.bindModule.res> {
          let projectIssue=await ProjectIssueService.getItemById(projectIssueId)
          if(!projectIssue) {
               throw Err.Project.ProjectIssue.projectIssueNotFound
          }
          await projectIssue.bindModule(moduleId)
          return
     }
     @DHttpApi(projectIssueApi.routes.unbindModule)
     async unbindModule(@DHttpReqParamRequired("projectIssueId") projectIssueId :string,@DHttpReqParamRequired("moduleId") moduleId :string):Promise<typeof projectIssueApi.routes.unbindModule.res> {
          let projectIssue=await ProjectIssueService.getItemById(projectIssueId)
          if(!projectIssue) {
               throw Err.Project.ProjectIssue.projectIssueNotFound
          }
          await projectIssue.unbindModule(moduleId)
          return
     }
     @DHttpApi(projectIssueApi.routes.filter)
     async filter(@DHttpReqParamRequired("projectId") projectId :string,
     @DHttpReqParam("createdBy") createdBy :string,
     @DHttpReqParam("issueTypeId") issueTypeId :string,
     @DHttpReqParam("name") name :string,
     @DHttpReqParam("priority") priority :number,
     @DHttpReqParam("assignerId") assignerId :string,
     @DHttpReqParam("reporterId") reporterId :string,
     @DHttpReqParam("status") status :number,
     @DHttpReqParam("moduleId") moduleId :string,
     @DHttpReqParam("tagId") tagId :string,
     @DHttpReqParamRequired("page") page :number,
     @DHttpReqParamRequired("size") size :number):Promise<typeof projectIssueApi.routes.filter.res> {
          let ret=await ProjectIssueService.filter(projectId ,page ,size ,createdBy ,issueTypeId,name,priority,assignerId,reporterId,status,moduleId,tagId)
          return ret;
     }

}