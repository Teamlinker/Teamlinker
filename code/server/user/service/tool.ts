import {Entity} from "../../common/entity/entity";
import {stickyNoteModel} from "../../../common/model/sticky_note";
import {photoMapper, stickyNoteMapper} from "../mapper/tool";
import {IServer_Common_Event_Types} from "../../common/event/types";
import rpcContentApi from "../../content/rpc/content";
import {ECommon_Model_Content_Type} from "../../../common/model/content";
import {ICommon_Route_Res_Photo_item, ICommon_Route_Res_Sticky_Note_Item} from "../../../common/routes/response";
import {photoModel} from "../../../common/model/photo";
import rpcFileApi from "../../file/rpc/file"

export class StickyNoteService extends Entity<typeof stickyNoteModel,typeof stickyNoteMapper> {
    constructor() {
        super(stickyNoteMapper)
    }

    override async create(): Promise<typeof stickyNoteModel["model"]> {
        let ret=await super.create();
        let objContent=await rpcContentApi.add(this.getId(),ECommon_Model_Content_Type.STICKY_NOTE,null,"",this.getItem().user_id)
        this.assignItem({
            content_id:objContent.id
        })
        ret=await this.update()
        return ret;
    }

    override async update(content?:string): Promise<typeof stickyNoteModel["model"]> {
        if(content) {
            await rpcContentApi.edit(this.getItem().content_id,null,content)
        }
        let ret=await super.update();
        return ret;
    }

    override async delete(eventPublish?: keyof IServer_Common_Event_Types, ...param): Promise<void> {
        await rpcContentApi.remove(this.getItem().content_id)
        await super.delete(eventPublish, ...param);
    }

    static async list(userId:string) {
        let arr=await stickyNoteMapper.list(userId)
        let arrContent=await Promise.all(arr.map(obj=>{
            return rpcContentApi.get(obj.id,ECommon_Model_Content_Type.STICKY_NOTE)
        }))
        let ret:ICommon_Route_Res_Sticky_Note_Item[]=[]
        for(let i=0;i<arr.length;i++) {
            ret[i]={
                ...arr[i],
                content:arrContent[i]
            }
        }
        return ret;
    }

    static async clear(userId:string) {
        await stickyNoteMapper.clear(userId)
    }
}

export class PhotoService extends Entity<typeof photoModel,typeof photoMapper> {
    constructor() {
        super(photoMapper)
    }

    static async list(userId:string) {
        let arr=await photoMapper.list(userId)
        let arrFile=await Promise.all(arr.map(item=>{
            return rpcFileApi.getPath(item.file_id)
        }))
        let ret:ICommon_Route_Res_Photo_item[]=[]
        for(let i=0;i<arr.length;i++) {
            ret[i]={
                ...arr[i],
                path:arrFile[i]
            }
        }
        return ret;
    }

    static async clear(userId:string) {
        await photoMapper.clear(userId)
    }
}