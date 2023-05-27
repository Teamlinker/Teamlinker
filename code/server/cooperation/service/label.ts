import {Err} from "../../../common/status/error";
import {Entity} from "../../common/entity/entity";
import {projectLabelModel} from './../../../common/model/project_label';
import {labelMapper} from '../mapper/label';
import {IServer_Common_Event_Types} from "../../common/event/types";

export class ProjectLabelService extends Entity<typeof projectLabelModel,typeof labelMapper> {
    constructor(){
        super(labelMapper)
    }
    async listTag(page:number,size:number,keyword:string){
        if(page<0 || size<=0){
            throw Err.Project.Label.labelSizeEmpty
        }
        let ret=await labelMapper.listLabel(this.item.project_id,page,size,keyword)
        return ret
    }

    override async delete(eventPublish?: keyof IServer_Common_Event_Types): Promise<void> {
        await super.delete(eventPublish);
        await labelMapper.clearByLabelId(this.getId());
    }
}