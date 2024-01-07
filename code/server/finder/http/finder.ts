import {DComponent} from "../../common/decorate/component";
import {DHttpApi, DHttpController, DHttpReqParam, DHttpReqParamRequired, DHttpUser} from "../../common/http/http";
import finderApi from "../../../common/routes/finder";
import {FinderItemService} from "../service/finder";
import {Err} from "../../../common/status/error";
import {
    ECommon_Model_Finder_Item_Type,
    ECommon_Model_Finder_Shortcut_Type,
    ECommon_Model_Finder_Status
} from "../../../common/model/finder_item";
import {IUserSession} from "../../user/types/config";

@DComponent
@DHttpController(finderApi)
class FinderController {
    @DHttpApi(finderApi.routes.listChild)
    async listChild(@DHttpReqParam("folderId") folderId:string,@DHttpReqParamRequired("type") type:"all"|"folder",@DHttpUser user:IUserSession): Promise<typeof finderApi.routes.listChild.res> {
        let ret=await FinderItemService.listChild(folderId,type,user.userId)
        return ret;
    }

    @DHttpApi(finderApi.routes.createFile)
    async createFile(@DHttpReqParam("parentFolderId") parentFolderId:string,@DHttpReqParamRequired("name") name:string,@DHttpUser user:IUserSession): Promise<typeof finderApi.routes.createFile.res> {
        let obj=new FinderItemService()
        obj.assignItem({
            type:ECommon_Model_Finder_Item_Type.FILE,
            name,
            parent_folder_id:parentFolderId,
            created_by_pure:user.userId,
            status:ECommon_Model_Finder_Status.PROCESSING
        })
        let ret=await obj.create()
        return ret;
    }

    @DHttpApi(finderApi.routes.linkFile)
    async linkFile(@DHttpReqParamRequired("fileId") fileId:string,@DHttpReqParam("parentFolderId") parentFolderId:string,@DHttpReqParamRequired("name") name:string,@DHttpUser user:IUserSession): Promise<typeof finderApi.routes.linkFile.res> {
        let obj=new FinderItemService()
        obj.assignItem({
            file_id:fileId,
            type:ECommon_Model_Finder_Item_Type.FILE,
            name,
            parent_folder_id:parentFolderId,
            created_by_pure:user.userId
        })
        let ret=await obj.create()
        return ret;
    }

    @DHttpApi(finderApi.routes.createShortcut)
    async createShortcut(@DHttpReqParamRequired("itemId") itemId:string,@DHttpReqParam("parentFolderId") parentFolderId:string,@DHttpReqParamRequired("name") name:string,@DHttpReqParamRequired("shortcutType") shortcutType:ECommon_Model_Finder_Shortcut_Type,@DHttpUser user:IUserSession): Promise<typeof finderApi.routes.createShortcut.res> {
        let obj=new FinderItemService()
        obj.assignItem({
            ref_id:itemId,
            type:ECommon_Model_Finder_Item_Type.SHORTCUT,
            name,
            parent_folder_id:parentFolderId,
            created_by_pure:user.userId,
            shortcut_type:shortcutType
        })
        let ret=await obj.create()
        return ret;
    }

    @DHttpApi(finderApi.routes.createFolder)
    async createFolder(@DHttpReqParam("parentFolderId") parentFolderId:string,@DHttpReqParamRequired("name") name:string,@DHttpUser user:IUserSession): Promise<typeof finderApi.routes.createFolder.res> {
        let obj=new FinderItemService()
        obj.assignItem({
            type:ECommon_Model_Finder_Item_Type.FOLDER,
            name,
            parent_folder_id:parentFolderId,
            created_by_pure:user.userId
        })
        let ret=await obj.create()
        return ret;
    }

    @DHttpApi(finderApi.routes.copy)
    async copy(@DHttpReqParamRequired("finderItemId") finderItemId:string,@DHttpReqParam("destParentFolderId") destParentFolderId:string): Promise<typeof finderApi.routes.copy.res> {
        let obj=await FinderItemService.getItemById(finderItemId)
        if(!obj) {
            throw Err.Finder.itemNotFound
        }
        let objCopy=await obj.copy(null,{
            parent_folder_id:destParentFolderId?destParentFolderId:null
        })
        return objCopy.getItem();
    }

    @DHttpApi(finderApi.routes.move)
    async move(@DHttpReqParamRequired("finderItemId") finderItemId:string,@DHttpReqParam("destParentFolderId") destParentFolderId:string): Promise<typeof finderApi.routes.move.res> {
        let obj=await FinderItemService.getItemById(finderItemId)
        if(!obj) {
            throw Err.Finder.itemNotFound
        }
        let ret=await obj.move(destParentFolderId?destParentFolderId:null)
        return ret;
    }

    @DHttpApi(finderApi.routes.delete)
    async delete(@DHttpReqParamRequired("finderItemId") finderItemId:string): Promise<typeof finderApi.routes.delete.res> {
        let obj=await FinderItemService.getItemById(finderItemId)
        if(!obj) {
            throw Err.Finder.itemNotFound
        }
        await obj.delete()
        return
    }

    @DHttpApi(finderApi.routes.rename)
    async rename(@DHttpReqParamRequired("finderItemId") finderItemId:string,@DHttpReqParamRequired("name") name:string): Promise<typeof finderApi.routes.rename.res> {
        let obj=await FinderItemService.getItemById(finderItemId)
        if(!obj) {
            throw Err.Finder.itemNotFound
        }
        obj.assignItem({
            name
        })
        let ret=await obj.update()
        return ret;
    }

    @DHttpApi(finderApi.routes.info)
    async info(@DHttpReqParamRequired("finderItemId") finderItemId:string): Promise<typeof finderApi.routes.info.res> {
        let obj=await FinderItemService.getItemById(finderItemId)
        if(!obj) {
            throw Err.Finder.itemNotFound
        }
        let ret=await obj.info()
        return ret;
    }

    @DHttpApi(finderApi.routes.getFullPath)
    async getFullPath(@DHttpReqParamRequired("finderItemId") finderItemId:string): Promise<typeof finderApi.routes.getFullPath.res> {
        let obj=await FinderItemService.getItemById(finderItemId)
        if(!obj) {
            throw Err.Finder.itemNotFound
        }
        let ret=await obj.getFullPath()
        return {
            path:ret
        };
    }

    @DHttpApi(finderApi.routes.search)
    async search(@DHttpReqParamRequired("keyword") keyword:string,@DHttpReqParam("folderId") folderId:string,@DHttpUser user:IUserSession): Promise<typeof finderApi.routes.search.res> {
        let ret=await FinderItemService.search(folderId?folderId:null, keyword, user.userId)
        return ret;

    }
}