import { Err } from "../../../common/status/error";
import { Entity } from "../../common/entity/entity";
import { projectLabelModel } from './../../../common/model/project_label';
import { tagMapper } from './../mapper/tag';
export default class ProjectTag extends Entity<typeof projectLabelModel,typeof tagMapper> {
    constructor(){
        super(tagMapper)
    }
    async listTag(page:number,size:number,keyword:string){
        if(page<0 || size<=0){
            throw Err.Project.Tag.tagSizeEmpty
        }
        let ret=await tagMapper.listTag(this.item.project_id,page,size,keyword)
        return ret
    }
}