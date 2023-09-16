import {FinderItemService} from "../service/finder";

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
}

export default new RpcFinderApi()