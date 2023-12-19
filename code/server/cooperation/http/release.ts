import {ECommon_Model_Project_Release_Status} from "../../../common/model/project_release";
import releaseApi from "../../../common/routes/release";
import {Err} from "../../../common/status/error";
import {DComponent} from "../../common/decorate/component";
import {DHttpApi, DHttpController, DHttpReqParam, DHttpReqParamRequired, DHttpUser} from "../../common/http/http";
import {ProjectReleaseService} from './../service/release';
import {IUserSession} from "../../user/types/config";
import rpcNotificationApi from "../../notification/rpc/notification";
import {ECommon_Model_Notification_Type} from "../../../common/model/notification";

@DComponent
@DHttpController(releaseApi)
class ReleaseController {
     @DHttpApi(releaseApi.routes.list)
     async list(@DHttpReqParam("projectId") projectId:string,@DHttpReqParam("projectReleaseIds") projectReleaseIds:string[],@DHttpReqParamRequired("page") page:number,@DHttpReqParamRequired("size") size:number,@DHttpReqParam("name") name:string,@DHttpReqParam("status") status:ECommon_Model_Project_Release_Status,@DHttpUser user:IUserSession):Promise<typeof releaseApi.routes.list.res> {
         let list=await ProjectReleaseService.list(user.organizationInfo.organizationId,projectId,page,size,name,status,projectReleaseIds)
         return list;
     }
     @DHttpApi(releaseApi.routes.info)
     async info(@DHttpReqParamRequired("projectReleaseId") projectReleaseId:string):Promise<typeof releaseApi.routes.info.res> {
         let obj=await ProjectReleaseService.getItemById(projectReleaseId)
         if(!obj) {
             throw Err.Project.Release.releaseNotFound
         }
         let ret=await obj.info()
         return ret;
     }
     @DHttpApi(releaseApi.routes.create)
     async create(@DHttpReqParamRequired("projectId") projectId:string,@DHttpReqParamRequired("name") name:string,@DHttpReqParam("start_time") start_time:string,@DHttpReqParam("release_time") release_time:string,@DHttpReqParam("description") description:string,@DHttpUser user:IUserSession):Promise<typeof releaseApi.routes.create.res> {
         let obj=new ProjectReleaseService()
         obj.assignItem({
             project_id:projectId,
             name,
             start_time,
             release_time,
             description,
             created_by:user.organizationInfo.organizationUserId
         })
         let ret=await obj.create()
         return ret
     }
     @DHttpApi(releaseApi.routes.edit)
     async edit(@DHttpReqParamRequired("projectReleaseId") projectReleaseId:string,@DHttpReqParam("name") name:string,@DHttpReqParam("start_time") start_time:string,@DHttpReqParam("release_time") release_time:string,@DHttpReqParam("description") description:string):Promise<typeof releaseApi.routes.edit.res> {
         let obj=await ProjectReleaseService.getItemById(projectReleaseId)
         if(!obj) {
            throw Err.Project.Release.releaseNotFound
        }
        obj.assignItem({
            name,
            start_time,
            release_time,description
        })
        let ret=await obj.update()
        return ret;
     }
     @DHttpApi(releaseApi.routes.remove)
     async remove(@DHttpReqParamRequired("projectReleaseId") projectReleaseId:string):Promise<typeof releaseApi.routes.remove.res> {
        let obj=await ProjectReleaseService.getItemById(projectReleaseId)
        if(!obj) {
           throw Err.Project.Release.releaseNotFound
        }
        await obj.delete()
        return;
     }
     @DHttpApi(releaseApi.routes.addIssue)
     async addIssue(@DHttpReqParamRequired("projectReleaseId") projectReleaseId:string,@DHttpReqParamRequired("projectIssueId") projectIssueId:string,@DHttpUser user:IUserSession):Promise<typeof releaseApi.routes.addIssue.res> {
        let obj=await ProjectReleaseService.getItemById(projectReleaseId)
        if(!obj) {
           throw Err.Project.Release.releaseNotFound
        }
        await obj.addIssue(projectIssueId,user.organizationInfo.organizationUserId)
         rpcNotificationApi.createNotification(ECommon_Model_Notification_Type.ISSUE_ASSIGN_RELEASE,projectIssueId,null,user.organizationInfo.organizationUserId)
        return;
     }
     @DHttpApi(releaseApi.routes.removeIssue)
     async removeIssue(@DHttpReqParamRequired("projectReleaseId") projectReleaseId:string,@DHttpReqParamRequired("projectIssueId") projectIssueId:string,@DHttpUser user:IUserSession):Promise<typeof releaseApi.routes.removeIssue.res> {
        let obj=await ProjectReleaseService.getItemById(projectReleaseId)
        if(!obj) {
           throw Err.Project.Release.releaseNotFound
        }
        await obj.removeIssue(projectIssueId,user.organizationInfo.organizationUserId)
        return;
     }
     @DHttpApi(releaseApi.routes.checkIfCanRelease)
     async checkIfCanRelease(@DHttpReqParamRequired("projectReleaseId") projectReleaseId:string):Promise<typeof releaseApi.routes.checkIfCanRelease.res> {
        let obj=await ProjectReleaseService.getItemById(projectReleaseId)
        if(!obj) {
           throw Err.Project.Release.releaseNotFound
        }
        let ret=await obj.checkIfCanRelease()
        return ret;
     }
     @DHttpApi(releaseApi.routes.changeStatus)
     async changeStatus(@DHttpReqParamRequired("projectReleaseId") projectReleaseId:string,@DHttpReqParamRequired("status") status:ECommon_Model_Project_Release_Status):Promise<typeof releaseApi.routes.changeStatus.res> {
        let obj=await ProjectReleaseService.getItemById(projectReleaseId)
        if(!obj) {
           throw Err.Project.Release.releaseNotFound
       }
       obj.assignItem({
           status
       })
       let ret=await obj.update()
       return ret;
     }

    @DHttpApi(releaseApi.routes.globalSearchRelease)
    async globalSearchRelease(@DHttpReqParamRequired("keyword") keyword: string,@DHttpReqParamRequired("size") size: number,@DHttpUser user:IUserSession):Promise<typeof releaseApi.routes.globalSearchRelease.res> {
        let ret=await ProjectReleaseService.globalSearch(keyword,size,user.organizationInfo.organizationUserId)
        return ret;
    }
}