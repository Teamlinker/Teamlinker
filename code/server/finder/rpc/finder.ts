import {FinderItemService} from "../service/finder";
import {ECommon_Model_Finder_Item_Type} from "../../../common/model/finder_item";

class RpcFinderApi {
    async clearByOrganizationId(organizationId:string) {
        await FinderItemService.clearByOrganizationId(organizationId)
    }

    async clearByOrganizationAndUserId(organizationId:string,userId:string) {
        await FinderItemService.clearByOrganizationAndUserId(organizationId,userId)
    }

    async clearByUserId(userId:string) {
        await FinderItemService.clearByUserId(userId)
    }

    async createFolder(userId:string,name:string,parentFolderId:string) {
        let obj=new FinderItemService()
        obj.assignItem({
            name,
            created_by_pure:userId,
            parent_folder_id:parentFolderId,
            type:ECommon_Model_Finder_Item_Type.FOLDER
        })
        let ret=await obj.create()
        return ret;
    }
}

export default new RpcFinderApi()