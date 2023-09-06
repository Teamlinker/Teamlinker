import {DComponent} from "../../common/decorate/component";
import {DHttpApi, DHttpController, DHttpReqParam, DHttpReqParamRequired, DHttpUser} from "../../common/http/http";
import toolApi from "../../../common/routes/tool";
import {IUserSession} from "../types/config";
import {PhotoService, StickyNoteService} from "../service/tool";
import {Err} from "../../../common/status/error";
import rpcFileApi from "../../file/rpc/file"

@DComponent
@DHttpController(toolApi)
class ToolController {
    @DHttpApi(toolApi.routes.addNote)
    async addNote(@DHttpReqParamRequired("x") x:string,@DHttpReqParamRequired("y") y:string,@DHttpReqParamRequired("width") width:string,@DHttpReqParamRequired("height") height:string,@DHttpUser user: IUserSession): Promise<typeof toolApi.routes.addNote.res> {
        let obj=new StickyNoteService()
        obj.assignItem({
            height,
            y: y,
            x: x,
            width,
            user_id:user.userId
        })
        let ret=await obj.create()
        return ret
    }

    @DHttpApi(toolApi.routes.editNote)
    async editNote(@DHttpReqParamRequired("noteId") noteId:string,@DHttpReqParam("content") content:string,@DHttpReqParam("x") x:string,@DHttpReqParam("y") y:string,@DHttpReqParam("width") width:string,@DHttpReqParam("height") height:string,@DHttpUser user: IUserSession): Promise<typeof toolApi.routes.editNote.res> {
        let obj=await StickyNoteService.getItemById(noteId)
        if(!obj) {
            throw Err.User.Tool.StickyNote.noteNotFound
        }
        obj.assignItem({
            x: x,
            y: y,
            width,
            height
        })
        let ret=await obj.update(content)
        return ret;
    }

    @DHttpApi(toolApi.routes.removeNote)
    async removeNote(@DHttpReqParamRequired("noteId") noteId:string,@DHttpUser user: IUserSession): Promise<typeof toolApi.routes.removeNote.res> {
        let obj=await StickyNoteService.getItemById(noteId)
        if(!obj) {
            throw Err.User.Tool.StickyNote.noteNotFound
        }
        await obj.delete()
        return
    }

    @DHttpApi(toolApi.routes.listNote)
    async listNote(@DHttpUser user: IUserSession): Promise<typeof toolApi.routes.listNote.res> {
        let ret=await StickyNoteService.list(user.userId)
        return ret;
    }

    @DHttpApi(toolApi.routes.addPhoto)
    async addPhoto(@DHttpReqParam("fileId") fileId:string,@DHttpReqParamRequired("x") x:string,@DHttpReqParamRequired("y") y:string,@DHttpReqParamRequired("width") width:string,@DHttpReqParamRequired("height") height:string,@DHttpUser user: IUserSession): Promise<typeof toolApi.routes.addPhoto.res> {
        let obj=new PhotoService
        obj.assignItem({
            height,
            y,
            width,
            x,
            user_id:user.userId,
            file_id:fileId
        })
        let ret=await obj.create()
        return ret;
    }

    @DHttpApi(toolApi.routes.editPhoto)
    async editPhoto(@DHttpReqParamRequired("photoId") photoId:string,@DHttpReqParam("fileId") fileId:string,@DHttpReqParam("x") x:string,@DHttpReqParam("y") y:string,@DHttpReqParam("width") width:string,@DHttpReqParam("height") height:string,@DHttpUser user: IUserSession): Promise<typeof toolApi.routes.editPhoto.res> {
        let obj=await PhotoService.getItemById(photoId)
        if(!obj) {
            throw Err.User.Tool.Photo.photoNotFound
        }
        obj.assignItem({
            height,
            y,
            width,
            file_id:fileId,
            x
        })
        let ret=await obj.update()
        return {
            ...ret,
            path:await rpcFileApi.getPath(ret.file_id)
        };
    }

    @DHttpApi(toolApi.routes.removePhoto)
    async removePhoto(@DHttpReqParamRequired("photoId") photoId:string,@DHttpUser user: IUserSession): Promise<typeof toolApi.routes.removePhoto.res> {
        let obj=await PhotoService.getItemById(photoId)
        if(!obj) {
            throw Err.User.Tool.Photo.photoNotFound
        }
        await obj.delete()
        return
    }

    @DHttpApi(toolApi.routes.listPhoto)
    async listPhoto(@DHttpUser user: IUserSession): Promise<typeof toolApi.routes.listPhoto.res> {
        let ret=await PhotoService.list(user.userId)
        return ret;
    }
}