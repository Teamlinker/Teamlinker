import {ECommon_Model_File_Type} from '../../../common/model/file';
import fileApi from "../../../common/routes/file";
import {Err} from '../../../common/status/error';
import {DComponent} from "../../common/decorate/component";
import {DHttpApi, DHttpController, DHttpReqParamRequired, DHttpUser} from "../../common/http/http";
import {IServer_Common_Http_Req_File} from "../../common/types/http";
import FileService from "../service/file";
import {IUserSession} from "../../user/types/config";

@DComponent
@DHttpController(fileApi)
class AdminController {
    @DHttpApi(fileApi.routes.upload)
    async upload(@DHttpReqParamRequired("file") file:IServer_Common_Http_Req_File,@DHttpUser user:IUserSession):Promise<typeof fileApi.routes.upload.res>{
        let obj=await FileService.getItemByMd5(file.md5)
        if(obj) {
            return {
                id:obj.getItem().id
            }
        } else {
            let objFile=new FileService()
            objFile.assignItem({
                created_by:user.organizationInfo.organizationUserId,
                size:file.size,
                filename:file.fileName,
                type:ECommon_Model_File_Type.LOCAL,
                md5:file.md5
            })
            let ret=await objFile.upload(file.data)
            return {
                id:ret
            }
        }
    }
    @DHttpApi(fileApi.routes.getPath)
    async getPath(@DHttpReqParamRequired("fileId") fileId:string):Promise<typeof fileApi.routes.getPath.res> {
        let obj=await FileService.getItemById(fileId)
        if(!obj) {
            throw Err.File.fileNotFound
        }
        return {
            uri:"/file"+obj.getItem().path
        }
    }
}