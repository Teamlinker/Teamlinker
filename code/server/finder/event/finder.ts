import {DComponent} from "../../common/decorate/component";
import {DEventListener} from "../../common/event/event";
import {FinderItemService} from "../service/finder";
import {ECommon_Model_Finder_Status} from "../../../common/model/finder_item";

@DComponent
class FinderEvents {
    @DEventListener("fileUpload")
    async fileUpload(meta:string,fileId:string) {
        let obj=await FinderItemService.getItemById(meta)
        if(obj) {
            obj.assignItem({
                file_id:fileId,
                status:ECommon_Model_Finder_Status.READY
            })
            await obj.update()
        }
    }
}