import {Err} from "../../../common/status/error";
import {Entity} from "../../common/entity/entity";
import {projectLabelModel} from './../../../common/model/project_label';
import {labelIssueMapper, labelMapper} from '../mapper/label';
import {IServer_Common_Event_Types} from "../../common/event/types";
import {projectLabelIssueModel} from "../../../common/model/project_label_issue";

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
        await ProjectLabelIssueService.batchDelete({
            project_label_id:this.getId()
        },true)
    }

    static async clearByProjectId(projectId:string) {
        await ProjectLabelService.batchDelete({
            project_id:projectId
        },false)
    }
}

export class ProjectLabelIssueService extends Entity<typeof projectLabelIssueModel,typeof labelIssueMapper> {
    constructor() {
        super(labelIssueMapper)
    }
}