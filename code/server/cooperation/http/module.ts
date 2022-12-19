import projectApi from "../../../common/routes/project";
import {DComponent} from "../../common/decorate/component";
import {DHttpApi, DHttpController, DHttpReqParam, DHttpReqParamRequired} from "../../common/http/http";
import {ProjectModuleService} from "../service/module";

@DComponent
@DHttpController(projectApi)
class ModuleController {
     @DHttpApi(projectApi.routes.listModule)
     async listModule(@DHttpReqParamRequired("projectId") projectId:string):Promise<typeof projectApi.routes.listModule.res> {
         let module=new ProjectModuleService()
         module.assignItem({
              project_id:projectId
         })
         let ret=await module.listModule();
         return ret;
     }
     @DHttpApi(projectApi.routes.createModule)
     async createModule(@DHttpReqParamRequired("projectId") projectId:string,@DHttpReqParamRequired("name") name:string,@DHttpReqParam("parentModuleId") parentModuleId:string):Promise<typeof projectApi.routes.createModule.res>{
          let module=new ProjectModuleService()
          module.assignItem({
               project_id:projectId,
               name:name,
               parent_module_id:parentModuleId??null
          })
          let ret= await module.create();
          return ret;
     }
     @DHttpApi(projectApi.routes.editModule)
     async editModule(@DHttpReqParam("name") name:string,@DHttpReqParam("parentModuleId") parentModuleId:string,@DHttpReqParamRequired("moduleId") moduleId:string):Promise<typeof projectApi.routes.editModule.res>{
          let module=new ProjectModuleService()
          module.assignItem({
               id:moduleId,
               name:name,
               parent_module_id:parentModuleId?parentModuleId:(parentModuleId===""?null:undefined)
          })
          let ret= await module.update();
          return ret;
     }
     @DHttpApi(projectApi.routes.removeModule)
     async removeModule(@DHttpReqParamRequired("moduleId") moduleId:string):Promise<typeof projectApi.routes.removeModule.res>{
          let module=new ProjectModuleService()
          module.assignItem({
               id:moduleId
          })
          await module.delete();
          return
     }
     
}