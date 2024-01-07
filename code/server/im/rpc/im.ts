import {
    IMFavoriteMessageService,
    IMTeamMessageService,
    IMUnReadMessageService,
    IMUserMessageService
} from "../service/im";

class RpcIMApi  {
    async clearByOrganizationId(organizationId:string) {
        await Promise.all([
            IMUserMessageService.clearByOrganizationId(organizationId),
            IMTeamMessageService.clearByOrganizationId(organizationId),
            IMUserMessageService.clearByOrganizationId(organizationId),
            IMFavoriteMessageService.clearByOrganizationId(organizationId)
        ])
    }
    async clearByOrganizationUserId(organizationUserId:string,deletedOrganizationUserId:string) {
        await Promise.all([
            IMFavoriteMessageService.clearByOrganizationUserId(organizationUserId),
            IMUnReadMessageService.clearByOrganizationId(organizationUserId),
            IMUserMessageService.clearByOrganizationUserId(organizationUserId),
            IMTeamMessageService.clearByOrganizationUserId(organizationUserId, deletedOrganizationUserId)
        ])
    }
}

export default new RpcIMApi;