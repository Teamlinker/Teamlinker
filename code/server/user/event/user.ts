import {DComponent} from "../../common/decorate/component";
import {DEventListener} from "../../common/event/event";
import {EServer_Common_Event_Types} from "../../common/event/types";


@DComponent
class EventUser {
    @DEventListener(EServer_Common_Event_Types.User.DELETE)
    async delete(userId:string) {
        
    }
}