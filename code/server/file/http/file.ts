import {ECommon_Model_File_Type} from '../../../common/model/file';
import fileApi from "../../../common/routes/file";
import {Err} from '../../../common/status/error';
import {DComponent} from "../../common/decorate/component";
import {DHttpApi, DHttpController, DHttpReqParam, DHttpReqParamRequired, DHttpUser} from "../../common/http/http";
import {IServer_Common_Http_Req_File} from "../../common/types/http";
import FileService from "../service/file";
import {IUserSession} from "../../user/types/config";
import {REDIS_FILE} from "../../common/cache/keys/file";
import {emitServiceEvent} from "../../common/event/event";

@DComponent
@DHttpController(fileApi)
class AdminController {
    @DHttpApi(fileApi.routes.upload)
    async upload(@DHttpReqParamRequired("file") file:IServer_Common_Http_Req_File,@DHttpReqParam("meta") meta:string,@DHttpUser user:IUserSession):Promise<typeof fileApi.routes.upload.res>{
        let obj=await FileService.getItemByMd5(file.md5)
        if(obj) {
            if(meta) {
                emitServiceEvent("fileUpload",meta,obj.getId())
            }
            return {
                id:obj.getItem().id,
                ...(meta && {
                    meta
                }),
                path:"/file"+obj.getItem().path
            }
        } else {
            let objFile=new FileService()
            objFile.assignItem({
                created_by_pure:user.userId,
                size:file.size,
                type:ECommon_Model_File_Type.LOCAL,
                md5:file.md5
            })
            let ret=await objFile.upload(file,meta)
            return {
                id:ret,
                ...(meta && {
                    meta
                }),
                path:"/file"+objFile.getItem().path
            }
        }
    }
    @DHttpApi(fileApi.routes.getPath)
    async getPath(@DHttpReqParamRequired("fileId") fileId:string):Promise<typeof fileApi.routes.getPath.res> {
        let path:string
        let objCache=REDIS_FILE.filePath(fileId)
        path=await objCache.get()
        if(!path) {
            let obj=await FileService.getItemById(fileId)
            if(!obj) {
                throw Err.File.fileNotFound
            } else {
                path=obj.getItem().path
            }
            await objCache.set(path)
        }
        return {
            uri:"/file"+path
        }
    }
}