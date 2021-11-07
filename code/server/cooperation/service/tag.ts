import { Entity } from "../../common/entity/entity";
import { projectLabelModel } from './../../../common/model/project_label';
import { tagMapper } from './../mapper/tag';
export default class ProjectTag extends Entity<typeof projectLabelModel,typeof tagMapper> {
    
}