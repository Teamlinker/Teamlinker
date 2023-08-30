import {FinderItemService} from "../service/finder";

class RpcFinderApi {
    async clearByOrganizationId(organizationId:string) {
        await FinderItemService.clearByOrganizationId(organizationId)
    }
}

export default new RpcFinderApi()