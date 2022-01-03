import * as issueTypeApi from "../../../common/routes/issueType";
import { Err } from "../../../common/status/error";
import { DComponent } from "../../common/decorate/component";
import { DHttpApi, DHttpController, DHttpReqParam, DHttpReqParamRequired } from "../../common/http/http";
import IssueTypeService, { IssueTypeSolutionService } from "../service/issueType";
@DComponent
@DHttpController(issueTypeApi)
class IssueTypeController {
     @DHttpApi(issueTypeApi.routes.list)
     async list():Promise<typeof issueTypeApi.routes.list.res> {
         let ret=await IssueTypeService.list()
         return ret;
     }
     @DHttpApi(issueTypeApi.routes.info)
     async info(@DHttpReqParamRequired("issueTypeId") issueTypeId:string):Promise<typeof issueTypeApi.routes.info.res> {
         let ret=await IssueTypeService.getItemById(issueTypeId)
         if(!ret) {
            throw Err.Project.Issue.issueTypeNotFound
         }
         return ret.getItem();
     }

     @DHttpApi(issueTypeApi.routes.create)
     async create(@DHttpReqParamRequired("name") name:string,@DHttpReqParam("icon") icon:string,@DHttpReqParam("description") description:string):Promise<typeof issueTypeApi.routes.create.res> {
         let obj=new IssueTypeService()
         obj.assignItem({
             name,
             icon,
             description
         })
         let ret=await obj.create()
         return ret;
     }

     @DHttpApi(issueTypeApi.routes.update)
     async update(@DHttpReqParamRequired("issueTypeId") issueTypeId:string,@DHttpReqParam("name") name:string,@DHttpReqParam("icon") icon:string,@DHttpReqParam("description") description:string):Promise<typeof issueTypeApi.routes.update.res> {
         let obj=await IssueTypeService.getItemById(issueTypeId)
         if(!obj) {
             throw Err.Project.Issue.issueTypeNotFound
         }
         if(obj.getItem().reserved) {
             throw Err.Project.Issue.issueTypeForbidden
         }
         obj.assignItem({
             id:issueTypeId,
             name,
             icon,
             description
         },true)
         let ret=await obj.update()
         return ret;
     }

     @DHttpApi(issueTypeApi.routes.delete)
     async delete(@DHttpReqParamRequired("issueTypeId") issueTypeId:string,@DHttpReqParam("name") name:string,@DHttpReqParam("icon") icon:string,@DHttpReqParam("description") description:string):Promise<typeof issueTypeApi.routes.delete.res> {
         let obj=await IssueTypeService.getItemById(issueTypeId)
         if(!obj) {
             throw Err.Project.Issue.issueTypeNotFound
         }
         if(obj.getItem().reserved) {
             throw Err.Project.Issue.issueTypeForbidden
         }
         await obj.delete()
         return;
     }

     @DHttpApi(issueTypeApi.routes.solutionList)
     async solutionList():Promise<typeof issueTypeApi.routes.solutionList.res> {
         let ret=await IssueTypeSolutionService.list()
         return ret;
     }
     @DHttpApi(issueTypeApi.routes.solutionInfo)
     async solutionInfo(@DHttpReqParamRequired("issueTypeSolutionId") issueTypeSolutionId:string):Promise<typeof issueTypeApi.routes.solutionInfo.res> {
         let ret=await IssueTypeSolutionService.getInfoById(issueTypeSolutionId)
         return ret;
     }

     @DHttpApi(issueTypeApi.routes.solutionCreate)
     async solutionCreate(@DHttpReqParamRequired("name") name:string,@DHttpReqParam("description") description:string):Promise<typeof issueTypeApi.routes.solutionCreate.res> {
         let obj=new IssueTypeSolutionService()
         obj.assignItem({
             name,
             description
         })
         let ret=await obj.create()
         return ret;
     }

     @DHttpApi(issueTypeApi.routes.solutionUpdate)
     async solutionUpdate(@DHttpReqParamRequired("issueTypeSolutionId") issueTypeSolutionId:string,@DHttpReqParam("name") name:string,@DHttpReqParam("description") description:string):Promise<typeof issueTypeApi.routes.solutionUpdate.res> {
         let obj=await IssueTypeSolutionService.getItemById(issueTypeSolutionId)
         if(!obj) {
             throw Err.Project.Issue.issueTypeNotFound
         }
         if(obj.getItem().reserved) {
             throw Err.Project.Issue.issueTypeForbidden
         }
         obj.assignItem({
             id:issueTypeSolutionId,
             name,
             description
         },true)
         let ret=await obj.update()
         return ret;
     }

     @DHttpApi(issueTypeApi.routes.solutionDelete)
     async solutionDelete(@DHttpReqParamRequired("issueTypeSolutionId") issueTypeSolutionId:string):Promise<typeof issueTypeApi.routes.solutionDelete.res> {
         let obj=await IssueTypeService.getItemById(issueTypeSolutionId)
         if(!obj) {
             throw Err.Project.Issue.issueTypeNotFound
         }
         if(obj.getItem().reserved) {
             throw Err.Project.Issue.issueTypeForbidden
         }
         await obj.delete()
         return;
     }
     
}