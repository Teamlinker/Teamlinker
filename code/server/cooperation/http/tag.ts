import * as projectApi from "../../../common/routes/project";
import { DComponent } from "../../common/decorate/component";
import { DHttpApi, DHttpReqParam, DHttpReqParamRequired } from "../../common/http/http";
import TagService from "../service/tag";

@DComponent
class TagController {
     @DHttpApi(projectApi.routes.listTag)
     async listTag(@DHttpReqParamRequired("projectId") projectId:string,@DHttpReqParamRequired("page") page:number,@DHttpReqParamRequired("size") size:number,@DHttpReqParam("keyword") keyword:string):Promise<typeof projectApi.routes.listTag.res> {
         let tag=new TagService()
         tag.assignItem({
              project_id:projectId
         })
         let ret=await tag.listTag(page,size,keyword);
         return ret;
     }
     @DHttpApi(projectApi.routes.createTag)
     async createTag(@DHttpReqParamRequired("projectId") projectId:string,@DHttpReqParamRequired("name") name:string):Promise<typeof projectApi.routes.createTag.res>{
          let tag=new TagService()
          tag.assignItem({
               project_id:projectId,
               name:name
          })
          let ret= await tag.create();
          return ret;
     }
     @DHttpApi(projectApi.routes.editTag)
     async editTag(@DHttpReqParamRequired("tagId") tagId:string,@DHttpReqParamRequired("name") name:string):Promise<typeof projectApi.routes.editTag.res>{
          let tag=new TagService()
          tag.assignItem({
               id:tagId,
               name:name
          })
          let ret= await tag.update();
          return ret;
     }
     @DHttpApi(projectApi.routes.removeTag)
     async removeTag(@DHttpReqParamRequired("tagId") tagId:string):Promise<typeof projectApi.routes.removeTag.res>{
          let tag=new TagService()
          tag.assignItem({
               id:tagId
          })
          await tag.delete();
          return
     }
     
}