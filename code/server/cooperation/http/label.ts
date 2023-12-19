import projectApi from "../../../common/routes/project";
import {DComponent} from "../../common/decorate/component";
import {DHttpApi, DHttpController, DHttpReqParam, DHttpReqParamRequired} from "../../common/http/http";
import {ProjectLabelService} from "../service/label";
import {Err} from "../../../common/status/error";

@DComponent
@DHttpController(projectApi)
class TagController {
     @DHttpApi(projectApi.routes.getLabel)
     async getLabel(@DHttpReqParamRequired("labelId") labelId:string):Promise<typeof projectApi.routes.getLabel.res> {
          let tag=await ProjectLabelService.getItemById(labelId)
          if(!tag) {
               throw Err.Project.Label.labelNotfound
          }
          return tag.getItem();
     }
     @DHttpApi(projectApi.routes.listLabel)
     async listTag(@DHttpReqParamRequired("projectId") projectId:string,@DHttpReqParamRequired("page") page:number,@DHttpReqParamRequired("size") size:number,@DHttpReqParam("keyword") keyword:string):Promise<typeof projectApi.routes.listLabel.res> {
         let tag=new ProjectLabelService()
         tag.assignItem({
              project_id:projectId
         })
         let ret=await tag.listTag(page,size,keyword);
         return ret;
     }
     @DHttpApi(projectApi.routes.createLabel)
     async createTag(@DHttpReqParamRequired("projectId") projectId:string,@DHttpReqParamRequired("name") name:string):Promise<typeof projectApi.routes.createLabel.res>{
          let tag=new ProjectLabelService()
          tag.assignItem({
               project_id:projectId,
               name:name
          })
          let ret= await tag.create();
          return ret;
     }
     @DHttpApi(projectApi.routes.editLabel)
     async editTag(@DHttpReqParamRequired("labelId") labelId:string,@DHttpReqParamRequired("name") name:string):Promise<typeof projectApi.routes.editLabel.res>{
          let tag=new ProjectLabelService()
          tag.assignItem({
               id:labelId,
               name:name
          })
          let ret= await tag.update();
          return ret;
     }
     @DHttpApi(projectApi.routes.removeLabel)
     async removeTag(@DHttpReqParamRequired("labelId") labelId:string):Promise<typeof projectApi.routes.removeLabel.res>{
          let tag=new ProjectLabelService()
          tag.assignItem({
               id:labelId
          })
          await tag.delete();
          return
     }
     
}