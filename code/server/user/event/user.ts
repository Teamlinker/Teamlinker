import {DComponent} from "../../common/decorate/component";
import {DEventListener} from "../../common/event/event";
import {OrganizationService, OrganizationUserService} from "../service/organization";


@DComponent
class EventUser {
    @DEventListener("userDelete")
    async delete(userId:string) {
        try {
            let arr=await OrganizationUserService.getItemsByExp({
                user_id:userId
            })
            for(let obj of arr) {
                OrganizationService.getItemById(obj.getItem().organization_id).then(value => {
                    value.removeUser(obj.getId())
                })
            }
        } catch (err) {
            console.log(err)
        }

    }
}