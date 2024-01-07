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

    async clearMember(organizationUserId:string) {
        await WikiService.clearMember(organizationUserId)
    }

    async createWikiSpace(name:string,organizationUserId:string,organizationId:string) {
        let wiki=new WikiService()
        wiki.assignItem({
            name:name,
            organization_id:organizationId,
            created_by:organizationUserId
        })
        let ret=await wiki.create()
        return ret;
    }

    async createWiki(wikiSpaceId:string,parentId:string,name:string,organizationUserId:string) {
        let obj=new WikiItemService()
        obj.assignItem({
            wiki_id:wikiSpaceId,
            parent_id:parentId,
            name,
            created_by:organizationUserId
        })
        let ret=await obj.create()
        return ret;
    }
}

export default new RpcCooperationApi()