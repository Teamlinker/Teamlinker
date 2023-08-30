import {IMFavoriteMessageService, IMTeamMessageService, IMUserMessageService} from "../service/im";

class RpcIMApi  {
    async clearByOrganizationId(orgaizationId:string) {
        await Promise.all([
            IMUserMessageService.clearByOrganizationId(orgaizationId),
            IMTeamMessageService.clearByOrganizationId(orgaizationId),
            IMUserMessageService.clearByOrganizationId(orgaizationId),
            IMFavoriteMessageService.clearByOrganizationId(orgaizationId)
        ])
    }
}

export default new RpcIMApi;