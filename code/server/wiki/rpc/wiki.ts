import {WikiItemService, WikiService} from "../service/wiki";
import {Err} from "../../../common/status/error";

class RpcCooperationApi  {
    async wiki(wikiId:string) {
        let obj=await WikiService.getItemById(wikiId)
        if(!obj) {
            throw Err.Wiki.wikiNotFound
        }
        return obj.getItem()
    }

    async wikiItem(wikiItemId:string) {
        let obj=await WikiItemService.getItemById(wikiItemId)
        if(!obj) {
            throw Err.Wiki.wikiItemNotFound
        }
        return obj.getItem()
    }

    async clearWiki(organizationId:string) {
        let arr=await WikiService.getItemsByExp({
            organization_id:organizationId
        })
        await Promise.all(arr.map(item=>{
            return item.delete()
        }))
    }
}

export default new RpcCooperationApi()