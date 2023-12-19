import {DComponent} from "../../common/decorate/component";
import {DHttpApi, DHttpController, DHttpReqParam, DHttpReqParamRequired, DHttpUser} from "../../common/http/http";
import notificationApi from "../../../common/routes/notification";
import {IUserSession} from "../../user/types/config";
import {ECommon_Model_Notification_Status, ECommon_Model_Notification_Type} from "../../../common/model/notification";
import {NotificationService} from "../service/notification";
import {Err} from "../../../common/status/error";
import {emitServiceEvent} from "../../common/event/event";

@DComponent
@DHttpController(notificationApi)
class NotificationController {
    @DHttpApi(notificationApi.routes.list)
    async list(@DHttpReqParam("types") types:ECommon_Model_Notification_Type[],@DHttpReqParamRequired("page") page:number,@DHttpReqParamRequired("size") size:number,@DHttpUser user: IUserSession): Promise<typeof notificationApi.routes.list.res> {
        let ret=await NotificationService.list(user.userId,types,page,size)
        return ret;
    }
    @DHttpApi(notificationApi.routes.unReadCount)
    async unReadCount(@DHttpUser user: IUserSession): Promise<typeof notificationApi.routes.unReadCount.res> {
        let ret=await NotificationService.unReadCount(user.userId)
        return {
            count:ret
        };
    }
    @DHttpApi(notificationApi.routes.read)
    async read(@DHttpReqParamRequired("notificationId") notificationId:string,@DHttpUser user: IUserSession): Promise<typeof notificationApi.routes.read.res> {
        let ret=await NotificationService.getItemById(notificationId)
        if(!ret) {
            throw Err.Notification.notificationNotFound
        }
        ret.assignItem({
            is_read:1
        })
        await ret.update()
        return
    }
    @DHttpApi(notificationApi.routes.setStatus)
    async setStatus(@DHttpReqParamRequired("notificationId") notificationId:string,@DHttpReqParamRequired("status") status:ECommon_Model_Notification_Status,@DHttpUser user: IUserSession): Promise<typeof notificationApi.routes.setStatus.res> {
        let ret=await NotificationService.getItemById(notificationId)
        if(!ret) {
            throw Err.Notification.notificationNotFound
        } else if(ret.getItem().status!==ECommon_Model_Notification_Status.PENDING) {
            throw Err.Notification.notificationStatusNotMatch
        }
        ret.assignItem({
            status
        })
        let obj=await ret.update()
        if(status===ECommon_Model_Notification_Status.RESOLVED) {
            emitServiceEvent("notificationResolved",obj)
        }
        return;
    }
    @DHttpApi(notificationApi.routes.info)
    async info(@DHttpReqParamRequired("notificationId") notificationId:string): Promise<typeof notificationApi.routes.info.res> {
        let obj=await NotificationService.getItemById(notificationId)
        let ret=await obj.info()
        return ret;
    }

    @DHttpApi(notificationApi.routes.remove)
    async remove(@DHttpReqParamRequired("notificationId") notificationId:string): Promise<typeof notificationApi.routes.remove.res> {
        let obj=await NotificationService.getItemById(notificationId)
        await obj?.delete()
        return;
    }
}