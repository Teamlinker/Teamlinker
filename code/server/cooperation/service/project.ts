import { Entity } from "../../common/entity/entity";
import { projectMapper } from '../mapper/project';
import { projectModel } from './../../../common/model/project';
export default class Project extends Entity<typeof projectModel,typeof projectMapper> {
    constructor(){
        super(projectMapper)
    }
}