import {
    IMFavoriteMessageService,
    IMTeamMessageService,
    IMUnReadMessageService,
    IMUserMessageService
} from "../service/im";

class RpcIMApi  {
    async clearByOrganizationId(orgaizationId:string) {
        await Promise.all([
            IMUserMessageService.clearByOrganizationId(orgaizationId),
            IMTeamMessageService.clearByOrganizationId(orgaizationId),
            IMUserMessageService.clearByOrganizationId(orgaizationId),
            IMFavoriteMessageService.clearByOrganizationId(orgaizationId)
        ])
    }
    async clearByOrganizationUserId(organizationUserId:string) {
        await Promise.all([
            IMFavoriteMessageService.clearByOrganizationUserId(organizationUserId),
            IMUnReadMessageService.clearByOrganizationId(organizationUserId)
        ])
    }
}

export default new RpcIMApi;