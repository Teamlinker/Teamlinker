import { Entity } from "../../common/entity/entity";
import { commentModel } from './../../../common/model/comment';
import { commentMapper } from './../mapper/comment';

export class CommentService extends Entity<typeof commentModel,typeof commentMapper> {
    constructor(){
        super(commentMapper)
    }

    static async list(typeId:string) {
        let ret=await commentMapper.list(typeId)
        return ret;
    }

}