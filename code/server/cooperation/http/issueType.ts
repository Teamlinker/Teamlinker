import issueTypeApi from "../../../common/routes/issueType";
import {Err} from "../../../common/status/error";
import {DComponent} from "../../common/decorate/component";
import {DHttpApi, DHttpController, DHttpReqParam, DHttpReqParamRequired, DHttpUser} from "../../common/http/http";
import {IssueTypeService, IssueTypeSolutionService} from "../service/issueType";
import {IUserSession} from "../../user/types/config";
import {REDIS_USER} from "../../common/cache/keys/user";

@DComponent
@DHttpController(issueTypeApi)
class IssueTypeController {
     @DHttpApi(issueTypeApi.routes.list)
     async list(@DHttpReqParamRequired("issueTypeSolutionId") issueTypeSolutionId:string):Promise<typeof issueTypeApi.routes.list.res> {
         let ret=await IssueTypeService.list(issueTypeSolutionId)
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
     async create(@DHttpReqParamRequired("name") name:string,@DHttpReqParam("icon") icon:string,@DHttpReqParam("description") description:string,@DHttpReqParamRequired("issueTypeSolutionId") issueTypeSolutionId:string,@DHttpUser user:IUserSession):Promise<typeof issueTypeApi.routes.create.res> {
         let obj=new IssueTypeService()
         obj.assignItem({
             name,
             icon,
             description,
             issue_type_solution_id:issueTypeSolutionId
         })
         let objRedis=REDIS_USER.info(user.userId)
         let value=await objRedis.get()
         let ret=await obj.create(value.lang??"en")
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
         })
         let ret=await obj.update()
         return ret;
     }

     @DHttpApi(issueTypeApi.routes.delete)
     async delete(@DHttpReqParamRequired("issueTypeId") issueTypeId:string,@DHttpReqParamRequired("convertIssueTypeId") convertIssueTypeId:string):Promise<typeof issueTypeApi.routes.delete.res> {
         let [obj,objConvert]=await Promise.all([
             IssueTypeService.getItemById(issueTypeId),
             IssueTypeService.getItemById(convertIssueTypeId)
         ])
         if(!obj || !objConvert) {
             throw Err.Project.Issue.issueTypeNotFound
         } else if(obj.getItem().reserved) {
             throw Err.Project.Issue.issueTypeForbidden
         } else if(obj.getItem().issue_type_solution_id!==objConvert.getItem().issue_type_solution_id) {
             throw Err.Project.Issue.issueTypeSolutionNotSame
         }
         await obj.delete(null,convertIssueTypeId)
         return;
     }

     @DHttpApi(issueTypeApi.routes.solutionList)
     async solutionList(@DHttpUser user:IUserSession):Promise<typeof issueTypeApi.routes.solutionList.res> {
         let ret=await IssueTypeSolutionService.list(user.organizationInfo.organizationId)
         return ret;
     }
     @DHttpApi(issueTypeApi.routes.solutionInfo)
     async solutionInfo(@DHttpReqParamRequired("issueTypeSolutionId") issueTypeSolutionId:string):Promise<typeof issueTypeApi.routes.solutionInfo.res> {
         let ret=await IssueTypeSolutionService.getInfoById(issueTypeSolutionId)
         return ret;
     }

     @DHttpApi(issueTypeApi.routes.solutionCreate)
     async solutionCreate(@DHttpReqParamRequired("name") name:string,@DHttpReqParam("description") description:string,@DHttpUser user:IUserSession):Promise<typeof issueTypeApi.routes.solutionCreate.res> {
         let obj=new IssueTypeSolutionService()
         obj.assignItem({
             name,
             description,
             organization_id:user.organizationInfo.organizationId
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
         obj.assignItem({
             id:issueTypeSolutionId,
             name,
             description
         },true)
         let ret=await obj.update()
         return ret;
     }

     @DHttpApi(issueTypeApi.routes.solutionDelete)
     async solutionDelete(@DHttpReqParamRequired("issueTypeSolutionId") issueTypeSolutionId:string,@DHttpReqParam("relationship") relationship:{
         [id:string]:string
     }):Promise<typeof issueTypeApi.routes.solutionDelete.res> {
         let obj=await IssueTypeSolutionService.getItemById(issueTypeSolutionId)
         if(!obj) {
             throw Err.Project.Issue.issueTypeNotFound
         }
         if(obj.getItem().reserved) {
             throw Err.Project.Issue.issueTypeForbidden
         }
         await obj.delete(null,relationship)
         return;
     }

     @DHttpApi(issueTypeApi.routes.solutionBindProject)
     async solutionBindProject(@DHttpReqParamRequired("issueTypeSolutionId") issueTypeSolutionId:string,@DHttpReqParamRequired("projectId") projectId:string,@DHttpReqParam("relationship") relationship:{
         [id:string]:string
     }):Promise<typeof issueTypeApi.routes.solutionBindProject.res> {
         let [objIssueTypeSolution,objCurrentIssueTypeSolution]=await Promise.all([
             IssueTypeSolutionService.getItemById(issueTypeSolutionId),
             IssueTypeSolutionService.getObjByProjectId(projectId)
         ])
         if(!objIssueTypeSolution || !objCurrentIssueTypeSolution) {
            throw Err.Project.Issue.issueTypeSolutionNotFound
         } else if(objIssueTypeSolution.getId()===objCurrentIssueTypeSolution.getId()) {
             throw Err.Project.Issue.issueTypeSolutionSame
         }
         await objIssueTypeSolution.bindProject(projectId,relationship)
         return
     }

     @DHttpApi(issueTypeApi.routes.solutionUnbindProject)
     async solutionUnbindProject(@DHttpReqParamRequired("projectId") projectId:string,@DHttpReqParam("relationship") relationship:{
         [id:string]:string
     },@DHttpUser user:IUserSession):Promise<typeof issueTypeApi.routes.solutionUnbindProject.res> {
         let [objReversedIssueTypeSolution,objCurrentIssueTypeSolution]=await Promise.all([
             IssueTypeSolutionService.getReservedItem(user.organizationInfo.organizationId),
             IssueTypeSolutionService.getObjByProjectId(projectId)
         ])
         if(!objReversedIssueTypeSolution || !objCurrentIssueTypeSolution) {
             throw Err.Project.Issue.issueTypeSolutionNotFound
         } else if(objReversedIssueTypeSolution.getId()===objCurrentIssueTypeSolution.getId()) {
             throw Err.Project.Issue.issueTypeSolutionSame
         }
        await objCurrentIssueTypeSolution.unbindProject(projectId,relationship)
        return 
     }

     @DHttpApi(issueTypeApi.routes.solutionProjectList)
     async solutionProjectList(@DHttpReqParamRequired("issueTypeSolutionId") issueTypeSolutionId:string,@DHttpReqParamRequired("page") page:number,@DHttpReqParamRequired("size") size:number,@DHttpReqParam("keyword") keyword:string):Promise<typeof issueTypeApi.routes.solutionProjectList.res> {
        let obj=await IssueTypeSolutionService.getItemById(issueTypeSolutionId);
        if(!obj) {
            throw Err.Project.Issue.issueTypeSolutionNotFound
        }
        let ret=await obj.projectList(page,size,keyword)
        return ret
     }

    @DHttpApi(issueTypeApi.routes.copy)
    async copy(@DHttpReqParamRequired("issueTypeId") issueTypeId:string,@DHttpReqParamRequired("newIssueTypeSolutionId") newIssueTypeSolutionId:string,@DHttpReqParamRequired("name") name:string):Promise<typeof issueTypeApi.routes.copy.res> {
        let obj=await IssueTypeService.getItemById(issueTypeId);
        if(!obj) {
            throw Err.Project.Issue.issueTypeSolutionNotFound
        }
        let ret=await obj.copy(null,{
            issue_type_solution_id:newIssueTypeSolutionId
        })
        ret.assignItem({
            name:name
        })
        await ret.update();
        return ret.getItem();
    }

    @DHttpApi(issueTypeApi.routes.copySolution)
    async copySolution(@DHttpReqParamRequired("issueTypeSolutionId") issueTypeSolutionId:string,@DHttpReqParamRequired("name") name:string):Promise<typeof issueTypeApi.routes.copySolution.res> {
        let obj=await IssueTypeSolutionService.getItemById(issueTypeSolutionId);
        if(!obj) {
            throw Err.Project.Issue.issueTypeSolutionNotFound
        }
        let ret=await obj.copy(null,{
            organization_id:obj.getItem().organization_id
        })
        ret.assignItem({
            name:name
        })
        await ret.update();
        return ret.getItem();
    }

    @DHttpApi(issueTypeApi.routes.solutionInfoByProjectId)
    async solutionInfoByProjectId(@DHttpReqParamRequired("projectId") projectId:string):Promise<typeof issueTypeApi.routes.solutionInfoByProjectId.res> {
        let obj=await IssueTypeSolutionService.getObjByProjectId(projectId);
        if(!obj) {
            throw Err.Project.Issue.issueTypeSolutionNotFound
        }
        return obj.getItem();
    }

    @DHttpApi(issueTypeApi.routes.reserved)
    async reserved(@DHttpUser user:IUserSession):Promise<typeof issueTypeApi.routes.reserved.res> {
        let ret=await IssueTypeSolutionService.getReservedItem(user.organizationInfo.organizationId)
        return ret.getItem();
    }
}